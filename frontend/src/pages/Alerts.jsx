import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [mapHistory, setMapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('detection');

  const fetchAll = async () => {
    try {
      const r1 = await axios.get('https://crowd-backend-0m8x.onrender.com/api/alerts/live');
      const r2 = await axios.get('https://crowd-backend-0m8x.onrender.com/api/alerts/map-history');
      setAlerts(r1.data.alerts || []);
      setMapHistory(r2.data.searches || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearDetection = async () => {
    await axios.delete('https://crowd-backend-0m8x.onrender.com/api/alerts/clear');
    fetchAll();
  };

  const clearMap = async () => {
    await axios.delete('https://crowd-backend-0m8x.onrender.com/api/alerts/map-history/clear');
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 5000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (ts) => {
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-red-400 mb-2'>Crowd Alerts</h1>
        <p className='text-gray-400 mb-6'>Camera detection alerts and map search history</p>

        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-gray-900 border border-red-500/20 rounded-xl p-4'>
            <p className='text-xs text-gray-400 uppercase'>Detection Alerts</p>
            <p className='text-3xl font-bold text-red-400 mt-1'>{alerts.length}</p>
          </div>
          <div className='bg-gray-900 border border-cyan-500/20 rounded-xl p-4'>
            <p className='text-xs text-gray-400 uppercase'>Places Searched</p>
            <p className='text-3xl font-bold text-cyan-400 mt-1'>{mapHistory.length}</p>
          </div>
          <div className='bg-gray-900 border border-orange-500/20 rounded-xl p-4'>
            <p className='text-xs text-gray-400 uppercase'>Critical Found</p>
            <p className='text-3xl font-bold text-orange-400 mt-1'>
              {[...alerts, ...mapHistory].filter((a) => a.density === 'Critical').length}
            </p>
          </div>
        </div>

        <div className='flex gap-3 mb-6'>
          <button onClick={() => setTab('detection')} className={tab === 'detection' ? 'px-5 py-2 rounded-xl font-bold text-sm bg-red-500 text-white' : 'px-5 py-2 rounded-xl font-bold text-sm bg-gray-800 text-gray-400'}>
            Camera Alerts
          </button>
          <button onClick={() => setTab('map')} className={tab === 'map' ? 'px-5 py-2 rounded-xl font-bold text-sm bg-cyan-500 text-gray-950' : 'px-5 py-2 rounded-xl font-bold text-sm bg-gray-800 text-gray-400'}>
            Map Search History
          </button>
        </div>

        {loading && <p className='text-cyan-400 animate-pulse'>Loading...</p>}

        {!loading && tab === 'detection' && (
          <div>
            <div className='flex justify-between items-center mb-4'>
              <p className='text-sm text-gray-400'>Alerts from USB Webcam and IP Camera detection</p>
              <button onClick={clearDetection} className='px-4 py-2 bg-red-900 text-red-300 rounded-xl text-xs font-bold'>Clear All</button>
            </div>
            {alerts.length === 0 ? (
              <div className='bg-gray-900 border border-gray-700 rounded-xl p-10 text-center'>
                <p className='text-5xl mb-4'>??</p>
                <p className='text-white font-bold'>No camera alerts yet</p>
                <p className='text-gray-500 text-sm mt-2'>Connect your camera or upload a photo in AI Detection page</p>
                <a href='/detection' className='inline-block mt-4 px-6 py-3 bg-cyan-500 text-gray-950 font-bold rounded-xl text-sm'>Go to AI Detection</a>
              </div>
            ) : (
              <div className='space-y-3'>
                {alerts.map((a) => (
                  <div key={a.id} className='border border-red-500 bg-red-500/10 text-red-300 rounded-xl p-5'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-bold text-sm'>{a.message}</p>
                        <p className='text-xs mt-1 opacity-80'>{a.recommendation}</p>
                        <p className='text-xs mt-2 opacity-50'>Source: {a.source} | People: {a.people_count}</p>
                      </div>
                      <p className='text-xs opacity-50 ml-4'>{formatTime(a.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && tab === 'map' && (
          <div>
            <div className='flex justify-between items-center mb-4'>
              <p className='text-sm text-gray-400'>All locations searched in the Live Map</p>
              <button onClick={clearMap} className='px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold'>Clear History</button>
            </div>
            {mapHistory.length === 0 ? (
              <div className='bg-gray-900 border border-gray-700 rounded-xl p-10 text-center'>
                <p className='text-5xl mb-4'>???</p>
                <p className='text-white font-bold'>No searches yet</p>
                <p className='text-gray-500 text-sm mt-2'>Search any location in the Live Map to see its crowd density here</p>
                <a href='/map' className='inline-block mt-4 px-6 py-3 bg-cyan-500 text-gray-950 font-bold rounded-xl text-sm'>Go to Live Map</a>
              </div>
            ) : (
              <div className='space-y-3'>
                {mapHistory.map((s) => (
                  <div key={s.id} className='bg-gray-900 border border-gray-700 rounded-xl p-5'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-lg'>??</span>
                          <p className='font-bold text-white text-sm'>{s.location.substring(0, 60)}...</p>
                        </div>
                        <div className='flex items-center gap-3 mt-2'>
                          <span className={s.density === 'Critical' ? 'text-xs px-3 py-1 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500' : s.density === 'High' ? 'text-xs px-3 py-1 rounded-full font-bold bg-orange-500/20 text-orange-400 border border-orange-500' : s.density === 'Medium' ? 'text-xs px-3 py-1 rounded-full font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500' : 'text-xs px-3 py-1 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500'}>
                            {s.density}
                          </span>
                          <span className='text-xs text-gray-500'>Signal: {s.signal_strength}%</span>
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>{s.recommendation}</p>
                      </div>
                      <p className='text-xs text-gray-500 ml-4 whitespace-nowrap'>{formatTime(s.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={fetchAll} className='mt-6 px-6 py-3 bg-cyan-500 text-gray-950 font-bold rounded-xl'>
          Refresh
        </button>
      </div>
    </div>
  );
}
