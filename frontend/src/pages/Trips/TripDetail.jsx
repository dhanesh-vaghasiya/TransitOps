import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import StatusPill from '../../components/ui/StatusPill';
import { dispatchTrip, completeTrip, cancelTrip } from '../../services/tripService';

const INITIAL_COMPLETE = {
  finalOdometer: '',
  fuelConsumed: '',
  fuelCostPerLiter: '',
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-primary text-[14px]">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="text-body-sm text-on-background font-medium">{value ?? '—'}</p>
    </div>
  </div>
);

const TripDetail = ({ trip, onClose, onActionDone }) => {
  const [completing, setCompleting] = useState(false);
  const [completeForm, setCompleteForm] = useState(INITIAL_COMPLETE);
  const [dispatching, setDispatching] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  const handleDispatch = async () => {
    setError(null);
    try {
      setDispatching(true);
      await dispatchTrip(trip.id);
      onActionDone?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to dispatch trip');
    } finally {
      setDispatching(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setCompleting(true);
      await completeTrip(trip.id, {
        finalOdometer: parseFloat(completeForm.finalOdometer),
        fuelConsumed: parseFloat(completeForm.fuelConsumed),
        fuelCostPerLiter: parseFloat(completeForm.fuelCostPerLiter),
      });
      onActionDone?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to complete trip');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this trip?')) return;
    setError(null);
    try {
      setCancelling(true);
      await cancelTrip(trip.id);
      onActionDone?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to cancel trip');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const inputClass =
    'w-full bg-surface-container-low border border-outline-variant text-on-surface text-body-md rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/50';
  const labelClass = 'block text-label-caps text-on-surface-variant uppercase tracking-widest mb-1';

  return (
    <Modal isOpen={true} onClose={onClose} title={trip.tripNumber} size="lg">
      {/* Status */}
      <div className="flex items-center gap-3 mb-5">
        <StatusPill status={trip.status} size="md" />
        <span className="text-body-sm text-on-surface-variant">{trip.source} → {trip.destination}</span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <InfoRow icon="directions_bus" label="Vehicle" value={`${trip.vehicle?.name} (${trip.vehicle?.registrationNumber})`} />
        <InfoRow icon="person" label="Driver" value={trip.driver?.name} />
        <InfoRow icon="inventory_2" label="Cargo Weight" value={`${parseFloat(trip.cargoWeight).toFixed(1)} kg`} />
        <InfoRow icon="straighten" label="Planned Distance" value={`${parseFloat(trip.plannedDistance).toFixed(1)} km`} />
        <InfoRow icon="schedule" label="Created" value={formatDate(trip.createdAt)} />
        <InfoRow icon="local_shipping" label="Departed" value={formatDate(trip.startedAt)} />
        {trip.status === 'completed' && (
          <>
            <InfoRow icon="check_circle" label="Completed" value={formatDate(trip.completedAt)} />
            <InfoRow icon="speed" label="Actual Distance" value={trip.actualDistance ? `${parseFloat(trip.actualDistance).toFixed(1)} km` : '—'} />
            <InfoRow icon="local_gas_station" label="Fuel Consumed" value={trip.fuelConsumed ? `${parseFloat(trip.fuelConsumed).toFixed(1)} L` : '—'} />
          </>
        )}
      </div>

      {/* Error block */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-error-container border border-red-500/30 mb-4">
          <span className="material-symbols-outlined text-on-error-container text-[18px] mt-0.5">error</span>
          <p className="text-on-error-container text-body-sm">{error}</p>
        </div>
      )}

      {/* Complete trip form */}
      {showCompleteForm && trip.status === 'dispatched' && (
        <form onSubmit={handleComplete} className="space-y-3 mb-4 p-4 rounded-xl bg-surface-container border border-outline-variant">
          <p className="text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Complete Trip</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Final Odometer (km)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 12500"
                value={completeForm.finalOdometer}
                onChange={(e) => setCompleteForm((p) => ({ ...p, finalOdometer: e.target.value }))}
                className={inputClass}
                data-element-id="final-odometer"
              />
            </div>
            <div>
              <label className={labelClass}>Fuel Consumed (L)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 45"
                value={completeForm.fuelConsumed}
                onChange={(e) => setCompleteForm((p) => ({ ...p, fuelConsumed: e.target.value }))}
                className={inputClass}
                data-element-id="fuel-consumed"
              />
            </div>
            <div>
              <label className={labelClass}>Cost / Liter</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 92.5"
                value={completeForm.fuelCostPerLiter}
                onChange={(e) => setCompleteForm((p) => ({ ...p, fuelCostPerLiter: e.target.value }))}
                className={inputClass}
                data-element-id="fuel-cost-per-liter"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={completing}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-medium text-body-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
              data-element-id="confirm-complete-btn"
            >
              {completing ? 'Completing…' : 'Confirm Complete'}
            </button>
            <button
              type="button"
              onClick={() => setShowCompleteForm(false)}
              className="px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant text-body-sm hover:text-on-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-outline-variant">
        {trip.status === 'draft' && (
          <button
            onClick={handleDispatch}
            disabled={dispatching}
            className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
            data-element-id="detail-dispatch-btn"
          >
            <span className="material-symbols-outlined text-[15px]">send</span>
            {dispatching ? 'Dispatching…' : 'Dispatch'}
          </button>
        )}

        {trip.status === 'dispatched' && !showCompleteForm && (
          <button
            onClick={() => setShowCompleteForm(true)}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-body-sm font-medium hover:opacity-90 flex items-center justify-center gap-1"
            data-element-id="detail-complete-btn"
          >
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            Complete Trip
          </button>
        )}

        {(trip.status === 'draft' || trip.status === 'dispatched') && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-body-sm hover:bg-red-500/10 disabled:opacity-50 flex items-center gap-1 transition-all"
            data-element-id="detail-cancel-btn"
          >
            <span className="material-symbols-outlined text-[15px]">block</span>
            {cancelling ? 'Cancelling…' : 'Cancel Trip'}
          </button>
        )}

        <button
          onClick={onClose}
          className="ml-auto px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant text-body-sm hover:text-on-surface transition-all"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default TripDetail;
