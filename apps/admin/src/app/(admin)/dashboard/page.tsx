'use client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard } from '@/lib/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Phone, Flag, Building2, Users, AlertTriangle, TrendingUp, ShieldCheck, ShieldAlert, RefreshCw, Mail } from 'lucide-react';

interface DashboardData {
  stats: {
    totalNumbers: number;
    highRiskNumbers: number;
    pendingReports: number;
    pendingClaims: number;
    totalUsers: number;
    totalReports: number;
    verifiedNumbers: number;
    resolvedDisputes: number;
    waitlistCount?: number;
  };
  recentActivity: Array<{ date: string; reports: number; lookups: number }>;
  riskDistribution: Array<{ level: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
}

const RISK_COLORS: Record<string, string> = {
  SAFE: '#22c55e',
  LOW_RISK: '#eab308',
  CAUTION: '#f97316',
  LIKELY_SPAM: '#ef4444',
  HIGH_RISK: '#dc2626',
  UNKNOWN: '#6b7280',
};

const statCards = [
  { key: 'totalNumbers', label: 'Total Numbers', icon: Phone, color: 'text-blue-400' },
  { key: 'highRiskNumbers', label: 'High Risk', icon: ShieldAlert, color: 'text-red-400' },
  { key: 'pendingReports', label: 'Pending Reports', icon: Flag, color: 'text-yellow-400' },
  { key: 'pendingClaims', label: 'Pending Claims', icon: Building2, color: 'text-purple-400' },
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-cyan-400' },
  { key: 'totalReports', label: 'Total Reports', icon: AlertTriangle, color: 'text-orange-400' },
  { key: 'verifiedNumbers', label: 'Verified', icon: ShieldCheck, color: 'text-green-400' },
  { key: 'resolvedDisputes', label: 'Disputes Resolved', icon: TrendingUp, color: 'text-indigo-400' },
  { key: 'waitlistCount', label: 'Waitlist Signups', icon: Mail, color: 'text-pink-400' },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    getDashboard()
      .then((d) => { setData(d); setApiDown(false); setLastUpdated(new Date()); })
      .catch(() => {
        setApiDown(true);
        setData({
          stats: {
            totalNumbers: 23, highRiskNumbers: 7, pendingReports: 4, pendingClaims: 2,
            totalUsers: 5, totalReports: 18, verifiedNumbers: 10, resolvedDisputes: 1,
          },
          recentActivity: [
            { date: 'Mon', reports: 3, lookups: 12 },
            { date: 'Tue', reports: 5, lookups: 18 },
            { date: 'Wed', reports: 2, lookups: 9 },
            { date: 'Thu', reports: 8, lookups: 24 },
            { date: 'Fri', reports: 4, lookups: 16 },
            { date: 'Sat', reports: 6, lookups: 20 },
            { date: 'Sun', reports: 1, lookups: 7 },
          ],
          riskDistribution: [
            { level: 'SAFE', count: 10 },
            { level: 'LOW_RISK', count: 2 },
            { level: 'CAUTION', count: 2 },
            { level: 'LIKELY_SPAM', count: 4 },
            { level: 'HIGH_RISK', count: 5 },
          ],
          topCategories: [
            { category: 'FRAUD', count: 5 },
            { category: 'SPAM', count: 4 },
            { category: 'SCAM', count: 3 },
            { category: 'TELEMARKETING', count: 2 },
            { category: 'HARASSMENT', count: 1 },
          ],
        });
      })
      .finally(() => { setLoading(false); setRefreshing(false); });
  }

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(true), 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="ClearRing platform overview" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Last updated bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Loading…'}
          </span>
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        {apiDown && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
            <span className="text-base">⚠️</span>
            <span>Backend unreachable — showing sample data. Start the API server and refresh.</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
            >
              Refresh
            </button>
          </div>
        )}
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon, color }) => (
            <Card key={key}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">
                    {stats?.[key as keyof typeof stats] ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Activity Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.recentActivity ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="reports" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="lookups" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data?.riskDistribution ?? []}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ level, percent }) => `${level} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(data?.riskDistribution ?? []).map((entry) => (
                      <Cell key={entry.level} fill={RISK_COLORS[entry.level] ?? '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Report Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.topCategories ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
