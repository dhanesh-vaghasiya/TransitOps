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
      {/* Clean dark brown gradient background with subtle refraction points */}
      <div className="fixed inset-0 z-[-1] bg-linear-to-br from-[#271e18] to-[#150c07] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-[#3a281e]/30 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[60%] bg-primary/5 rounded-full blur-[140px] animate-pulse-slow" />
      </div>
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
