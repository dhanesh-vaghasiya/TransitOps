# Document 4 — Frontend Design
## TransitOps: Smart Transport Operations Platform

---

## 1. Tech Stack & Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    }
  },
  server: { port: 3000, proxy: { '/api': 'http://localhost:5000' } }
});
```

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
```

---

## 2. Component Hierarchy

```
App
├── AuthProvider (Context)
├── ToastProvider (Context)
├── ThemeProvider (Context)
├── SocketProvider (Context)
│
├── Layout (Protected Routes)
│   ├── Navbar
│   ├── Sidebar
│   └── Main Content Area
│       ├── Routes (React Router)
│       │   ├── /login → LoginPage
│       │   ├── /dashboard → DashboardPage
│       │   ├── /vehicles → VehiclesPage
│       │   │   ├── /vehicles → VehicleList
│       │   │   └── /vehicles/:id → VehicleDetail
│       │   ├── /drivers → DriversPage
│       │   │   ├── /drivers → DriverList
│       │   │   └── /drivers/:id → DriverDetail
│       │   ├── /trips → TripsPage
│       │   │   ├── /trips → TripList
│       │   │   ├── /trips/new → TripForm
│       │   │   └── /trips/:id → TripDetail
│       │   ├── /maintenance → MaintenancePage
│       │   ├── /fuel-expenses → FuelExpensePage
│       │   └── /reports → ReportsPage
│       │
│       └── Global Components
│           ├── Modal
│           ├── ConfirmDialog
│           ├── DataTable
│           ├── FilterBar
│           ├── StatCard
│           ├── LineChart
│           ├── BarChart
│           ├── PieChart
│           ├── FormInput
│           ├── FormSelect
│           ├── FormDatePicker
│           ├── Badge
│           ├── SkeletonLoader
│           └── EmptyState
```

---

## 3. Routing Configuration

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { SocketProvider } from '@contexts/SocketContext';
import ProtectedRoute from '@components/layout/ProtectedRoute';
import Layout from '@components/layout/Layout';
import LoginPage from '@pages/Login/LoginPage';
import DashboardPage from '@pages/Dashboard/DashboardPage';
import VehiclesPage from '@pages/Vehicles/VehiclesPage';
import VehicleList from '@pages/Vehicles/VehicleList';
import VehicleDetail from '@pages/Vehicles/VehicleDetail';
import VehicleForm from '@pages/Vehicles/VehicleForm';
import DriversPage from '@pages/Drivers/DriversPage';
import DriverList from '@pages/Drivers/DriverList';
import DriverDetail from '@pages/Drivers/DriverDetail';
import DriverForm from '@pages/Drivers/DriverForm';
import TripsPage from '@pages/Trips/TripsPage';
import TripList from '@pages/Trips/TripList';
import TripForm from '@pages/Trips/TripForm';
import TripDetail from '@pages/Trips/TripDetail';
import MaintenancePage from '@pages/Maintenance/MaintenancePage';
import FuelExpensePage from '@pages/FuelExpense/FuelExpensePage';
import ReportsPage from '@pages/Reports/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/vehicles" element={<VehiclesPage />}>
                    <Route index element={<VehicleList />} />
                    <Route path="new" element={<VehicleForm />} />
                    <Route path=":id" element={<VehicleDetail />} />
                    <Route path=":id/edit" element={<VehicleForm />} />
                  </Route>

                  <Route path="/drivers" element={<DriversPage />}>
                    <Route index element={<DriverList />} />
                    <Route path="new" element={<DriverForm />} />
                    <Route path=":id" element={<DriverDetail />} />
                    <Route path=":id/edit" element={<DriverForm />} />
                  </Route>

                  <Route path="/trips" element={<TripsPage />}>
                    <Route index element={<TripList />} />
                    <Route path="new" element={<TripForm />} />
                    <Route path=":id" element={<TripDetail />} />
                  </Route>

                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/fuel-expenses" element={<FuelExpensePage />} />
                  <Route path="/reports" element={<ReportsPage />} />

                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>
            </Routes>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 4. Screen-by-Screen Design

### 4.1 LOGIN SCREEN (`/login`)

