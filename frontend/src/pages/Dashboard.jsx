import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

const Dashboard = () => {
  const [health, setHealth] = useState('Checking...');

  useEffect(() => {
    apiClient.get('/health')
      .then(res => setHealth(res.data.message))
      .catch(err => setHealth('API Unreachable'));
  }, []);

  return (
    <div>
      <h1>Dashboard Placeholder</h1>
      <p>Welcome to TransitOps. Backend status: {health}</p>
    </div>
  );
};

export default Dashboard;
