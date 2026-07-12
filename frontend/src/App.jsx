import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

import VehicleList from './pages/Vehicles/VehicleList';
import TripsPage from './pages/Trips/index';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Drivers from './pages/Drivers';
import { AuthProvider } from './contexts/AuthContext';

const Home = () => <div className="p-4 text-white">Dashboard (Phase 9)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="fleet" element={<VehicleList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
