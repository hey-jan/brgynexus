"use client";

import * as React from "react";
import { Users, Clock, CheckCircle, DollarSign, Activity } from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

export default function AdminDashboard() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"));
  }, []);

  if (!data) return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Overview</h1>
      <p className="text-slate-500">Loading data...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Overview</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Residents */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Residents</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalResidents}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-full dark:bg-amber-900/50">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Requests</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.pendingCount}</p>
          </div>
        </div>

        {/* Documents Released */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full dark:bg-emerald-900/50">
            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Released</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.releasedCount}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/50">
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">₱{data.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Volume Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-slate-500" />
            Request Volume (Last 7 Days)
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="99%" height={300}>
              <LineChart data={data.volumeChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Status Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Request Status Distribution</h2>
          <div className="w-full h-[300px] flex-grow">
            <ResponsiveContainer width="99%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusChart}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.statusChart?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 pb-4 flex flex-wrap justify-center gap-4">
              {data.statusChart?.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600 dark:text-slate-400 capitalize">{entry.name.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
