'use client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics } from '@/lib/api';
import { riskBadgeColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface TopNumber { number: string; reports: number; riskLevel: string; category: string }

interface AnalyticsData {
  dailyReports: Array<{ date: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  regionBreakdown: Array<{ region: string; count: number }>;
  lookupTrend: Array<{ date: string; lookups: number }>;
  topReported?: TopNumber[];
}

const CATEGORY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const mockData: AnalyticsData = {
  dailyReports: Array.from({ length: 14 }, (_, i) => ({
    date: `Day ${i + 1}`,
    count: Math.floor(Math.random() * 8) + 1,
  })),
  categoryBreakdown: [
    { category: 'FRAUD', count: 12 },
    { category: 'SPAM', count: 18 },
    { category: 'SCAM', count: 9 },
    { category: 'HARASSMENT', count: 5 },
    { category: 'TELEMARKETING', count: 7 },
    { category: 'ROBOCALL', count: 3 },
    { category: 'OTP_SCAM', count: 6 },
  ],
  regionBreakdown: [
    { region: 'Chennai', count: 14 },
    { region: 'Mumbai', count: 11 },
    { region: 'Delhi', count: 9 },
    { region: 'Bangalore', count: 8 },
    { region: 'Hyderabad', count: 6 },
    { region: 'Other', count: 12 },
  ],
  lookupTrend: Array.from({ length: 14 }, (_, i) => ({
    date: `Day ${i + 1}`,
    lookups: Math.floor(Math.random() * 30) + 5,
  })),
  topReported: [
    { number: '+919999999999', reports: 142, riskLevel: 'HIGH_RISK', category: 'FRAUD' },
    { number: '+918888888888', reports: 98, riskLevel: 'HIGH_RISK', category: 'SCAM' },
    { number: '+917777777777', reports: 76, riskLevel: 'LIKELY_SPAM', category: 'ROBOCALL' },
    { number: '+916666666666', reports: 64, riskLevel: 'LIKELY_SPAM', category: 'TELEMARKETING' },
    { number: '+915555555555', reports: 51, riskLevel: 'CAUTION', category: 'SPAM' },
    { number: '+914444444444', reports: 43, riskLevel: 'HIGH_RISK', category: 'OTP_SCAM' },
    { number: '+913333333333', reports: 38, riskLevel: 'LIKELY_SPAM', category: 'PAYMENT_SCAM' },
    { number: '+912222222222', reports: 29, riskLevel: 'CAUTION', category: 'HARASSMENT' },
    { number: '+911111111111', reports: 22, riskLevel: 'CAUTION', category: 'SPAM' },
    { number: '+910000000000', reports: 17, riskLevel: 'LOW_RISK', category: 'TELEMARKETING' },
  ],
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAnalytics()
      .then((d) => { setData(d); setUsingMock(false); })
      .catch(() => { setData(mockData); setUsingMock(true); })
      .finally(() => setLoading(false));
  }, []);

  const chartData = data ?? mockData;

  return (
    <div className="flex flex-col h-full">
      <Header title="Analytics" subtitle="Platform usage and trend insights" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-sm">Loading analytics…</span>
            </div>
          </div>
        )}
        {!loading && usingMock && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-600 dark:text-yellow-400">
            Could not reach the API — showing sample data. Check that the backend is running.
          </div>
        )}
        {!loading && <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Daily Reports Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Reports (14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.dailyReports}>
                  <defs>
                    <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="#ef4444" fill="url(#reportGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lookup Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lookup Trend (14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.lookupTrend}>
                  <defs>
                    <linearGradient id="lookupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="lookups" stroke="#3b82f6" fill="url(#lookupGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>}

        {!loading && <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Category Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData.categoryBreakdown} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category}>
                    {chartData.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Region Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reports by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.regionBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="region" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>}

        {/* Top-10 most reported numbers */}
        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top 10 Most Reported Numbers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Report Bar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(chartData.topReported ?? []).map((item, i) => {
                    const maxReports = chartData.topReported?.[0]?.reports ?? 1;
                    const pct = Math.round((item.reports / maxReports) * 100);
                    return (
                      <TableRow key={item.number}>
                        <TableCell className="text-sm font-bold text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-mono text-sm font-medium">{item.number}</TableCell>
                        <TableCell className="text-sm font-bold">{item.reports}</TableCell>
                        <TableCell>
                          <Badge className={riskBadgeColor(item.riskLevel)}>
                            {item.riskLevel.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.category}</TableCell>
                        <TableCell>
                          <div className="h-2 w-32 rounded-full overflow-hidden bg-muted">
                            <div
                              className="h-full rounded-full bg-red-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
