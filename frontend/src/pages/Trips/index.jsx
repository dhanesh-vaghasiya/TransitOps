import React, { useState, useEffect, useCallback } from 'react';
import TripForm from './TripForm';
import TripList from './TripList';
import TripDetail from './TripDetail';
import { getTrips } from '../../services/tripService';
import { useSocket } from '../../contexts/SocketContext';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { on } = useSocket();

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTrips({ limit: 100 });
      setTrips(res.data?.data?.trips ?? []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips, refreshKey]);

  // Real-time: subscribe to trip:updated socket event
  useEffect(() => {
    const unsub = on?.('trip:updated', () => {
      setRefreshKey((k) => k + 1);
    });
    return () => unsub?.();
  }, [on]);

  const handleTripCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleOpenDetail = (trip) => {
    setSelectedTrip(trip);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTrip(null);
  };

  const handleActionDone = () => {
    handleCloseDetail();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="h-full">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-[22px]">route</span>
          <h1 className="text-headline-md font-outfit text-on-background">Trip Dispatcher</h1>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Create and manage trip manifests — dispatch, track, and complete in real time.
        </p>
      </div>

      {/* Split-view layout */}
      <div className="flex gap-5 items-start">
        {/* Left panel: Create trip form */}
        <div className="w-[400px] shrink-0">
          <TripForm onCreated={handleTripCreated} />
        </div>

        {/* Right panel: Live Board */}
        <div className="flex-1 min-w-0">
          <TripList
            trips={trips}
            loading={loading}
            error={error}
            onOpenDetail={handleOpenDetail}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </div>

      {/* Trip detail modal */}
      {showDetail && selectedTrip && (
        <TripDetail
          trip={selectedTrip}
          onClose={handleCloseDetail}
          onActionDone={handleActionDone}
        />
      )}
    </div>
  );
};

export default TripsPage;
