import React from 'react';
import StatusPill from '../../components/ui/StatusPill';
import GlassCard from '../../components/ui/GlassCard';

const TripCard = ({ trip, onOpenDetail }) => {
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="p-4 bg-surface-container-high rounded-xl border border-outline-variant hover:border-primary/40 transition-all cursor-pointer group"
      onClick={() => onOpenDetail(trip)}
      data-element-id={`trip-card-${trip.id}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-mono text-[11px] text-on-surface-variant">{trip.tripNumber}</p>
          <p className="text-body-md text-on-background font-medium mt-0.5 group-hover:text-primary transition-colors">
            {trip.source} → {trip.destination}
          </p>
        </div>
        <StatusPill status={trip.status} />
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {/* Vehicle */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-body-sm text-on-surface-variant border border-outline-variant">
          <span className="material-symbols-outlined text-[13px] text-primary">directions_bus</span>
          <span className="truncate max-w-[100px]">{trip.vehicle?.name ?? '—'}</span>
        </div>
        {/* Driver */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-body-sm text-on-surface-variant border border-outline-variant">
          <span className="material-symbols-outlined text-[13px] text-primary">person</span>
          <span className="truncate max-w-[80px]">{trip.driver?.name ?? '—'}</span>
        </div>
        {/* Cargo */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-body-sm text-on-surface-variant border border-outline-variant">
          <span className="material-symbols-outlined text-[13px]">inventory_2</span>
          <span>{parseFloat(trip.cargoWeight).toFixed(0)} kg</span>
        </div>
        {/* Distance */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-body-sm text-on-surface-variant border border-outline-variant">
          <span className="material-symbols-outlined text-[13px]">straighten</span>
          <span>{parseFloat(trip.plannedDistance).toFixed(0)} km</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant">
        <span className="text-[10px] text-on-surface-variant">
          Created {formatDate(trip.createdAt)}
        </span>
        {trip.startedAt && trip.status === 'dispatched' && (
          <span className="text-[10px] text-blue-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            Departed {formatDate(trip.startedAt)}
          </span>
        )}
        {trip.status === 'completed' && (
          <span className="text-[10px] text-emerald-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            Done {formatDate(trip.completedAt)}
          </span>
        )}
      </div>
    </div>
  );
};

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Transit', value: 'dispatched' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const TripList = ({ trips, loading, error, onOpenDetail, onRefresh }) => {
  const [filter, setFilter] = React.useState('');

  const filtered = filter ? trips.filter((t) => t.status === filter) : trips;

  const activeCount = trips.filter((t) => t.status === 'dispatched').length;
  const draftCount = trips.filter((t) => t.status === 'draft').length;

  return (
    <GlassCard className="p-5 h-full">
      {/* Live Board header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined text-primary text-[20px]">dynamic_feed</span>
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-400 text-[9px] text-black font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <h2 className="text-title-sm font-outfit text-on-background font-semibold">Live Board</h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] text-blue-300 font-medium">LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stat badges */}
          <span className="text-[10px] text-on-surface-variant px-2 py-1 rounded-lg bg-surface-container border border-outline-variant">
            {activeCount} in transit
          </span>
          <span className="text-[10px] text-on-surface-variant px-2 py-1 rounded-lg bg-surface-container border border-outline-variant">
            {draftCount} draft
          </span>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
            title="Refresh"
            data-element-id="trip-list-refresh"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-surface-container rounded-lg">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex-1 py-1.5 rounded-md text-[10px] uppercase tracking-wide font-medium transition-all ${
              filter === opt.value
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            data-element-id={`filter-${opt.value || 'all'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-on-error-container text-[40px] mb-2">error_outline</span>
          <p className="text-body-md text-on-surface-variant">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-3 px-4 py-2 rounded-lg border border-outline-variant text-body-sm text-on-surface-variant hover:text-on-surface transition-all"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[40px] mb-2">local_shipping</span>
          <p className="text-body-md text-on-surface-variant">
            {filter ? `No ${filter} trips` : 'No trips yet — create your first dispatch!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default TripList;
