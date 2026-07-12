import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import GlassPanel from '../../components/ui/GlassPanel';
import DataTable from '../../components/ui/DataTable';
import { useSettings } from '../../contexts/SettingsContext';
import { getSettings, updateSettings, updateRbacMatrix, getSecurityLogs } from '../../services/settingsService';

const SettingsPage = () => {
  const { settings, setSettings } = useSettings();

  // General settings local state
  const [generalForm, setGeneralForm] = useState({
    depotName: '',
    currency: '',
    distanceUnit: '',
  });
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // RBAC local state
  const [tempRbacMatrix, setTempRbacMatrix] = useState({});
  const [rbacSaving, setRbacSaving] = useState(false);
  const [rbacSuccess, setRbacSuccess] = useState(false);
  const [rbacError, setRbacError] = useState(null);

  // Security logs state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsError, setLogsError] = useState(null);

  // Sync state with global settings context
  useEffect(() => {
    if (settings) {
      setGeneralForm({
        depotName: settings.depotName || '',
        currency: settings.currency || 'USD',
        distanceUnit: settings.distanceUnit || 'km',
      });
      if (settings.rbacMatrix) {
        setTempRbacMatrix(JSON.parse(JSON.stringify(settings.rbacMatrix)));
      }
    }
  }, [settings]);

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await getSecurityLogs();
      setLogs(res.data?.data ?? []);
      setLogsError(null);
    } catch (err) {
      setLogsError(err.response?.data?.message ?? 'Failed to load security logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setGeneralSaving(true);
    setGeneralSuccess(false);
    setGeneralError(null);

    try {
      const res = await updateSettings(generalForm);
      setSettings(prev => ({
        ...prev,
        depotName: res.depotName,
        currency: res.currency,
        distanceUnit: res.distanceUnit,
      }));
      setGeneralSuccess(true);
      loadLogs();
      setTimeout(() => setGeneralSuccess(false), 3000);
    } catch (err) {
      setGeneralError(err.response?.data?.message ?? 'Failed to save general settings');
    } finally {
      setGeneralSaving(false);
    }
  };

  const handleRbacChange = (roleKey, moduleKey, val) => {
    setTempRbacMatrix(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [moduleKey]: val,
      },
    }));
  };

  const handleRbacSave = async () => {
    setRbacSaving(true);
    setRbacSuccess(false);
    setRbacError(null);

    try {
      const res = await updateRbacMatrix(tempRbacMatrix);
      setSettings(prev => ({
        ...prev,
        rbacMatrix: res.rbacMatrix,
      }));
      setRbacSuccess(true);
      loadLogs();
      setTimeout(() => setRbacSuccess(false), 3000);
    } catch (err) {
      setRbacError(err.response?.data?.message ?? 'Failed to save RBAC matrix');
    } finally {
      setRbacSaving(false);
    }
  };

  // Roles to display in matrix
  const rolesList = [
    { key: 'fleet_manager', name: 'Fleet Manager', description: 'System Admin (Shield / Full Access)' },
    { key: 'dispatcher', name: 'Dispatcher', description: 'Trip dispatching & logistics' },
    { key: 'safety_officer', name: 'Safety Officer', description: 'Driver compliance & licenses' },
    { key: 'financial_analyst', name: 'Financial Analyst', description: 'Operational cost reviews' },
  ];

  const modulesKeys = ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'fuel', 'analytics', 'settings'];

  const moduleLabels = {
    dashboard: 'Dashboard',
    fleet: 'Fleet',
    drivers: 'Driver',
    trips: 'Trips',
    maintenance: 'Maintenance',
    fuel: 'Fuel/Exp.',
    analytics: 'Analytics',
    settings: 'Settings'
  };

  const renderRbacCell = (row, moduleKey) => {
    const roleKey = row.key;
    if (roleKey === 'fleet_manager') {
      return (
        <div className="flex items-center gap-1 text-primary font-semibold select-none">
          <span className="material-symbols-outlined text-[16px]">shield</span>
          <span className="text-[11px] uppercase tracking-wider">Full</span>
        </div>
      );
    }

    const currentVal = tempRbacMatrix[roleKey]?.[moduleKey] || 'none';

    const getSelectClass = (val) => {
      if (val === 'full') return 'text-emerald-400 font-medium';
      if (val === 'view') return 'text-sky-300 font-medium';
      return 'text-on-surface-variant/40';
    };

    return (
      <select
        value={currentVal}
        onChange={(e) => handleRbacChange(roleKey, moduleKey, e.target.value)}
        className={`bg-transparent border-0 font-medium cursor-pointer focus:outline-none text-body-sm py-0.5 ${getSelectClass(currentVal)}`}
      >
        <option value="full" className="bg-surface-container-high text-emerald-400">Full</option>
        <option value="view" className="bg-surface-container-high text-sky-400">View</option>
        <option value="none" className="bg-surface-container-high text-on-surface-variant/60">—</option>
      </select>
    );
  };

  const rbacColumns = [
    {
      header: 'Role / Access Level',
      render: (row) => (
        <div className="py-1">
          <div className="flex items-center gap-1.5 font-semibold text-on-background">
            {row.key === 'fleet_manager' && (
              <span className="material-symbols-outlined text-primary text-[16px] animate-pulse">shield_with_heart</span>
            )}
            {row.name}
          </div>
          <span className="text-[10px] text-on-surface-variant/60">{row.description}</span>
        </div>
      ),
    },
    ...modulesKeys.map(m => ({
      header: moduleLabels[m] || m,
      render: (row) => renderRbacCell(row, m),
    })),
  ];

  const formatLogAction = (action) => {
    const config = {
      LOGIN_SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      LOGIN_FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
      ACCOUNT_LOCKOUT: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
      ROLE_MODIFIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SETTINGS_MODIFIED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const styleClass = config[action] ?? 'bg-surface-container text-on-surface-variant border-outline-variant';
    return (
      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase border tracking-wider ${styleClass}`}>
        {action.replace('_', ' ')}
      </span>
    );
  };

  const formatDateTime = (val) => {
    if (!val) return '—';
    return new Date(val).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const logColumns = [
    {
      header: 'Event Type',
      render: (row) => formatLogAction(row.action),
    },
    {
      header: 'Details',
      render: (row) => <span className="text-body-sm text-on-surface font-medium">{row.details}</span>,
    },
    {
      header: 'Occurred',
      render: (row) => (
        <div className="text-right">
          <p className="text-body-sm font-semibold text-primary">{formatTimeAgo(row.createdAt)}</p>
          <p className="text-[10px] text-on-surface-variant/50 font-mono">{formatDateTime(row.createdAt)}</p>
        </div>
      ),
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
            <span className="material-symbols-outlined text-primary text-[24px]">admin_panel_settings</span>
            <h1 className="text-headline-md font-outfit text-on-background">Settings & Access Control</h1>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Manage depot operational rules, edit role access permission matrices, and audit system security events.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left Column: General Settings & System Status (1/3 width) */}
        <div className="col-span-1 space-y-5">
          <GlassPanel className="p-5 flex flex-col justify-between">
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2 border-b border-outline-variant/30 pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <h2 className="text-title-sm font-outfit text-on-background font-semibold">General Configuration</h2>
              </div>

              <div>
                <label htmlFor="depotName" className={labelClass}>Depot Name</label>
                <input
                  id="depotName"
                  type="text"
                  value={generalForm.depotName}
                  onChange={(e) => setGeneralForm({ ...generalForm, depotName: e.target.value })}
                  required
                  placeholder="e.g. Central Depot"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="currency" className={labelClass}>System Currency</label>
                <select
                  id="currency"
                  value={generalForm.currency}
                  onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                  required
                  className={inputClass}
                >
                  <option value="USD">USD ($) — US Dollars</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Distance Metric Unit</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGeneralForm({ ...generalForm, distanceUnit: 'km' })}
                    className={`flex-1 py-2 rounded-lg border font-medium transition-all ${
                      generalForm.distanceUnit === 'km'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    Kilometers (km)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneralForm({ ...generalForm, distanceUnit: 'mi' })}
                    className={`flex-1 py-2 rounded-lg border font-medium transition-all ${
                      generalForm.distanceUnit === 'mi'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    Miles (mi)
                  </button>
                </div>
              </div>

              {generalError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container border border-red-500/20 text-on-error-container text-body-sm">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                  <span>{generalError}</span>
                </div>
              )}

              {generalSuccess && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-body-sm">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">check_circle</span>
                  <span>General settings updated successfully.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={generalSaving}
                className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generalSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Saving Changes…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save General Config
                  </>
                )}
              </button>
            </form>
          </GlassPanel>

          {/* System Status Mini Card */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1 border-b border-outline-variant/30 pb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">dns</span>
              <h3 className="text-body-md font-semibold text-on-background">System & API Status</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="bg-surface-container/30 p-2.5 rounded-lg border border-outline-variant/30">
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider mb-0.5">API Service</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-emerald-300">Online</span>
                </div>
              </div>
              <div className="bg-surface-container/30 p-2.5 rounded-lg border border-outline-variant/30">
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider mb-0.5">Database Latency</p>
                <span className="font-semibold text-primary">12ms (Healthy)</span>
              </div>
              <div className="bg-surface-container/30 p-2.5 rounded-lg border border-outline-variant/30">
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider mb-0.5">WS Connection</p>
                <span className="font-semibold text-sky-300">Connected</span>
              </div>
              <div className="bg-surface-container/30 p-2.5 rounded-lg border border-outline-variant/30">
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider mb-0.5">App Version</p>
                <span className="font-mono text-on-background font-semibold">v1.0.0</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Role-Permission Matrix (2/3 width) */}
        <div className="col-span-2">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">rule</span>
                  <h2 className="text-title-sm font-outfit text-on-background font-semibold">Access Control Matrix</h2>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                  Role-based Permissions
                </span>
              </div>

              <div>
                <DataTable
                  columns={rbacColumns}
                  data={rolesList}
                  loading={false}
                  emptyMessage="No roles defined"
                />
              </div>

              {rbacError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container border border-red-500/20 text-on-error-container text-body-sm">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                  <span>{rbacError}</span>
                </div>
              )}

              {rbacSuccess && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-body-sm">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">check_circle</span>
                  <span>RBAC Access matrix saved successfully.</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-end">
              <button
                type="button"
                onClick={handleRbacSave}
                disabled={rbacSaving}
                className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {rbacSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Saving Matrix…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Save Permissions Matrix
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Audit Security Logs */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
            <h2 className="text-title-sm font-outfit text-on-background font-semibold">Recent Security Logs</h2>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary hover:opacity-80 transition-all bg-surface-container px-2 py-1 rounded border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            Refresh Logs
          </button>
        </div>
        <DataTable
          columns={logColumns}
          data={logs}
          loading={loadingLogs}
          error={logsError}
          emptyMessage="No security events logged yet"
        />
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
