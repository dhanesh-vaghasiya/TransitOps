import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import VehicleList from './pages/Vehicles/VehicleList';
import TripsPage from './pages/Trips/index';
import FuelExpensePage from './pages/FuelExpense/index';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Drivers from './pages/Drivers';
import Maintenance from './pages/Maintenance';
import Dashboard from './pages/Dashboard/Dashboard';
import SettingsPage from './pages/Settings/SettingsPage';
import Analytics from './pages/Analytics/Analytics';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="fuel" element={<FuelExpensePage />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="fleet" element={<VehicleList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['fleet_manager']}><SettingsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
