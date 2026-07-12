import React, { useState } from 'react';
import { useDashboardKPIs } from '../../hooks/useDashboardKPIs';
import FilterBar from '../../components/common/FilterBar';
import BentoStatCard from '../../components/common/BentoStatCard';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import { Truck, AlertTriangle, CheckCircle2, Navigation, Users, Clock, Percent, ClipboardList } from 'lucide-react';

const typeOptions = [
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'lorry', label: 'Lorry' },
  { value: 'bike', label: 'Bike' },
  { value: 'car', label: 'Car' },
  { value: 'bus', label: 'Bus' }
];

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'on_trip', label: 'On Trip' },
  { value: 'in_shop', label: 'In Shop' }
];

const Dashboard = () => {
  const [filters, setFilters] = useState({ type: '', status: '' });
  const { data, loading, error } = useDashboardKPIs(filters);

  if (error) {
    return <div className="p-6 text-error">{error}</div>;
  }

  const kpis = data?.kpis || {};
  const recentTrips = data?.recentTrips || [];

  const columns = [
    { header: 'TRIP ID', accessor: 'id' },
    { header: 'VEHICLE', cell: (row) => row.vehicle?.registrationNumber || '-' },
    { header: 'DRIVER', cell: (row) => row.driver?.fullName || row.driver?.name || '-' },
    { header: 'STATUS', cell: (row) => <StatusPill status={row.status} /> },
    { header: 'ETA', cell: (row) => {
        if (row.status === 'completed') return '-';
        if (row.status === 'dispatched') return 'Next 1h';
        return 'TBD';
    } }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-display-lg-mobile font-bold text-on-background font-outfit mb-2">Fleet Overview</h1>
          <p className="text-body-md text-on-surface-variant">Real-time performance metrics for the active transit network.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">VEHICLE TYPE</label>
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="bg-surface-container-high text-on-surface text-body-sm rounded-lg border border-outline focus:ring-primary block p-2 outline-none w-40"
            >
              <option value="">All Vehicles</option>
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">STATUS</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-surface-container-high text-on-surface text-body-sm rounded-lg border border-outline focus:ring-primary block p-2 outline-none w-40"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && !data.kpis ? (
        <div className="text-center py-10 text-on-surface-variant animate-pulse">Loading dashboard metrics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <BentoStatCard title="ACTIVE VEHICLES" value={kpis.activeVehicles || 0} colorClass="border-surface-container-high" icon={Truck} trend="+2.4%" />
            <BentoStatCard title="AVAILABLE" value={kpis.availableVehicles || 0} colorClass="border-surface-container-high" icon={CheckCircle2} trend="Stable" />
            <BentoStatCard title="IN MAINTENANCE" value={kpis.maintenanceVehicles || 0} colorClass="border-surface-container-high" icon={AlertTriangle} trend="+1" />
            <BentoStatCard title="ACTIVE TRIPS" value={kpis.activeTrips || 0} colorClass="border-surface-container-high" icon={Navigation} trend="+8.2%" />
            
            <BentoStatCard title="PENDING TRIPS" value={kpis.pendingTrips || 0} colorClass="border-surface-container-high" icon={ClipboardList} trend="Next 1h" />
            <BentoStatCard title="DRIVERS ON DUTY" value={kpis.driversOnDuty || 0} colorClass="border-surface-container-high" icon={Users} trend="+3%" />
            <BentoStatCard title="UTILIZATION" value={kpis.fleetUtilization || '0%'} colorClass="border-surface-container-high" icon={Percent} trend="+1.5%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-headline-md font-outfit text-on-background">Recent Transit Operations</h2>
                <button className="text-body-sm font-bold text-primary tracking-wider uppercase hover:text-primary-container transition-colors">VIEW ALL OPERATIONS →</button>
              </div>
              <DataTable columns={columns} data={recentTrips} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-headline-md font-outfit text-on-background">Critical Alerts</h2>
              <div className="glass-panel rounded-xl p-4 space-y-3 min-h-[300px]">
                {kpis.maintenanceVehicles > 0 && (
                  <div className="bg-error-container/20 border border-error/50 p-3 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="text-error mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-body-md text-on-error-container font-medium">{kpis.maintenanceVehicles} Vehicles in Shop</p>
                      <p className="text-body-sm text-on-surface-variant">Maintenance requires review.</p>
                    </div>
                  </div>
                )}
                {kpis.pendingTrips > 0 && (
                  <div className="bg-surface-container-high border border-outline p-3 rounded-lg flex gap-3 items-start">
                    <Clock className="text-primary mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-body-md text-on-background font-medium">{kpis.pendingTrips} Trips Pending Dispatch</p>
                      <p className="text-body-sm text-on-surface-variant">Drivers need assignment.</p>
                    </div>
                  </div>
                )}
                {kpis.maintenanceVehicles === 0 && kpis.pendingTrips === 0 && (
                  <div className="text-center py-10 text-on-surface-variant text-body-md">
                    No critical alerts.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
