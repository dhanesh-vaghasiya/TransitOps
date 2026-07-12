import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import GlassPanel from '../../components/ui/GlassPanel';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import { getFuelLogs, createFuelLog } from '../../services/fuelService';
import { getExpenses, createExpense } from '../../services/expenseService';
import { getVehicles } from '../../services/vehicleService';
import { getTrips } from '../../services/tripService';
import Select from '../../components/ui/Select';

const FuelExpensePage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  
  const [loadingFuel, setLoadingFuel] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [errorFuel, setErrorFuel] = useState(null);
  const [errorExpenses, setErrorExpenses] = useState(null);
  
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // Fuel log form state
  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    tripId: '',
    liters: '',
    costPerLiter: '',
    odometerReading: '',
    receiptNumber: '',
  });
  const [fuelSubmitError, setFuelSubmitError] = useState(null);
  const [fuelSubmitting, setFuelSubmitting] = useState(false);
  
  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    category: 'toll',
    description: '',
    amount: '',
    vehicleId: '',
    tripId: '',
  });
  const [expenseSubmitError, setExpenseSubmitError] = useState(null);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoadingFuel(true);
      const res = await getFuelLogs();
      setFuelLogs(res.data?.data?.fuelLogs ?? []);
      setErrorFuel(null);
    } catch (err) {
      setErrorFuel(err.response?.data?.message ?? 'Failed to load fuel logs');
    } finally {
      setLoadingFuel(false);
    }

    try {
      setLoadingExpenses(true);
      const res = await getExpenses();
      setExpenses(res.data?.data?.expenses ?? []);
      setErrorExpenses(null);
    } catch (err) {
      setErrorExpenses(err.response?.data?.message ?? 'Failed to load expenses');
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  const loadDropdowns = useCallback(async () => {
    try {
      const [vRes, tRes] = await Promise.all([getVehicles(), getTrips({ limit: 100 })]);
      setVehicles(vRes.data?.data ?? []);
      setTrips(tRes.data?.data?.trips ?? []);
    } catch (err) {
      console.error('Failed to load dropdown data', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadDropdowns();
  }, [loadData, loadDropdowns]);

  // Calculate totals
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (parseFloat(log.totalCost) || 0), 0);
  const totalOtherExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const totalOperationalCost = totalFuelCost + totalOtherExpenses;

  // Calculate efficiency index metrics
  const totalLiters = fuelLogs.reduce((sum, log) => sum + (parseFloat(log.liters) || 0), 0);
  
  // Fleet-wide efficiency index (weighted avg)
  const averageEfficiency = totalLiters > 0 
    ? (fuelLogs.reduce((sum, log) => {
        // approximate distance from trip or use simple average
        const dist = log.trip ? parseFloat(log.trip.actualDistance || log.trip.plannedDistance) || 50 : 50;
        return sum + dist;
      }, 0) / totalLiters).toFixed(2)
    : '0.00';

  // Handle Fuel Form submission
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setFuelSubmitError(null);
    setFuelSubmitting(true);

    try {
      const payload = {
        vehicleId: parseInt(fuelForm.vehicleId, 10),
        tripId: fuelForm.tripId ? parseInt(fuelForm.tripId, 10) : null,
        liters: parseFloat(fuelForm.liters),
        costPerLiter: parseFloat(fuelForm.costPerLiter),
        odometerReading: parseFloat(fuelForm.odometerReading),
        receiptNumber: fuelForm.receiptNumber || undefined,
      };

      await createFuelLog(payload);
      setIsFuelModalOpen(false);
      // Reset form
      setFuelForm({
        vehicleId: '',
        tripId: '',
        liters: '',
        costPerLiter: '',
        odometerReading: '',
        receiptNumber: '',
      });
      loadData();
    } catch (err) {
      setFuelSubmitError(err.response?.data?.message ?? 'Failed to log fuel');
    } finally {
      setFuelSubmitting(false);
    }
  };

  // Handle Expense Form submission
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseSubmitError(null);
    setExpenseSubmitting(true);

    try {
      const payload = {
        category: expenseForm.category,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        vehicleId: parseInt(expenseForm.vehicleId, 10),
        tripId: expenseForm.tripId ? parseInt(expenseForm.tripId, 10) : null,
      };

      await createExpense(payload);
      setIsExpenseModalOpen(false);
      // Reset form
      setExpenseForm({
        category: 'toll',
        description: '',
        amount: '',
        vehicleId: '',
        tripId: '',
      });
      loadData();
    } catch (err) {
      setExpenseSubmitError(err.response?.data?.message ?? 'Failed to add expense');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  };

  // Format datetime
  const formatDateTime = (val) => {
    if (!val) return '—';
    return new Date(val).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter trips for selected vehicle
  const getFilteredTripsForFuel = () => {
    if (!fuelForm.vehicleId) return [];
    return trips.filter((t) => t.vehicleId === parseInt(fuelForm.vehicleId, 10));
  };

  const getFilteredTripsForExpense = () => {
    if (!expenseForm.vehicleId) return [];
    return trips.filter((t) => t.vehicleId === parseInt(expenseForm.vehicleId, 10));
  };

  // Fuel table columns
  const fuelColumns = [
    {
      header: 'Vehicle',
      render: (row) => (
        <div>
          <p className="font-semibold text-on-background">{row.vehicle?.name}</p>
          <p className="text-body-sm text-on-surface-variant font-mono">{row.vehicle?.registrationNumber}</p>
        </div>
      ),
    },
    {
      header: 'Date/Time',
      render: (row) => <span className="text-body-sm text-on-surface-variant">{formatDateTime(row.loggedAt)}</span>,
    },
    {
      header: 'Receipt / Ref',
      render: (row) => <span className="font-mono text-body-sm text-primary">{row.receiptNumber}</span>,
    },
    {
      header: 'Liters',
      render: (row) => <span className="font-medium">{parseFloat(row.liters).toFixed(1)} L</span>,
    },
    {
      header: 'Cost',
      render: (row) => <span className="font-semibold text-primary">{formatCurrency(row.totalCost)}</span>,
    },
  ];

  // Expenses table columns
  const expenseColumns = [
    {
      header: 'Category',
      render: (row) => {
        const labels = {
          toll: 'Toll Fees',
          parking: 'Parking',
          fine: 'Fines',
          insurance: 'Insurance',
          other: 'Misc',
          maintenance: 'Maintenance',
        };
        const categoryLabel = labels[row.category] ?? row.category;
        const iconMap = {
          toll: 'toll',
          parking: 'local_parking',
          fine: 'gavel',
          insurance: 'shield',
          other: 'payments',
          maintenance: 'build',
        };
        return (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">
              {iconMap[row.category] ?? 'receipt_long'}
            </span>
            <span className="font-semibold capitalize">{categoryLabel}</span>
          </div>
        );
      },
    },
    {
      header: 'Description',
      render: (row) => (
        <div>
          <p className="text-on-background font-medium">{row.description}</p>
          <p className="text-body-sm text-on-surface-variant">
            {row.vehicle?.name} ({row.vehicle?.registrationNumber})
            {row.trip ? ` • Trip #${row.trip.tripNumber}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Reference',
      render: (row) => <span className="font-mono text-body-sm text-on-surface-variant">{row.ref}</span>,
    },
    {
      header: 'Status',
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Linked Maint. Cost',
      render: (row) => (
        <span className="text-body-sm text-on-surface-variant font-mono">
          {row.linkedMaintenanceCost > 0 ? formatCurrency(row.linkedMaintenanceCost) : '—'}
        </span>
      ),
    },
    {
      header: 'Cost',
      render: (row) => <span className="font-semibold text-primary">{formatCurrency(row.amount)}</span>,
    },
  ];

  const inputClass =
    'w-full bg-surface-container-low border border-outline-variant text-on-surface text-body-md rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-on-surface-variant/50';

  const labelClass = 'block text-label-caps text-on-surface-variant uppercase tracking-widest mb-1';

  return (
    <div className="h-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
            <h1 className="text-headline-md font-outfit text-on-background">Financial Operations</h1>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Log fuel entries, request expense clearance, and analyze total operational costs in real time.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-medium hover:border-primary/50 hover:bg-surface-container-high transition-all flex items-center gap-2 active:scale-98"
            id="log-fuel-btn"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">local_gas_station</span>
            Log Fuel
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-all flex items-center gap-2 active:scale-98"
            id="add-expense-btn"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Expense
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left Column: Fuel Logs (2/3 width) */}
        <div className="col-span-2">
          <GlassCard className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">local_gas_station</span>
                <h2 className="text-title-sm font-outfit text-on-background font-semibold">Fuel Logs</h2>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                Live Log Entries
              </span>
            </div>
            <div className="flex-1">
              <DataTable
                columns={fuelColumns}
                data={fuelLogs}
                loading={loadingFuel}
                error={errorFuel}
                emptyMessage="No fuel logs logged yet"
              />
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Efficiency Index (1/3 width) */}
        <div className="col-span-1">
          <GlassPanel className="p-5 h-full flex flex-col justify-between border-primary/20 bg-linear-to-b from-primary/5 to-transparent">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
                  <h2 className="text-title-sm font-outfit text-on-background font-semibold">Efficiency Index</h2>
                </div>
              </div>
              
              <div className="py-6 text-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Fleet Odo Efficiency</span>
                <div className="text-[52px] font-outfit font-bold text-primary tracking-tight my-1 select-none active-glow rounded-xl py-2 bg-surface-bright/20 border border-outline-variant/20 inline-block px-6">
                  {averageEfficiency} <span className="text-title-sm font-normal text-on-surface-variant font-inter">km/L</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">trending_up</span>
                  <span className="text-emerald-300 text-body-sm font-medium">+2.4% vs last month</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-surface-container/50 p-4 rounded-xl border border-outline-variant/30">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Total Fuel Tracked:</span>
                <span className="font-semibold font-mono text-on-background">{totalLiters.toFixed(1)} Liters</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Active Assets:</span>
                <span className="font-semibold text-on-background">{vehicles.length} Vehicles</span>
              </div>
              <div className="flex items-center justify-between text-body-sm pt-2 border-t border-outline-variant/30">
                <span className="text-on-surface-variant">Odometer Coverage:</span>
                <span className="text-primary font-bold font-mono">100%</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Operational Expenses Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            <h2 className="text-title-sm font-outfit text-on-background font-semibold">Operational Expenses</h2>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
            Toll, Maintenance & Misc Fees
          </span>
        </div>
        <DataTable
          columns={expenseColumns}
          data={expenses}
          loading={loadingExpenses}
          error={errorExpenses}
          emptyMessage="No operational expenses added yet"
        />
      </GlassCard>

      {/* 3-Column Summary Strip */}
      <div className="grid grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
          </div>
          <div>
            <p className="text-label-caps text-on-surface-variant uppercase tracking-wider">Gross Fuel Cost</p>
            <p className="text-[20px] font-outfit font-bold text-on-background mt-0.5">{formatCurrency(totalFuelCost)}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <div>
            <p className="text-label-caps text-on-surface-variant uppercase tracking-wider">Total Other Expenses</p>
            <p className="text-[20px] font-outfit font-bold text-on-background mt-0.5">{formatCurrency(totalOtherExpenses)}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-high border border-primary/30 flex items-center gap-4 glow-orange bg-linear-to-r from-primary/10 to-transparent">
          <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-label-caps text-primary uppercase tracking-wider font-semibold">Total Operational Cost</p>
            <p className="text-[22px] font-outfit font-bold text-primary mt-0.5">{formatCurrency(totalOperationalCost)}</p>
          </div>
        </div>
      </div>

      {/* "+ Log Fuel" Modal */}
      <Modal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        title="Log Vehicle Fuel Entry"
        size="md"
      >
        <form onSubmit={handleFuelSubmit} className="space-y-4" id="fuel-form">
          <div>
            <label htmlFor="fuel-vehicleId" className={labelClass}>Vehicle</label>
            <Select
              id="fuel-vehicleId"
              value={fuelForm.vehicleId}
              onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value, tripId: '' })}
              required
              className="w-full"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.registrationNumber}) — Odo: {parseFloat(v.odometer).toFixed(0)} km
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="fuel-tripId" className={labelClass}>Linked Trip (Optional)</label>
            <Select
              id="fuel-tripId"
              value={fuelForm.tripId}
              onChange={(e) => setFuelForm({ ...fuelForm, tripId: e.target.value })}
              className="w-full"
              disabled={!fuelForm.vehicleId}
            >
              <option value="">No Linked Trip / Independent</option>
              {getFilteredTripsForFuel().map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tripNumber} ({t.source} → {t.destination}) [{t.status}]
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fuel-liters" className={labelClass}>Liters</label>
              <input
                id="fuel-liters"
                type="number"
                step="0.01"
                min="0.01"
                value={fuelForm.liters}
                onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                required
                placeholder="e.g. 45.5"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fuel-costPerLiter" className={labelClass}>Cost per Liter (₹)</label>
              <input
                id="fuel-costPerLiter"
                type="number"
                step="0.01"
                min="0.01"
                value={fuelForm.costPerLiter}
                onChange={(e) => setFuelForm({ ...fuelForm, costPerLiter: e.target.value })}
                required
                placeholder="e.g. 1.45"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="fuel-odometerReading" className={labelClass}>Current Odometer (km)</label>
            <input
              id="fuel-odometerReading"
              type="number"
              step="0.1"
              min="0"
              value={fuelForm.odometerReading}
              onChange={(e) => setFuelForm({ ...fuelForm, odometerReading: e.target.value })}
              required
              placeholder="e.g. 45120"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fuel-receiptNumber" className={labelClass}>Receipt / Ref Number (Optional)</label>
            <input
              id="fuel-receiptNumber"
              type="text"
              value={fuelForm.receiptNumber}
              onChange={(e) => setFuelForm({ ...fuelForm, receiptNumber: e.target.value })}
              placeholder="e.g. REC-9821"
              className={inputClass}
            />
          </div>

          {/* Dynamic Estimation Check */}
          {fuelForm.liters && fuelForm.costPerLiter && (
            <div className="p-3 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant font-medium">Estimated Fuel Cost:</span>
              <span className="font-bold text-primary text-body-md">
                {formatCurrency((parseFloat(fuelForm.liters) || 0) * (parseFloat(fuelForm.costPerLiter) || 0))}
              </span>
            </div>
          )}

          {fuelSubmitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container border border-red-500/20 text-on-error-container text-body-sm">
              <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
              <span>{fuelSubmitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={fuelSubmitting}
            className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {fuelSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Logging Entry…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Log Fuel Entry
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* "+ Add Expense" Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Request Operational Expense"
        size="md"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4" id="expense-form">
          <div>
            <label htmlFor="expense-category" className={labelClass}>Category</label>
            <Select
              id="expense-category"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              required
              className="w-full"
            >
              <option value="toll">Toll Fees</option>
              <option value="parking">Parking</option>
              <option value="fine">Fines</option>
              <option value="insurance">Insurance</option>
              <option value="other">Misc / Other</option>
            </Select>
          </div>

          <div>
            <label htmlFor="expense-vehicleId" className={labelClass}>Vehicle</label>
            <Select
              id="expense-vehicleId"
              value={expenseForm.vehicleId}
              onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value, tripId: '' })}
              required
              className="w-full"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.registrationNumber})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="expense-tripId" className={labelClass}>Linked Trip (Optional)</label>
            <Select
              id="expense-tripId"
              value={expenseForm.tripId}
              onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
              className="w-full"
              disabled={!expenseForm.vehicleId}
            >
              <option value="">No Linked Trip / Independent</option>
              {getFilteredTripsForExpense().map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tripNumber} ({t.source} → {t.destination}) [{t.status}]
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="expense-amount" className={labelClass}>Amount (₹)</label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              required
              placeholder="e.g. 15.00"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expense-description" className={labelClass}>Description</label>
            <input
              id="expense-description"
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              required
              placeholder="e.g. Highway toll passage near Toll plaza"
              className={inputClass}
            />
          </div>

          {expenseSubmitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container border border-red-500/20 text-on-error-container text-body-sm">
              <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
              <span>{expenseSubmitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={expenseSubmitting}
            className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {expenseSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Submitting Request…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Add Expense Request
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default FuelExpensePage;
