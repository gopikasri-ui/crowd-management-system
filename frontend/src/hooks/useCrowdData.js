import { useState, useEffect } from "react";
import axios from "axios";

export function useCrowdData() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [crowdRes, alertsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/crowd/live"),
        axios.get("http://localhost:8000/api/alerts/live"),
      ]);
      setData(crowdRes.data);
      setAlerts(alertsRes.data.alerts);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { data, alerts, loading };
}