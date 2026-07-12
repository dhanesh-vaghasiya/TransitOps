import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiClient';
import { setLiveRbacMatrix } from '../utils/rbac';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [settings, setSettings] = useState({
    depotName: 'Central Transit Depot',
    currency: 'INR',
    distanceUnit: 'km',
    rbacMatrix: null,
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (settings && settings.rbacMatrix) {
      setLiveRbacMatrix(settings.rbacMatrix);
    }
  }, [settings?.rbacMatrix]);

  const fetchMe = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      if (response.data.data.settings) {
        setSettings(response.data.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user, settings } = response.data.data;
    setToken(token);
    setUser(user);
    if (settings) {
      setSettings(settings);
    }
    return user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '—';
    const c = settings?.currency || 'INR';
    const locale = c === 'INR' ? 'en-IN' : 'en-US';
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(val);
    } catch (e) {
      return `${c} ${parseFloat(val).toFixed(2)}`;
    }
  };

  const formatDistance = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '—';
    const unit = settings?.distanceUnit || 'km';
    return `${parseFloat(val).toFixed(0)} ${unit}`;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, settings, setSettings, formatCurrency, formatDistance }}>
      {!loading ? children : <div className="flex h-screen items-center justify-center text-primary">Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const useSettings = () => useContext(AuthContext);
