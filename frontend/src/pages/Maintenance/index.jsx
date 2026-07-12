import React, { useState, useEffect } from 'react';
import maintenanceService from '../../services/maintenanceService';
import vehicleService from '../../services/vehicleService';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import { Wrench, HeartPulse, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const maintenanceTypeOptions = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tire_replacement', label: 'Tire Replacement' },
  { value: 'engine_repair', label: 'Engine Repair' },
  { value: 'brake_service', label: 'Brake Service' },
  { value: 'general_inspection', label: 'General Inspection' },
  { value: 'other', label: 'Other' }
];

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    workOrderNumber: '',
    vehicleId: '',
    maintenanceType: 'general_inspection',
    description: '',
    cost: '',
    status: 'in_progress'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth(); // If RBAC is needed

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, vehiclesData] = await Promise.all([
        maintenanceService.getAll(),
        vehicleService.getAll()
      ]);
      setLogs(logsData.maintenanceLogs || []);
      setVehicles(vehiclesData || []);
    } catch (err) {
      console.error('Failed to fetch maintenance data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await maintenanceService.create({
        ...formData,
        vehicleId: Number(formData.vehicleId),
        cost: Number(formData.cost)
      });
      setSuccess('Maintenance record created successfully');
      setFormData({
        workOrderNumber: '',
        vehicleId: '',
        maintenanceType: 'general_inspection',
        description: '',
        cost: '',
        status: 'in_progress'
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record');
    }
  };

  const handleComplete = async (log) => {
    if (log.status === 'completed' || log.status === 'cancelled') return;
    try {
      await maintenanceService.update(log.id, { status: 'completed' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update record');
    }
  };

  const calculateHealthScore = () => {
    if (!vehicles.length) return 100;
    const available = vehicles.filter(v => v.status === 'available').length;
    const inShop = vehicles.filter(v => v.status === 'in_shop').length;
    // Simple heuristic
    const score = Math.max(0, 100 - (inShop / vehicles.length) * 100).toFixed(0);
    return score;
  };

  const columns = [
    { header: 'WO#', accessor: 'workOrderNumber' },
    { header: 'Vehicle', cell: (row) => row.vehicle?.registrationNumber || 'N/A' },
    { header: 'Type', cell: (row) => <span className="capitalize">{row.maintenanceType.replace('_', ' ')}</span> },
    { header: 'Cost', cell: (row) => `₹${Number(row.cost).toLocaleString()}` },
    { header: 'Status', cell: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-display-lg-mobile font-bold text-on-background font-outfit">Maintenance Workflow</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Manage service logs, vehicle health, and shop operations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Health Score Card */}
          <div className="glass-card p-6 flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-label-caps text-on-surface-variant mb-1">Fleet Health Score</h3>
              <div className="text-4xl font-bold text-emerald-400">{calculateHealthScore()}/100</div>
            </div>
            <HeartPulse size={48} className="text-emerald-500/20 absolute right-4 top-6" />
          </div>

          {/* Form Card */}
          <div className="glass-card p-6 shadow-xl flex-1">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Wrench size={20} />
              <h2 className="text-title-lg font-semibold font-outfit">Log Service Record</h2>
            </div>

            {error && <div className="text-error bg-error-container p-3 rounded mb-4 text-sm">{error}</div>}
            {success && <div className="text-emerald-400 bg-emerald-500/10 p-3 rounded mb-4 text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface mb-1">Work Order #</label>
                <input 
                  type="text" 
                  name="workOrderNumber" 
                  required
                  value={formData.workOrderNumber} 
                  onChange={handleInputChange} 
                  className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="WO-1001"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-1">Vehicle</label>
                <select 
                  name="vehicleId" 
                  required
                  value={formData.vehicleId} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name} ({v.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-1">Service Type</label>
                <select 
                  name="maintenanceType" 
                  value={formData.maintenanceType} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  {maintenanceTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface mb-1">Cost (₹)</label>
                  <input 
                    type="number" 
                    name="cost" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.cost} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                    className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  >
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Service details..."
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container py-2.5 rounded-lg font-medium transition-colors shadow-lg active-glow"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="glass-card shadow-xl flex-1 flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-lg font-semibold font-outfit text-on-background">Service Log History</h2>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full">
                <Info size={16} />
                <span>Active records hide vehicle from Dispatcher</span>
              </div>
            </div>
            
            <div className="flex-1 p-0">
              {loading ? (
                <div className="p-10 text-center text-on-surface-variant animate-pulse">Loading logs...</div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={logs} 
                  onAction={(row) => handleComplete(row)}
                />
              )}
            </div>
            <div className="p-4 bg-surface-container-high/30 border-t border-outline-variant text-sm text-on-surface-variant">
              * Click the three dots on an <span className="text-blue-400 font-medium">In Progress</span> record to mark it as <span className="text-emerald-400 font-medium">Completed</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
