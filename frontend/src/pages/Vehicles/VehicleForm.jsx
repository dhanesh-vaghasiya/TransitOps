import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import { AlertCircle } from 'lucide-react';

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    model: '',
    type: 'van',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
    status: 'available'
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber || '',
        name: vehicle.name || '',
        model: vehicle.model || '',
        type: vehicle.type || 'van',
        maxLoadCapacity: vehicle.maxLoadCapacity || '',
        odometer: vehicle.odometer || '',
        acquisitionCost: vehicle.acquisitionCost || '',
        status: vehicle.status || 'available'
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        odometer: formData.odometer ? Number(formData.odometer) : 0,
        acquisitionCost: formData.acquisitionCost ? Number(formData.acquisitionCost) : 0
      };

      if (vehicle) {
        await vehicleService.update(vehicle.id, payload);
      } else {
        await vehicleService.create(payload);
      }
      onSave();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('A vehicle with this Registration Number already exists.');
      } else {
        setError(err.response?.data?.message || 'Failed to save vehicle.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Registration No. *</label>
          <input 
            required
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none"
            placeholder="e.g. MH-12-AB-1234"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Name *</label>
          <input 
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none"
            placeholder="e.g. Delivery Van 1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Model</label>
          <input 
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none"
            placeholder="e.g. Tata Ace"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Type *</label>
          <select 
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none capitalize"
          >
            {['van', 'truck', 'lorry', 'bike', 'car', 'bus'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Max Load Capacity (kg) *</label>
          <input 
            required
            type="number"
            min="0"
            step="0.01"
            name="maxLoadCapacity"
            value={formData.maxLoadCapacity}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none"
            placeholder="1000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Acquisition Cost (₹)</label>
          <input 
            type="number"
            min="0"
            step="0.01"
            name="acquisitionCost"
            value={formData.acquisitionCost}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none"
            placeholder="500000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Odometer (km)</label>
          <input 
            type="number"
            min="0"
            step="0.01"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none"
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-400 font-medium">Status *</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange outline-none capitalize"
          >
            {['available', 'on_trip', 'in_shop', 'retired'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-brand-orange hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
