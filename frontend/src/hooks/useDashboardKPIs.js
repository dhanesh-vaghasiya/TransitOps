import { useState, useEffect, useCallback } from 'react';
import reportService from '../services/reportService';
import { useSocket } from '../contexts/SocketContext';

export const useDashboardKPIs = (filters) => {
  const [data, setData] = useState({ kpis: null, recentTrips: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { on } = useSocket();

  const fetchKPIs = useCallback(async () => {
    try {
      // Don't set loading to true if we already have data (silent refresh)
      if (!data.kpis) setLoading(true);
      const res = await reportService.getDashboardKPIs(filters);
      setData(res);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard KPIs:', err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [filters, data.kpis]);

  useEffect(() => {
    fetchKPIs();
  }, [filters]);

  useEffect(() => {
    // Subscribe to real-time events that affect KPIs
    const unsubVehicle = on('vehicle:status-changed', fetchKPIs);
    const unsubDriver = on('driver:status-changed', fetchKPIs);
    const unsubTrip = on('trip:updated', fetchKPIs);

    return () => {
      unsubVehicle?.();
      unsubDriver?.();
      unsubTrip?.();
    };
  }, [on, fetchKPIs]);

  return { data, loading, error, refetch: fetchKPIs };
};
