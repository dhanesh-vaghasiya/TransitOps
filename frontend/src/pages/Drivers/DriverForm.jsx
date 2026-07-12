import React, { useState, useEffect } from 'react';
import driverService from '../../services/driverService';
import Select from '../../components/ui/Select';

const DriverForm = ({ driver, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'van',
    licenseExpiry: '',
    contactNumber: '',
    safetyScore: 100,
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        licenseNumber: driver.licenseNumber || '',
        licenseCategory: driver.licenseCategory || 'van',
        licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
        contactNumber: driver.contactNumber || '',
        safetyScore: driver.safetyScore || 100,
        status: driver.status || 'available'
      });
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'safetyScore' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (driver?.id) {
        await driverService.updateDriver(driver.id, formData);
      } else {
        await driverService.createDriver(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {driver ? 'Edit Driver' : 'Add New Driver'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <Select
                name="licenseCategory"
                value={formData.licenseCategory}
                onChange={handleChange}
                className="w-full"
              >
                {[
                  { value: 'van', label: 'Van' },
                  { value: 'truck', label: 'Truck' },
                  { value: 'lorry', label: 'Lorry' },
                  { value: 'bike', label: 'Bike' },
                  { value: 'car', label: 'Car' },
                  { value: 'bus', label: 'Bus' }
                ].map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
              <input
                type="date"
                name="licenseExpiry"
                required
                max="2100-12-31"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-white"
              />
            </div>
          </div>
          
          {driver && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full"
              >
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="off_duty">Off Duty</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;