```jsx
// src/pages/Login/LoginPage.jsx
const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TransitOps</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Smart Transport Operations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
            icon={<MailIcon />}
          />
          <FormInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
            icon={<LockIcon />}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo accounts:</p>
          <p>fleet@transitops.com / password123</p>
        </div>
      </div>
    </div>
  );
};
```

---

### 4.2 DASHBOARD SCREEN (`/dashboard`)

```jsx
// src/pages/Dashboard/DashboardPage.jsx
const DashboardPage = () => {
  const { kpis, loading } = useDashboardKPIs();
  const { realtimeData } = useSocket();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <FilterSelect options={vehicleTypes} label="Vehicle Type" />
          <FilterSelect options={statusOptions} label="Status" />
          <button className="btn-secondary" onClick={refreshData}>
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Vehicles"
          value={kpis.activeVehicles}
          icon={<TruckIcon className="w-6 h-6 text-primary-500" />}
          trend="+2"
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="Available Vehicles"
          value={kpis.availableVehicles}
          icon={<CheckIcon className="w-6 h-6 text-success" />}
          color="green"
        />
        <StatCard
          title="In Maintenance"
          value={kpis.maintenanceVehicles}
          icon={<WrenchIcon className="w-6 h-6 text-warning" />}
          color="yellow"
        />
        <StatCard
          title="Fleet Utilization"
          value={kpis.fleetUtilization}
          icon={<ChartIcon className="w-6 h-6 text-info" />}
          color="cyan"
        />
        <StatCard
          title="Active Trips"
          value={kpis.activeTrips}
          icon={<RouteIcon className="w-6 h-6 text-primary-500" />}
          color="blue"
        />
        <StatCard
          title="Pending Trips"
          value={kpis.pendingTrips}
          icon={<ClockIcon className="w-6 h-6 text-warning" />}
          color="yellow"
        />
        <StatCard
          title="Drivers On Duty"
          value={kpis.driversOnDuty}
          icon={<UserIcon className="w-6 h-6 text-success" />}
          color="green"
        />
        <StatCard
          title="Completed Today"
          value={kpis.completedTripsToday}
          icon={<CheckCircleIcon className="w-6 h-6 text-success" />}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fleet Utilization Trend">
          <LineChart
            data={realtimeData.utilizationTrend}
            xKey="date"
            yKey="percentage"
            color="#3b82f6"
          />
        </Card>
        <Card title="Fuel Efficiency by Vehicle">
          <BarChart
            data={realtimeData.fuelEfficiency}
            xKey="vehicleName"
            yKey="efficiency"
            color="#10b981"
          />
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Recent Trips" className="lg:col-span-2">
          <TripTable data={realtimeData.recentTrips} compact />
        </Card>
        <Card title="Alerts">
          <AlertList alerts={realtimeData.alerts} />
        </Card>
      </div>
    </div>
  );
};
```

**StatCard Component:**
```jsx
// src/components/common/StatCard.jsx
const StatCard = ({ title, value, icon, trend, trendUp, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200'
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend} from last week
            </p>
          )}
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};
```

---

### 4.3 VEHICLE LIST SCREEN (`/vehicles`)

```jsx
// src/pages/Vehicles/VehicleList.jsx
const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const columns = [
    { key: 'registrationNumber', label: 'Registration', sortable: true },
    { key: 'name', label: 'Name/Model', sortable: true, render: (v) => `${v.name} ${v.model || ''}` },
    { key: 'type', label: 'Type', sortable: true, render: (v) => <Badge type="type" value={v.type} /> },
    { key: 'maxLoadCapacity', label: 'Capacity', sortable: true, render: (v) => `${v.maxLoadCapacity} kg` },
    { key: 'odometer', label: 'Odometer', sortable: true, render: (v) => `${v.odometer} km` },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v.status} /> },
    { key: 'actions', label: 'Actions', render: (v) => (
      <div className="flex gap-2">
        <button onClick={() => navigate(`/vehicles/${v.id}`)} className="btn-icon" title="View">
          <EyeIcon />
        </button>
        {hasRole('fleet_manager') && (
          <>
            <button onClick={() => navigate(`/vehicles/${v.id}/edit`)} className="btn-icon" title="Edit">
              <EditIcon />
            </button>
            <button onClick={() => handleRetire(v.id)} className="btn-icon text-red-500" title="Retire">
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicles</h2>
        {hasRole('fleet_manager') && (
          <button onClick={() => navigate('/vehicles/new')} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Vehicle
          </button>
        )}
      </div>

      <FilterBar
        filters={[
          { key: 'search', type: 'text', placeholder: 'Search registration or name...' },
          { key: 'type', type: 'select', options: vehicleTypeOptions, placeholder: 'All Types' },
          { key: 'status', type: 'select', options: vehicleStatusOptions, placeholder: 'All Status' }
        ]}
        onFilterChange={setFilters}
      />

      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        sortable
        pagination={{ pageSize: 10 }}
        emptyState={<EmptyState icon={<TruckIcon />} title="No vehicles found" description="Add your first vehicle to get started" />}
      />
    </div>
  );
};
```

