import Navbar from '../components/Navbar';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function densityColor(w) {
  if (w > 0.75) return '#ef4444';
  if (w > 0.5) return '#f97316';
  if (w > 0.25) return '#eab308';
  return '#22c55e';
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 16, { duration: 1.5 });
  }, [coords, map]);
  return null;
}

function speakAlert(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  msg.pitch = 1;
  msg.volume = 1;
  window.speechSynthesis.speak(msg);
}

export default function MapView() {
  const [points, setPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchDensity, setSearchDensity] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState('search');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeAlerts, setRouteAlerts] = useState([]);
  const [navigating, setNavigating] = useState(false);
  const [crowdAlongRoute, setCrowdAlongRoute] = useState([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await axios.get('https://crowd-backend-0m8x.onrender.com/api/crowd/heatmap');
        setPoints(res.data.points);
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 5000);
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
    return () => clearInterval(interval);
  }, []);

  const geocode = async (query) => {
    const res = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1&addressdetails=1');
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      name: data[0].display_name
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await geocode(searchQuery);
      if (!result) { alert('Location not found. Try a more specific name.'); setSearching(false); return; }
      setSearchResult(result);
      const densityRes = await axios.post('https://crowd-backend-0m8x.onrender.com/api/crowd/heatmap/location', {
        lat: result.lat,
        lng: result.lng,
        location_name: searchQuery.toLowerCase()
      });
      setSearchDensity(densityRes.data);
      const newPoints = densityRes.data.points.map((p) => ({ ...p, isSearch: true }));
      setPoints((prev) => [...prev.filter((p) => !p.isSearch), ...newPoints]);
      await axios.post('https://crowd-backend-0m8x.onrender.com/api/alerts/map-search', {
        location: result.name,
        lat: result.lat,
        lng: result.lng,
        density: densityRes.data.overall_density,
        signal_strength: densityRes.data.signal_strength
      });
      const signal = densityRes.data.signal_strength;
      let voiceText = '';
      if (signal < 30) voiceText = searchQuery + ' is very safe. Only ' + Math.round(signal) + ' percent crowd density. You can visit comfortably.';
      else if (signal < 50) voiceText = searchQuery + ' has normal crowd at ' + Math.round(signal) + ' percent. Proceed with caution.';
      else if (signal < 70) voiceText = 'Attention! ' + searchQuery + ' has higher than normal crowd at ' + Math.round(signal) + ' percent. Stay alert.';
      else if (signal < 85) voiceText = 'Warning! ' + searchQuery + ' has high crowd density of ' + Math.round(signal) + ' percent. Consider alternate route.';
      else voiceText = 'Danger! Critical crowd at ' + searchQuery + '. Density is ' + Math.round(signal) + ' percent. Avoid this area immediately.';
      speakAlert(voiceText);
    } catch { alert('Search failed. Try again.'); }
    finally { setSearching(false); }
  };

  const handleNavigate = async () => {
    if (!startPoint.trim() || !endPoint.trim()) { alert('Please enter both start and end points'); return; }
    setNavigating(true);
    try {
      const [start, end] = await Promise.all([geocode(startPoint), geocode(endPoint)]);
      if (!start) { alert('Start location not found. Try a more specific name.'); setNavigating(false); return; }
      if (!end) { alert('End location not found. Try a more specific name.'); setNavigating(false); return; }
      setStartCoords(start);
      setEndCoords(end);
      const routeRes = await fetch('https://router.project-osrm.org/route/v1/driving/' + start.lng + ',' + start.lat + ';' + end.lng + ',' + end.lat + '?overview=full&geometries=geojson&steps=true');
      const routeData = await routeRes.json();
      if (routeData.code !== 'Ok') { alert('Could not find route. Try different locations.'); setNavigating(false); return; }
      const coords = routeData.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      setRoutePoints(coords);
      const steps = routeData.routes[0].legs[0].steps;
      const alerts = [];
      const crowdPoints = [];
      for (let i = 0; i < Math.min(steps.length, 8); i++) {
        const step = steps[i];
        const stepLat = step.maneuver.location[1];
        const stepLng = step.maneuver.location[0];
        const densityRes = await axios.post('https://crowd-backend-0m8x.onrender.com/api/crowd/heatmap/location', {
          lat: stepLat,
          lng: stepLng,
          location_name: step.name || 'road'
        });
        const signal = densityRes.data.signal_strength;
        crowdPoints.push({
          lat: stepLat,
          lng: stepLng,
          signal: signal,
          density: densityRes.data.overall_density,
          name: step.name || 'Unnamed road',
          weight: signal / 100
        });
        if (signal > 60) {
          alerts.push({
            name: step.name || 'Unnamed road',
            signal: signal,
            density: densityRes.data.overall_density,
            lat: stepLat,
            lng: stepLng
          });
        }
      }
      setCrowdAlongRoute(crowdPoints);
      setRouteAlerts(alerts);
      const distance = (routeData.routes[0].distance / 1000).toFixed(1);
      const duration = Math.round(routeData.routes[0].duration / 60);
      let voiceText = 'Route found from ' + startPoint + ' to ' + endPoint + '. Distance is ' + distance + ' kilometers, approximately ' + duration + ' minutes. ';
      if (alerts.length > 0) {
        voiceText += 'Warning! ' + alerts.length + ' crowded areas detected along your route. ';
        voiceText += 'High crowd expected at: ' + alerts.slice(0, 2).map((a) => a.name || 'unnamed road').join(' and ') + '. Drive carefully.';
      } else {
        voiceText += 'Good news! Your route is clear with no major crowd density detected. Have a safe journey!';
      }
      speakAlert(voiceText);
    } catch (err) { console.error(err); alert('Navigation failed. Please try again.'); }
    finally { setNavigating(false); }
  };

  const getDensityBorder = (density) => {
    if (density === 'Critical') return 'border-red-500 bg-red-500/10 text-red-300';
    if (density === 'High') return 'border-orange-500 bg-orange-500/10 text-orange-300';
    if (density === 'Medium') return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
    return 'border-green-500 bg-green-500/10 text-green-300';
  };

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-cyan-400'>Live Crowd Map</h1>
          <p className='text-gray-400 mt-1'>Search any place or navigate with crowd alerts</p>
        </div>

        <div className='flex gap-3 mb-4'>
          <button
            onClick={() => setMode('search')}
            className={'px-6 py-3 rounded-xl font-bold text-sm transition ' + (mode === 'search' ? 'bg-cyan-500 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white')}
          >
            Search Place
          </button>
          <button
            onClick={() => setMode('navigate')}
            className={'px-6 py-3 rounded-xl font-bold text-sm transition ' + (mode === 'navigate' ? 'bg-cyan-500 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white')}
          >
            Navigate (Start to End)
          </button>
        </div>

        {mode === 'search' && (
          <div className='flex gap-3 mb-4'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='Search any place, road, area... e.g. Anna Nagar 2nd Street Chennai'
              className='flex-1 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500'
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className='bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-3 rounded-xl transition'
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        )}

        {mode === 'navigate' && (
          <div className='bg-gray-900 border border-cyan-500/20 rounded-2xl p-5 mb-4'>
            <p className='text-sm text-gray-400 mb-3'>Enter start and end points to see crowd alerts along your route</p>
            <div className='space-y-3'>
              <div className='flex gap-3 items-center'>
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>A</div>
                <input
                  type='text'
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder='Start point e.g. Tambaram Chennai'
                  className='flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500'
                />
              </div>
              <div className='flex gap-3 items-center'>
                <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0'>B</div>
                <input
                  type='text'
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  placeholder='End point e.g. Marina Beach Chennai'
                  className='flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500'
                />
              </div>
              <button
                onClick={handleNavigate}
                disabled={navigating}
                className='w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition'
              >
                {navigating ? 'Calculating route...' : 'Find Route with Crowd Alerts'}
              </button>
            </div>
          </div>
        )}

        {searchDensity && searchResult && mode === 'search' && (
          <div className={'border rounded-xl p-5 mb-4 ' + getDensityBorder(searchDensity.overall_density)}>
            <div className='flex justify-between items-start'>
              <div className='flex-1'>
                <p className='font-bold text-lg'>{searchDensity.overall_density} Crowd Density</p>
                <p className='text-sm mt-1 opacity-80 truncate max-w-md'>{searchResult.name}</p>
              </div>
              <div className='text-right flex-shrink-0 ml-4'>
                <p className='text-3xl font-bold'>{searchDensity.signal_strength}%</p>
                <p className='text-xs opacity-60'>crowd level</p>
              </div>
            </div>
            <div className='mt-3 w-full bg-gray-700 rounded-full h-2'>
              <div
                className='h-2 rounded-full transition-all'
                style={{
                  width: searchDensity.signal_strength + '%',
                  backgroundColor: searchDensity.signal_strength >= 85 ? '#ef4444' : searchDensity.signal_strength >= 70 ? '#f97316' : searchDensity.signal_strength >= 50 ? '#eab308' : '#22c55e'
                }}
              />
            </div>
          </div>
        )}

        {routeAlerts.length > 0 && mode === 'navigate' && (
          <div className='bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4'>
            <p className='font-bold text-red-400 mb-3'>Crowd Alerts Along Your Route</p>
            <div className='space-y-2'>
              {routeAlerts.map((alert, i) => (
                <div key={i} className='flex items-center justify-between bg-gray-900 rounded-xl px-4 py-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-red-400'>?</span>
                    <p className='text-sm text-white'>{alert.name}</p>
                  </div>
                  <span className='text-xs font-bold text-red-400'>{alert.signal}% crowd</span>
                </div>
              ))}
            </div>
            <p className='text-xs text-red-300 mt-2 opacity-70'>Voice alert has been triggered for these locations</p>
          </div>
        )}

        {crowdAlongRoute.length > 0 && mode === 'navigate' && routeAlerts.length === 0 && (
          <div className='bg-green-500/10 border border-green-500 rounded-xl p-4 mb-4'>
            <p className='font-bold text-green-400'>Route is Clear!</p>
            <p className='text-sm text-gray-400 mt-1'>No major crowd density detected along your route. Safe to travel!</p>
          </div>
        )}

        <div className='flex gap-4 mb-4 flex-wrap'>
          {[
            {label:'Safe (0-30%)', color:'bg-green-500'},
            {label:'Normal (30-50%)', color:'bg-yellow-400'},
            {label:'Moderate (50-70%)', color:'bg-yellow-500'},
            {label:'High (70-85%)', color:'bg-orange-500'},
            {label:'Critical (85%+)', color:'bg-red-500'},
            {label:'You', color:'bg-cyan-400'},
            {label:'Route', color:'bg-blue-500'},
          ].map((item) => (
            <div key={item.label} className='flex items-center gap-2'>
              <div className={'w-3 h-3 rounded-full ' + item.color} />
              <span className='text-xs text-gray-400'>{item.label}</span>
            </div>
          ))}
        </div>

        <div className='rounded-2xl overflow-hidden border border-cyan-500/20' style={{height:'550px'}}>
          {loading ? (
            <div className='w-full h-full bg-gray-900 flex items-center justify-center'>
              <p className='text-cyan-400 animate-pulse'>Loading map...</p>
            </div>
          ) : (
            <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{height:'100%', width:'100%'}}>
              <TileLayer
                attribution='OpenStreetMap'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              {searchResult && mode === 'search' && <FlyTo coords={searchResult} />}
              {startCoords && mode === 'navigate' && <FlyTo coords={startCoords} />}

              {userLocation && (
                <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={12} fillColor='#00f5ff' fillOpacity={1} color='#fff' weight={3}>
                  <Popup><div style={{color:'#000'}}><strong>Your Location</strong></div></Popup>
                </CircleMarker>
              )}

              {searchResult && mode === 'search' && (
                <CircleMarker center={[searchResult.lat, searchResult.lng]} radius={18} fillColor='#a855f7' fillOpacity={0.9} color='#fff' weight={2}>
                  <Popup>
                    <div style={{color:'#000', maxWidth:'200px'}}>
                      <strong>Searched Location</strong><br/>
                      <span style={{fontSize:'11px'}}>{searchResult.name?.substring(0, 60)}</span><br/>
                      {searchDensity && <strong>Density: {searchDensity.overall_density} ({searchDensity.signal_strength}%)</strong>}
                    </div>
                  </Popup>
                </CircleMarker>
              )}

              {startCoords && (
                <CircleMarker center={[startCoords.lat, startCoords.lng]} radius={14} fillColor='#22c55e' fillOpacity={1} color='#fff' weight={2}>
                  <Popup><div style={{color:'#000'}}><strong>Start: {startCoords.name?.substring(0, 40)}</strong></div></Popup>
                </CircleMarker>
              )}

              {endCoords && (
                <CircleMarker center={[endCoords.lat, endCoords.lng]} radius={14} fillColor='#ef4444' fillOpacity={1} color='#fff' weight={2}>
                  <Popup><div style={{color:'#000'}}><strong>End: {endCoords.name?.substring(0, 40)}</strong></div></Popup>
                </CircleMarker>
              )}

              {routePoints.length > 0 && (
                <Polyline positions={routePoints} color='#3b82f6' weight={5} opacity={0.8} />
              )}

              {crowdAlongRoute.map((cp, i) => (
                <CircleMarker
                  key={i}
                  center={[cp.lat, cp.lng]}
                  radius={cp.signal > 70 ? 14 : 8}
                  fillColor={cp.signal >= 85 ? '#ef4444' : cp.signal >= 70 ? '#f97316' : cp.signal >= 50 ? '#eab308' : '#22c55e'}
                  fillOpacity={0.8}
                  color='#fff'
                  weight={1}
                >
                  <Popup>
                    <div style={{color:'#000'}}>
                      <strong>{cp.name}</strong><br/>
                      Crowd: {cp.signal}%<br/>
                      Status: {cp.density}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {points.map((point, i) => (
                <CircleMarker
                  key={i}
                  center={[point.lat, point.lng]}
                  radius={point.weight * 18}
                  fillColor={densityColor(point.weight)}
                  fillOpacity={0.5}
                  color={densityColor(point.weight)}
                  weight={1}
                >
                  <Popup>
                    <div style={{color:'#000'}}>
                      Density: {(point.weight * 100).toFixed(0)}%
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        <div className='mt-4 bg-gray-900 border border-cyan-500/20 rounded-xl p-4'>
          <p className='text-cyan-400 text-sm font-bold mb-2'>How to use</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='bg-gray-800 rounded-xl p-3'>
              <p className='text-xs font-bold text-white mb-1'>Search Place</p>
              <p className='text-xs text-gray-400'>Type any place, road or area name. Works with small streets too. Voice alert tells you crowd level automatically.</p>
            </div>
            <div className='bg-gray-800 rounded-xl p-3'>
              <p className='text-xs font-bold text-white mb-1'>Navigate</p>
              <p className='text-xs text-gray-400'>Enter start and end point. Route is shown on map with crowd density at each point. Voice alert warns about crowded roads.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}