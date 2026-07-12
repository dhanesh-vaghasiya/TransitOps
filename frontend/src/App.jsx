import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

import VehicleList from './pages/Vehicles/VehicleList';

const Home = () => <div className="p-4">Dashboard (Phase 9)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="fleet" element={<VehicleList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
