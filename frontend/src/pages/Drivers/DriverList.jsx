import React, { useState, useEffect } from 'react';
import driverService from '../../services/driverService';
import SegmentedControl from '../../components/common/SegmentedControl';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import DriverForm from './DriverForm';
import { useAuth } from '../../contexts/AuthContext';
import { hasMutationAccess } from '../../utils/rbac';

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'On Trip', value: 'on_trip' },
  { label: 'Off Duty', value: 'off_duty' },
  { label: 'Suspended', value: 'suspended' }
];

const isLicenseExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
};

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const { user } = useAuth();
  const canMutate = hasMutationAccess(user?.roles, 'drivers');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getAllDrivers();
      setDrivers(data.data?.drivers || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDriver(null);
  };

  const handleSuccess = () => {
    handleCloseForm();
    fetchDrivers();
  };

  const filteredDrivers = drivers.filter(driver => {
    if (filter === 'all') return true;
    return driver.status === filter;
  });

  const columns = [
    {
      header: 'Driver Info',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-on-surface">{row.name}</div>
            <div className="text-xs text-on-surface-variant">{row.contactNumber}</div>
          </div>
        </div>
      )
    },
    {
      header: 'License',
      accessor: 'licenseNumber',
      cell: (row) => {
        const expired = isLicenseExpired(row.licenseExpiry);
        return (
          <div>
            <div className="font-mono text-on-surface">{row.licenseNumber} <span className="text-xs text-on-surface-variant">({row.licenseCategory ? row.licenseCategory.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''})</span></div>
            <div className={`text-xs ${expired ? 'text-red-500 font-medium' : 'text-on-surface-variant'}`}>
              Expires: {new Date(row.licenseExpiry).toLocaleDateString()}
              {expired && ' (EXPIRED)'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Safety Score',
      accessor: 'safetyScore',
      cell: (row) => (
        <div className="w-32">
          <div className="flex justify-between text-xs mb-1">
            <span className={row.safetyScore < 80 ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>{row.safetyScore}/100</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full ${row.safetyScore < 80 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(row.safetyScore, 100)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusPill status={row.status} />
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Driver Management</h1>
          <p className="text-on-surface-variant text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            Note: Drivers with suspended status or expired licenses are automatically excluded from the dispatch pool.
          </p>
        </div>

        <div className="flex gap-2">
          {!canMutate && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant text-body-sm">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              View Only
            </span>
          )}
          {canMutate && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Driver
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex justify-start">
        <SegmentedControl
          options={filterOptions}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredDrivers}
            onRowClick={canMutate ? handleEdit : undefined}
          />
        )}
      </div>

      {isFormOpen && (
        <DriverForm
          driver={editingDriver}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default DriverList;
