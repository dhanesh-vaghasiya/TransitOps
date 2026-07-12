import React, { useState } from 'react';
import { useDashboardKPIs } from '../../hooks/useDashboardKPIs';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/ui/Select';
import BentoStatCard from '../../components/common/BentoStatCard';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import { Truck, AlertTriangle, CheckCircle2, Navigation, Users, Clock, Percent, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

const Dashboard = () => {
  const [filters, setFilters] = useState({ type: '', status: '' });
  const { data, loading, error } = useDashboardKPIs(filters);

  if (error) {
    return <div className="p-6 text-error">{error}</div>;
  }

  const kpis = data?.kpis || {};
  const recentTrips = data?.recentTrips || [];
  const tripVolumeData = data?.graphs?.tripVolumeData || [];
  const distributionData = data?.graphs?.distributionData || [];

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
            <Select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-40"
            >
              <option value="">All Vehicles</option>
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">STATUS</label>
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-40"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
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
            <div className="space-y-6">
              
              {/* Trip Volume Trend */}
              <div className="glass-panel rounded-xl p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-body-lg font-bold text-on-background font-outfit">Trip Volume Trend</h3>
                  <div className="flex items-center gap-3 text-label-caps text-on-surface-variant font-bold text-[10px]">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> ACTIVE</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> PROJECTED</div>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tripVolumeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2} barSize={20}>
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} dy={10} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                      <Bar dataKey="active" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="projected" fill="#3B82F6" radius={[2, 2, 0, 0]} opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Regional Distribution */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="text-body-lg font-bold text-on-background font-outfit mb-4">Vehicle Type Distribution</h3>
                <div className="flex items-center">
                  <div className="w-24 h-24 relative shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-on-background z-10">100%</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie cx="50%" cy="50%" data={distributionData} innerRadius={28} outerRadius={40} dataKey="value" stroke="none">
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 ml-6 space-y-3">
                    {distributionData.length === 0 ? (
                      <div className="text-body-sm text-on-surface-variant">No data</div>
                    ) : (
                      distributionData.map((item, index) => (
                        <div key={item.name} className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant">{item.name}</span>
                          <span className="font-bold" style={{ color: PIE_COLORS[index % PIE_COLORS.length] }}>{item.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5">
                <h3 className="text-body-lg font-bold text-on-background font-outfit mb-4">Critical Alerts</h3>
                <div className="space-y-3">
                  {kpis.maintenanceVehicles > 0 && (
                    <div className="bg-error-container/10 border border-error/30 p-3 rounded-lg flex gap-3 items-start">
                      <AlertTriangle className="text-error mt-0.5 shrink-0" size={16} />
                      <div>
                        <p className="text-body-sm text-on-error-container font-bold">{kpis.maintenanceVehicles} Vehicles in Shop</p>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">Immediate inspection required. Review maintenance logs.</p>
                      </div>
                    </div>
                  )}
                  {kpis.pendingTrips > 0 && (
                    <div className="bg-surface-container-high border border-outline p-3 rounded-lg flex gap-3 items-start">
                      <Clock className="text-primary mt-0.5 shrink-0" size={16} />
                      <div>
                        <p className="text-body-sm text-on-background font-bold">{kpis.pendingTrips} Trips Pending Dispatch</p>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">Drivers need assignment for upcoming trips.</p>
                      </div>
                    </div>
                  )}
                  {kpis.maintenanceVehicles === 0 && kpis.pendingTrips === 0 && (
                    <div className="text-center py-6 text-on-surface-variant text-body-sm">
                      No critical alerts.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
