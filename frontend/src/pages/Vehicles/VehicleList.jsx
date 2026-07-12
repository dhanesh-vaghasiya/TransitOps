import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import BentoStatCard from '../../components/common/BentoStatCard';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import StatusPill from '../../components/common/StatusPill';
import Modal from '../../components/common/Modal';
import VehicleForm from './VehicleForm';
import { Truck, CheckCircle2, Wrench, Coins } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { hasMutationAccess } from '../../utils/rbac';

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
  { value: 'in_shop', label: 'In Shop' },
  { value: 'retired', label: 'Retired' }
];

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { formatCurrency, formatDistance, settings } = useSettings();
  const { user } = useAuth();
  const canMutate = hasMutationAccess(user?.roles, 'fleet');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll(filters);
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchVehicles(); // Refresh list after add/edit
  };

  // Calculate KPIs
  const activeUnits = vehicles.filter(v => v.status === 'available').length;
  const onTrip = vehicles.filter(v => v.status === 'on_trip').length;
  const inShop = vehicles.filter(v => v.status === 'in_shop').length;
  const avgCostPerUnit = 12.40;

  const columns = [
    { header: 'Reg. No (unique)', accessor: 'registrationNumber' },
    { header: 'Name/Model', accessor: 'name' },
    { header: 'Type', cell: (row) => <span className="capitalize">{row.type}</span> },
    { header: 'Capacity', cell: (row) => `${row.maxLoadCapacity} kg` }, // Simplified display
    { header: 'Odometer', cell: (row) => formatDistance(row.odometer) },
    { header: 'Acq. Cost', cell: (row) => formatCurrency(row.acquisitionCost) },
    { header: 'Status', cell: (row) => <StatusPill status={row.status} /> }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-display-lg-mobile font-bold text-on-background font-outfit">Vehicle Registry</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {canMutate ? 'Manage your fleet, track operational status and costs.' : 'View fleet registry. You have read-only access to this section.'}
          </p>
        </div>
        {canMutate && (
          <button 
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-4 py-2 rounded-lg font-medium transition-colors shadow-lg active-glow"
          >
            + Add Vehicle
          </button>
        )}
        {!canMutate && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-body-sm">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            View Only
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BentoStatCard title="Active Units" value={activeUnits} colorClass="border-emerald-500" icon={CheckCircle2} />
        <BentoStatCard title="On Trip" value={onTrip} colorClass="border-blue-500" icon={Truck} />
        <BentoStatCard title="In Maintenance" value={inShop} colorClass="border-amber-500" icon={Wrench} />
        <BentoStatCard title={`Avg Cost / ${settings.distanceUnit || 'km'}`} value={formatCurrency(avgCostPerUnit)} colorClass="border-primary" icon={Coins} />
      </div>

      <FilterBar 
        filters={filters} 
        setFilters={setFilters}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
      />

      {loading ? (
        <div className="text-center py-10 text-on-surface-variant animate-pulse">Loading vehicles...</div>
      ) : (
        <DataTable columns={columns} data={vehicles} onAction={canMutate ? handleEditClick : undefined} />
      )}

      <div className="mt-4 text-body-sm text-on-error-container bg-error-container p-3 rounded-lg border border-error">
        <span className="font-semibold text-error">Rule:</span> Registration No. must be unique. Retired/In Shop vehicles are hidden from Trip Dispatcher.
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <VehicleForm 
          vehicle={selectedVehicle} 
          onSave={handleSave} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default VehicleList;