**StatusBadge Component:**
```jsx
const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    on_trip: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    in_shop: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    retired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    off_duty: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    draft: 'bg-gray-100 text-gray-800',
    dispatched: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.available}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};
```

---

### 4.4 VEHICLE FORM SCREEN (`/vehicles/new` & `/vehicles/:id/edit`)

```jsx
// src/pages/Vehicles/VehicleForm.jsx
const VehicleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    registrationNumber: '',
    name: '',
    model: '',
    type: 'van',
    maxLoadCapacity: '',
    odometer: 0,
    acquisitionCost: 0
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const vehicleTypes = [
    { value: 'van', label: 'Van' },
    { value: 'truck', label: 'Truck' },
    { value: 'lorry', label: 'Lorry' },
    { value: 'bike', label: 'Bike' },
    { value: 'car', label: 'Car' },
    { value: 'bus', label: 'Bus' }
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!form.name.trim()) newErrors.name = 'Vehicle name is required';
    if (!form.maxLoadCapacity || form.maxLoadCapacity <= 0) newErrors.maxLoadCapacity = 'Capacity must be greater than 0';
    if (form.odometer < 0) newErrors.odometer = 'Odometer cannot be negative';
    if (form.acquisitionCost < 0) newErrors.acquisitionCost = 'Cost cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await vehicleService.update(id, form);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.create(form);
        toast.success('Vehicle created successfully');
      }
      navigate('/vehicles');
    } catch (err) {
      toast.error(err.message);
      if (err.errors) setErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Registration Number *"
            value={form.registrationNumber}
            onChange={(v) => setForm({ ...form, registrationNumber: v })}
            error={errors.registrationNumber}
            disabled={isEdit}
            placeholder="e.g., VAN-05"
          />
          <FormInput
            label="Vehicle Name *"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            error={errors.name}
            placeholder="e.g., Toyota HiAce"
          />
          <FormInput
            label="Model"
            value={form.model}
            onChange={(v) => setForm({ ...form, model: v })}
            placeholder="e.g., 2022"
          />
          <FormSelect
            label="Vehicle Type *"
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v })}
            options={vehicleTypes}
          />
          <FormInput
            label="Max Load Capacity (kg) *"
            type="number"
            value={form.maxLoadCapacity}
            onChange={(v) => setForm({ ...form, maxLoadCapacity: Number(v) })}
            error={errors.maxLoadCapacity}
            placeholder="e.g., 500"
          />
          <FormInput
            label="Current Odometer (km)"
            type="number"
            value={form.odometer}
            onChange={(v) => setForm({ ...form, odometer: Number(v) })}
            error={errors.odometer}
          />
          <FormInput
            label="Acquisition Cost ($)"
            type="number"
            value={form.acquisitionCost}
            onChange={(v) => setForm({ ...form, acquisitionCost: Number(v) })}
            error={errors.acquisitionCost}
            placeholder="e.g., 35000"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <button type="button" onClick={() => navigate('/vehicles')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

---

### 4.5 DRIVER SCREENS (Similar to Vehicle)

**Driver List** (`/drivers`)
- Columns: Name, License Number, Category, Expiry Date, Safety Score, Status, Actions
- Special feature: Color-coded expiry dates (red if <30 days, yellow if <90 days)
- Filter: Status, License Category, Expiring Soon toggle

**Driver Form** (`/drivers/new` & `/drivers/:id/edit`)
- Fields: Name, License Number (unique), License Category (select), License Expiry (date picker), Contact Number, Safety Score (0-100 slider), Status (select)
- Validation: License expiry must be future date, safety score 0-100

---

### 4.6 TRIP MANAGEMENT SCREENS

#### Trip List (`/trips`)
```jsx
const TripList = () => {
  const columns = [
    { key: 'id', label: 'Trip ID', render: (t) => `#${t.id}` },
    { key: 'source', label: 'Route', render: (t) => `${t.source} → ${t.destination}` },
    { key: 'vehicle', label: 'Vehicle', render: (t) => t.vehicle?.name },
    { key: 'driver', label: 'Driver', render: (t) => t.driver?.name },
    { key: 'cargoWeight', label: 'Cargo', render: (t) => `${t.cargoWeight} kg` },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'actions', label: 'Actions', render: (t) => (
      <div className="flex gap-2">
        {t.status === 'draft' && (
          <button onClick={() => dispatchTrip(t.id)} className="btn-sm btn-primary">
            Dispatch
          </button>
        )}
        {t.status === 'dispatched' && (
          <>
            <button onClick={() => completeTrip(t.id)} className="btn-sm btn-success">
              Complete
            </button>
            <button onClick={() => cancelTrip(t.id)} className="btn-sm btn-danger">
              Cancel
            </button>
          </>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Trip Management</h2>
        <button onClick={() => navigate('/trips/new')} className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Trip
        </button>
      </div>
      <DataTable columns={columns} data={trips} />
    </div>
  );
};
```

#### Trip Form (`/trips/new`)
```jsx
const TripForm = () => {
  const [form, setForm] = useState({
    vehicleId: '',
    driverId: '',
    source: '',
    destination: '',
    cargoWeight: '',
    plannedDistance: ''
  });
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch available vehicles and drivers on mount
  useEffect(() => {
    vehicleService.getAvailable().then(setAvailableVehicles);
    driverService.getAvailable().then(setAvailableDrivers);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.vehicleId) newErrors.vehicleId = 'Select a vehicle';
    if (!form.driverId) newErrors.driverId = 'Select a driver';
    if (!form.source.trim()) newErrors.source = 'Source required';
    if (!form.destination.trim()) newErrors.destination = 'Destination required';
    if (!form.cargoWeight || form.cargoWeight <= 0) newErrors.cargoWeight = 'Cargo weight must be > 0';
    if (selectedVehicle && form.cargoWeight > selectedVehicle.maxLoadCapacity) {
      newErrors.cargoWeight = `Exceeds vehicle capacity (${selectedVehicle.maxLoadCapacity}kg)`;
    }
    if (!form.plannedDistance || form.plannedDistance <= 0) newErrors.plannedDistance = 'Distance must be > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Vehicle *"
          value={form.vehicleId}
          onChange={(v) => {
            const vehicle = availableVehicles.find(vh => vh.id === Number(v));
            setSelectedVehicle(vehicle);
            setForm({ ...form, vehicleId: Number(v) });
          }}
          options={availableVehicles.map(v => ({ value: v.id, label: `${v.name} (${v.registrationNumber}) - ${v.maxLoadCapacity}kg` }))}
          error={errors.vehicleId}
        />
        <FormSelect
          label="Driver *"
          value={form.driverId}
          onChange={(v) => setForm({ ...form, driverId: Number(v) })}
          options={availableDrivers.map(d => ({ value: d.id, label: `${d.name} (License: ${d.licenseNumber})` }))}
          error={errors.driverId}
        />
        <FormInput label="Source *" value={form.source} onChange={(v) => setForm({ ...form, source: v })} error={errors.source} />
        <FormInput label="Destination *" value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} error={errors.destination} />
        <FormInput
          label={`Cargo Weight (kg) * ${selectedVehicle ? `[Max: ${selectedVehicle.maxLoadCapacity}kg]` : ''}`}
          type="number"
          value={form.cargoWeight}
          onChange={(v) => setForm({ ...form, cargoWeight: Number(v) })}
          error={errors.cargoWeight}
        />
        <FormInput
          label="Planned Distance (km) *"
          type="number"
          value={form.plannedDistance}
          onChange={(v) => setForm({ ...form, plannedDistance: Number(v) })}
          error={errors.plannedDistance}
        />
      </div>
      <button type="submit" className="btn-primary">Create Trip</button>
    </form>
  );
};
```

#### Complete Trip Modal
```jsx
const CompleteTripModal = ({ trip, onClose, onComplete }) => {
  const [data, setData] = useState({ actualDistance: '', fuelConsumed: '', finalOdometer: '' });

  return (
    <Modal isOpen onClose={onClose} title="Complete Trip">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Trip #{trip.id}: {trip.source} → {trip.destination}</p>
        <FormInput label="Actual Distance (km) *" type="number" value={data.actualDistance} onChange={(v) => setData({ ...data, actualDistance: v })} />
        <FormInput label="Fuel Consumed (L) *" type="number" value={data.fuelConsumed} onChange={(v) => setData({ ...data, fuelConsumed: v })} />
        <FormInput label="Final Odometer Reading *" type="number" value={data.finalOdometer} onChange={(v) => setData({ ...data, finalOdometer: v })} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onComplete(data)} className="btn-success">Complete Trip</button>
        </div>
      </div>
    </Modal>
  );
};
```

---

### 4.7 MAINTENANCE SCREEN (`/maintenance`)

```jsx
const MaintenancePage = () => {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const columns = [
    { key: 'vehicle', label: 'Vehicle', render: (m) => m.vehicle?.name },
    { key: 'maintenanceType', label: 'Type', render: (m) => <Badge value={m.maintenanceType} /> },
    { key: 'description', label: 'Description' },
    { key: 'cost', label: 'Cost', render: (m) => `$${m.cost}` },
    { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    { key: 'actions', label: 'Actions', render: (m) => (
      <div className="flex gap-2">
        {m.status === 'scheduled' && (
          <button onClick={() => startMaintenance(m.id)} className="btn-sm btn-warning">Start</button>
        )}
        {m.status === 'in_progress' && (
          <button onClick={() => completeMaintenance(m.id)} className="btn-sm btn-success">Complete</button>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Maintenance Logs</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">Schedule Maintenance</button>
      </div>
      <DataTable columns={columns} data={logs} />
      {showForm && <MaintenanceFormModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
    </div>
  );
};
```

---

### 4.8 FUEL & EXPENSE SCREEN (`/fuel-expenses`)

**Tabbed Interface:**
```jsx
const FuelExpensePage = () => {
  const [activeTab, setActiveTab] = useState('fuel');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Fuel & Expenses</h2>
        <button className="btn-primary">Add Entry</button>
      </div>

      <div className="border-b dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`pb-2 px-1 ${activeTab === 'fuel' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
          >
            Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-2 px-1 ${activeTab === 'expenses' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
          >
            Other Expenses
          </button>
        </nav>
      </div>

      {activeTab === 'fuel' ? <FuelLogTable /> : <ExpenseTable />}
    </div>
  );
};
```

---

### 4.9 REPORTS SCREEN (`/reports`)

```jsx
const ReportsPage = () => {
  const [reportType, setReportType] = useState('fuel-efficiency');
  const [data, setData] = useState([]);
  const [exporting, setExporting] = useState(false);

  const reportTypes = [
    { value: 'fuel-efficiency', label: 'Fuel Efficiency', chart: 'bar' },
    { value: 'operational-cost', label: 'Operational Cost', chart: 'pie' },
    { value: 'vehicle-roi', label: 'Vehicle ROI', chart: 'bar' },
    { value: 'fleet-utilization', label: 'Fleet Utilization', chart: 'line' }
  ];

  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, `${reportType}-report.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('TransitOps Report', 14, 15);
    doc.autoTable({
      head: [Object.keys(data[0] || {})],
      body: data.map(row => Object.values(row)),
      startY: 25
    });
    doc.save(`${reportType}-report.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button onClick={exportPDF} className="btn-secondary">
            <FileIcon className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {reportTypes.map(rt => (
          <button
            key={rt.value}
            onClick={() => setReportType(rt.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === rt.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {rt.label}
          </button>
        ))}
      </div>

      <Card>
        {reportType === 'fuel-efficiency' && <BarChart data={data} xKey="vehicleName" yKey="efficiency" />}
        {reportType === 'operational-cost' && <PieChart data={data} nameKey="category" valueKey="amount" />}
        {reportType === 'vehicle-roi' && <BarChart data={data} xKey="vehicleName" yKey="roi" />}
        {reportType === 'fleet-utilization' && <LineChart data={data} xKey="date" yKey="percentage" />}
      </Card>

      <DataTable
        columns={Object.keys(data[0] || {}).map(key => ({ key, label: key.replace(/_/g, ' ').toUpperCase() }))}
        data={data}
      />
    </div>
  );
};
```

---

## 5. Reusable Component Library

### 5.1 DataTable
```jsx
// src/components/common/DataTable.jsx
const DataTable = ({ columns, data, loading, sortable, pagination, emptyState }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pagination.pageSize, currentPage * pagination.pageSize)
    : sortedData;

  if (loading) return <SkeletonLoader rows={5} columns={columns.length} />;
  if (!data.length) return emptyState;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => sortable && setSortConfig({ key: col.key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                {col.label}
                {sortable && sortConfig.key === col.key && (
                  <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pagination.pageSize + 1} to {Math.min(currentPage * pagination.pageSize, data.length)} of {data.length}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-sm btn-secondary">Previous</button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * pagination.pageSize >= data.length} className="btn-sm btn-secondary">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 5.2 Modal
```jsx
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

### 5.3 ConfirmDialog
```jsx
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger' }) => {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700',
    primary: 'bg-primary-600 hover:bg-primary-700',
    success: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className={`btn-primary ${variants[confirmVariant]}`}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
```

---

## 6. Context Providers

### 6.1 AuthContext
```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6.2 SocketContext (Real-time)
```jsx
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [realtimeData, setRealtimeData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_API_URL, { auth: { token } });

    newSocket.on('dashboard:update', (data) => setRealtimeData(prev => ({ ...prev, kpis: data })));
    newSocket.on('trip:dispatched', (data) => {
      toast.info(`Trip #${data.tripId} dispatched`);
      setRealtimeData(prev => ({ ...prev, lastEvent: data }));
    });
    newSocket.on('vehicle:status_changed', (data) => {
      // Trigger re-fetch of vehicle lists
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, realtimeData }}>
      {children}
    </SocketContext.Provider>
  );
};
```

### 6.3 ThemeContext (Dark Mode)
```jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode: () => setDarkMode(!darkMode) }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 7. API Service Layer

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject({ message, errors: error.response?.data?.errors });
  }
);

export default api;
```

```javascript
// src/services/vehicle.service.js
import api from './api';

export const vehicleService = {
  list: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  remove: (id) => api.delete(`/vehicles/${id}`),
  getAvailable: () => api.get('/vehicles/available')
};
```

---

## 8. UI Flow Diagrams

### 8.1 Authentication Flow
```
Login Page → Validate → Store JWT → Fetch User → Redirect to Dashboard
    ↓
Invalid → Show Error Toast → Stay on Login
```

### 8.2 Trip Creation Flow
```
Dashboard → Click "Create Trip" → Trip Form
    ↓
Select Vehicle (available only) → Select Driver (available + valid license)
    ↓
Enter Cargo Weight → Validate ≤ Vehicle Capacity
    ↓
Enter Distance → Submit → Create Draft
    ↓
Trip List → Click "Dispatch" → Confirm → Status: Dispatched
    ↓
Vehicle & Driver status → On Trip (real-time update)
    ↓
Click "Complete" → Enter Actual Distance, Fuel, Odometer → Submit
    ↓
Vehicle & Driver status → Available (real-time update)
```

### 8.3 Maintenance Flow
```
Maintenance Page → Click "Schedule Maintenance"
    ↓
Select Vehicle (not on trip, not retired) → Enter Type, Description, Cost
    ↓
Submit → Status: Scheduled
    ↓
Click "Start" → Vehicle status → In Shop (hidden from dispatch)
    ↓
Click "Complete" → Vehicle status → Available
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|---------------|
| Mobile | < 640px | Single column, sidebar becomes drawer, tables scroll horizontally |
| Tablet | 640-1024px | 2-column grids, sidebar collapsible |
| Desktop | > 1024px | Full layout, 4-column KPI grid, sidebar always visible |

---

## 10. Performance Optimizations

1. **React.memo** on StatCard, StatusBadge, DataTable rows
2. **useMemo** for sorted/filtered data in tables
3. **useCallback** for event handlers passed to children
4. **Lazy loading** for report charts (React.lazy + Suspense)
5. **Debounced search** in filter bars (300ms)
6. **Pagination** on all tables (10 items per page)
7. **Optimistic UI** for status transitions (update UI before API response)
