import React, { useState, useEffect } from 'react';
import { Fuel, TrendingUp, Users, Coins, TrendingDown, LineChart, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import reportService from '../../services/reportService';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await reportService.getAnalyticsData();
        setData(response);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportPDF = async () => {
    try {
      const blob = await reportService.exportPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transitops-analytics.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading Analytics...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-error">Failed to load analytics data.</div>;
  }

  const { kpis, charts } = data;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2 font-bold">Fleet Analytics</h2>
            <p className="text-body-md text-on-surface-variant max-w-2xl">Real-time performance metrics and operational insights for the entire transit network.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors text-body-sm font-bold shadow-lg shadow-primary/20"
            >
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Fuel Efficiency */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Fuel className="text-emerald-600" size={24} />
              </div>
            </div>
            <p className="text-label-caps text-on-surface-variant mb-1">Fuel Efficiency</p>
            <h3 className="text-headline-md font-bold text-on-surface">{kpis.fuelEfficiency}</h3>
            <div className="mt-4 h-12 w-full flex items-end gap-1">
              <div className="flex-1 bg-emerald-500/20 rounded-t-sm h-6 group-hover:h-8 transition-all"></div>
              <div className="flex-1 bg-emerald-500/20 rounded-t-sm h-4 group-hover:h-6 transition-all"></div>
              <div className="flex-1 bg-emerald-500/20 rounded-t-sm h-7 group-hover:h-9 transition-all"></div>
              <div className="flex-1 bg-emerald-500/40 rounded-t-sm h-5 group-hover:h-7 transition-all"></div>
              <div className="flex-1 bg-emerald-500/60 rounded-t-sm h-9 group-hover:h-12 transition-all"></div>
              <div className="flex-1 bg-emerald-500 rounded-t-sm h-8 group-hover:h-10 transition-all"></div>
            </div>
          </div>

          {/* Fleet Utilization */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-label-caps text-on-surface-variant mb-1">Fleet Utilization</p>
            <h3 className="text-headline-md font-bold text-on-surface">{kpis.fleetUtilization}</h3>
            <div className="mt-4 h-12 w-full flex items-end gap-1">
              <div className="flex-1 bg-blue-500/20 rounded-t-sm h-8"></div>
              <div className="flex-1 bg-blue-500/20 rounded-t-sm h-9"></div>
              <div className="flex-1 bg-blue-500/40 rounded-t-sm h-10"></div>
              <div className="flex-1 bg-blue-500/60 rounded-t-sm h-8"></div>
              <div className="flex-1 bg-blue-500/80 rounded-t-sm h-11"></div>
              <div className="flex-1 bg-blue-500 rounded-t-sm h-12"></div>
            </div>
          </div>

          {/* Op Cost */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Coins className="text-primary" size={24} />
              </div>
            </div>
            <p className="text-label-caps text-on-surface-variant mb-1">Total Op Cost</p>
            <h3 className="text-headline-md font-bold text-on-surface">{kpis.operationalCost}</h3>
            <div className="mt-4 h-12 w-full flex items-end gap-1">
              <div className="flex-1 bg-primary/20 rounded-t-sm h-12"></div>
              <div className="flex-1 bg-primary/20 rounded-t-sm h-11"></div>
              <div className="flex-1 bg-primary/40 rounded-t-sm h-10"></div>
              <div className="flex-1 bg-primary/60 rounded-t-sm h-9"></div>
              <div className="flex-1 bg-primary/80 rounded-t-sm h-8"></div>
              <div className="flex-1 bg-primary rounded-t-sm h-7"></div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <LineChart className="text-tertiary" size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-body-sm font-bold">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-label-caps text-on-surface-variant mb-1">Vehicle ROI</p>
            <h3 className="text-headline-md font-bold text-on-surface">{kpis.roi}</h3>
            <div className="mt-4 h-12 w-full flex items-end gap-1">
              <div className="flex-1 bg-tertiary/20 rounded-t-sm h-4"></div>
              <div className="flex-1 bg-tertiary/20 rounded-t-sm h-6"></div>
              <div className="flex-1 bg-tertiary/40 rounded-t-sm h-8"></div>
              <div className="flex-1 bg-tertiary/60 rounded-t-sm h-7"></div>
              <div className="flex-1 bg-tertiary/80 rounded-t-sm h-10"></div>
              <div className="flex-1 bg-tertiary rounded-t-sm h-12"></div>
            </div>
          </div>
        </div>

        {/* Middle Row: Revenue & Costly Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Monthly Revenue Comparison */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-title-sm text-on-surface font-bold">Monthly Revenue Comparison (INR)</h3>
                <p className="text-body-sm text-on-surface-variant">Last 12 months projection vs actuals</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                  <span className="text-label-caps text-on-surface-variant">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                  <span className="text-label-caps text-on-surface-variant">Projected</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyRevenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2} barSize={20}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} dy={10} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', color: 'var(--color-on-surface)' }} />
                  <Bar dataKey="actual" fill="var(--color-primary-container)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="projected" fill="var(--color-outline-variant)" radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Costliest Vehicles */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col">
            <h3 className="text-title-sm text-on-surface mb-6 font-bold">Costliest Vehicles</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.costliestVehicles} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={16}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} width={80} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', color: 'var(--color-on-surface)' }} />
                  <Bar dataKey="cost" fill="var(--color-error)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
