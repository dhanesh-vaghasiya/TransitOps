import React, { useState, useEffect } from 'react';
import { getDispatchPool, createTrip, dispatchTrip } from '../../services/tripService';
import GlassCard from '../../components/ui/GlassCard';
import Select from '../../components/ui/Select';

const STEPS = ['Draft', 'Dispatched', 'Completed'];

const StepProgress = ({ currentStep }) => {
  const stepIndex = STEPS.indexOf(currentStep === 'cancelled' ? 'Cancelled' : currentStep.charAt(0).toUpperCase() + currentStep.slice(1));

  return (
    <div className="flex items-center gap-0 mb-5">
      {STEPS.map((step, i) => {
        const active = i <= stepIndex;
        const current = i === stepIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  current
                    ? 'bg-primary text-on-primary ring-2 ring-primary/40'
                    : active
                    ? 'bg-primary/70 text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {active && i < stepIndex ? (
                  <span className="material-symbols-outlined text-[13px]">check</span>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wide font-medium ${
                  current ? 'text-primary' : active ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${
                  i < stepIndex ? 'bg-primary/70' : 'bg-outline-variant'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const INITIAL_FORM = {
  source: '',
  destination: '',
  vehicleId: '',
  driverId: '',
  cargoWeight: '',
  plannedDistance: '',
};

const TripForm = ({ onCreated }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [pool, setPool] = useState({ vehicles: [], drivers: [] });
  const [poolLoading, setPoolLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState(null);
  const [capacityError, setCapacityError] = useState(null);
  const [draftTrip, setDraftTrip] = useState(null); // last created draft waiting for dispatch

  useEffect(() => {
    const load = async () => {
      try {
        setPoolLoading(true);
        const res = await getDispatchPool();
        setPool(res.data?.data ?? { vehicles: [], drivers: [] });
      } catch {
        // ignore; user will see empty dropdowns
      } finally {
        setPoolLoading(false);
      }
    };
    load();
  }, []);

  const cargo = parseFloat(form.cargoWeight);
  const dist = parseFloat(form.plannedDistance);
  const isBaseInfoFilled = form.source.trim() !== '' && form.destination.trim() !== '' && !isNaN(cargo) && !isNaN(dist);

  const eligibleVehicles = pool.vehicles.filter((v) => {
    if (!isNaN(cargo) && parseFloat(v.maxLoadCapacity) < cargo) return false;
    return true;
  });

  const selectedVehicle = eligibleVehicles.find((v) => v.id === parseInt(form.vehicleId, 10));

  const eligibleDrivers = pool.drivers.filter((d) => {
    // Distance rule: Trips over 300km require a safety score of >= 90
    if (!isNaN(dist) && dist > 300 && parseFloat(d.safetyScore) < 90) return false;

    // License category rule matches vehicle type exactly
    if (selectedVehicle && d.licenseCategory !== selectedVehicle.type) return false;
    
    return true;
  });

  // Check if currently selected vehicle/driver became ineligible due to changes
  useEffect(() => {
    if (form.vehicleId && !eligibleVehicles.find(v => v.id === parseInt(form.vehicleId, 10))) {
      setForm(prev => ({ ...prev, vehicleId: '' }));
    }
  }, [form.cargoWeight, eligibleVehicles, form.vehicleId]);

  useEffect(() => {
    if (form.driverId && !eligibleDrivers.find(d => d.id === parseInt(form.driverId, 10))) {
      setForm(prev => ({ ...prev, driverId: '' }));
    }
  }, [form.plannedDistance, form.vehicleId, eligibleDrivers, form.driverId]);

  // Real-time capacity check (mostly handled by filter, but kept for UI feedback if needed)
  useEffect(() => {
    if (!selectedVehicle || !form.cargoWeight) {
      setCapacityError(null);
      return;
    }
    const c = parseFloat(form.cargoWeight);
    const m = parseFloat(selectedVehicle.maxLoadCapacity);
    if (!isNaN(c) && !isNaN(m) && c > m) {
      setCapacityError(`Capacity exceeded by ${(c - m).toFixed(0)} kg — dispatch blocked`);
    } else {
      setCapacityError(null);
    }
  }, [form.cargoWeight, selectedVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const payload = {
        vehicleId: parseInt(form.vehicleId, 10),
        driverId: parseInt(form.driverId, 10),
        source: form.source,
        destination: form.destination,
        cargoWeight: parseFloat(form.cargoWeight),
        plannedDistance: parseFloat(form.plannedDistance),
      };
      const res = await createTrip(payload);
      setDraftTrip(res.data?.data?.trip ?? null);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async () => {
    if (!draftTrip || capacityError) return;
    setError(null);
    try {
      setDispatching(true);
      await dispatchTrip(draftTrip.id);
      setDraftTrip(null);
      setForm(INITIAL_FORM);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to dispatch trip');
    } finally {
      setDispatching(false);
    }
  };

  const handleReset = () => {
    setDraftTrip(null);
    setForm(INITIAL_FORM);
    setError(null);
    setCapacityError(null);
  };

  const currentStep = draftTrip ? 'dispatched' : 'draft';

  const inputClass =
    'w-full bg-surface-container-low border border-outline-variant text-on-surface text-body-md rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/50';

  const labelClass = 'block text-label-caps text-on-surface-variant uppercase tracking-widest mb-1';

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
        <h2 className="text-title-sm font-outfit text-on-background font-semibold">New Dispatch Manifest</h2>
      </div>

      <StepProgress currentStep={currentStep} />

      <form onSubmit={handleSubmit} className="space-y-3" id="trip-form">
        {/* Route */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="source" className={labelClass}>Source</label>
            <input
              id="source"
              name="source"
              value={form.source}
              onChange={handleChange}
              disabled={!!draftTrip}
              placeholder="Origin city"
              required
              className={inputClass}
              data-element-id="trip-source"
            />
          </div>
          <div>
            <label htmlFor="destination" className={labelClass}>Destination</label>
            <input
              id="destination"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              disabled={!!draftTrip}
              placeholder="Destination city"
              required
              className={inputClass}
              data-element-id="trip-destination"
            />
          </div>
        </div>

        {/* Cargo & Distance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cargoWeight" className={labelClass}>Cargo Weight (kg)</label>
            <input
              id="cargoWeight"
              name="cargoWeight"
              type="number"
              min="0.01"
              step="0.01"
              value={form.cargoWeight}
              onChange={handleChange}
              disabled={!!draftTrip}
              placeholder="e.g. 500"
              required
              className={inputClass}
              data-element-id="trip-cargo-weight"
            />
          </div>
          <div>
            <label htmlFor="plannedDistance" className={labelClass}>Distance (km)</label>
            <input
              id="plannedDistance"
              name="plannedDistance"
              type="number"
              min="0.01"
              step="0.01"
              value={form.plannedDistance}
              onChange={handleChange}
              disabled={!!draftTrip}
              placeholder="e.g. 250"
              required
              className={inputClass}
              data-element-id="trip-planned-distance"
            />
          </div>
        </div>

        {/* Vehicle */}
        <div>
          <label htmlFor="vehicleId" className={labelClass}>Vehicle</label>
          <Select
            id="vehicleId"
            name="vehicleId"
            value={form.vehicleId}
            onChange={handleChange}
            disabled={!!draftTrip || poolLoading || !isBaseInfoFilled}
            required
            className="w-full"
            data-element-id="trip-vehicle-select"
          >
            <option value="">
              {!isBaseInfoFilled ? 'Enter cargo & distance first' : poolLoading ? 'Loading vehicles…' : 'Select eligible vehicle'}
            </option>
            {eligibleVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.registrationNumber} (max {v.maxLoadCapacity} kg)
              </option>
            ))}
          </Select>
        </div>

        {/* Driver */}
        <div>
          <label htmlFor="driverId" className={labelClass}>Driver</label>
          <Select
            id="driverId"
            name="driverId"
            value={form.driverId}
            onChange={handleChange}
            disabled={!!draftTrip || poolLoading || !form.vehicleId}
            required
            className="w-full"
            data-element-id="trip-driver-select"
          >
            <option value="">
              {!form.vehicleId ? 'Select a vehicle first' : poolLoading ? 'Loading drivers…' : 'Select eligible driver'}
            </option>
            {eligibleDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.licenseCategory ? d.licenseCategory.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''} Lic. (Score: {d.safetyScore})
              </option>
            ))}
          </Select>
        </div>

        {/* Capacity error block */}
        {capacityError && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-error-container border border-red-500/30"
            data-element-id="trip-capacity-error"
          >
            <span className="material-symbols-outlined text-on-error-container text-[18px] mt-0.5">error</span>
            <p className="text-on-error-container text-body-sm font-medium">{capacityError}</p>
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-error-container border border-red-500/30">
            <span className="material-symbols-outlined text-on-error-container text-[18px] mt-0.5">warning</span>
            <p className="text-on-error-container text-body-sm">{error}</p>
          </div>
        )}

        {/* Vehicle capacity info */}
        {selectedVehicle && form.cargoWeight && !capacityError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
            <p className="text-emerald-300 text-body-sm">
              Within capacity ({parseFloat(form.cargoWeight).toFixed(0)} / {parseFloat(selectedVehicle.maxLoadCapacity).toFixed(0)} kg)
            </p>
          </div>
        )}

        {/* Actions */}
        {!draftTrip ? (
          <button
            type="submit"
            disabled={submitting || !!capacityError}
            className="w-full mt-1 py-2.5 rounded-lg bg-primary text-on-primary font-medium text-body-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-element-id="trip-create-btn"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Creating…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save as Draft
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleDispatch}
              disabled={dispatching || !!capacityError}
              className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-medium text-body-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-element-id="trip-dispatch-btn"
            >
              {dispatching ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Dispatching…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Dispatch
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline text-body-md transition-all"
              data-element-id="trip-reset-btn"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </form>

      {/* Draft trip info banner */}
      {draftTrip && (
        <div className="mt-3 px-3 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant">
          <p className="text-label-caps text-on-surface-variant uppercase tracking-widest mb-0.5">Draft Created</p>
          <p className="text-body-sm text-primary font-medium font-mono">{draftTrip.tripNumber}</p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            {draftTrip.vehicle?.name} → {draftTrip.source} → {draftTrip.destination}
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default TripForm;
