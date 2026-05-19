'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getReports, reviewReport } from '@/lib/api';
import { riskBadgeColor, statusBadgeColor, formatDateTime } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Check, X, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface Report {
  id: string;
  phoneNumber: { e164Number: string; riskLevel: string };
  reportType: string;
  status: string;
  notes: string | null;
  moneyRequested: boolean;
  otpRequested: boolean;
  threatUsed: boolean;
  createdAt: string;
  reporter?: { phoneNumber: string };
}

interface PendingAction {
  id: string;
  action: 'approve' | 'reject';
  number: string;
  resolutionNotes?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [acting, setActing] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getReports({ status: tab, limit: 50 });
      setReports(result.reports ?? result.data ?? result ?? []);
    } catch {
      toast({ title: 'Failed to load reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') { setPendingAction(null); return; }
      if (tab !== 'PENDING' || reports.length === 0 || acting) return;
      const first = reports[0];
      if (e.key === 'a' || e.key === 'A') setPendingAction({ id: first.id, action: 'approve', number: first.phoneNumber?.e164Number ?? first.id });
      if (e.key === 'r' || e.key === 'R') setPendingAction({ id: first.id, action: 'reject', number: first.phoneNumber?.e164Number ?? first.id });
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tab, reports, acting]);

  async function confirmReview() {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    setPendingAction(null);
    setActing(id);
    try {
      await reviewReport(id, action, pendingAction?.resolutionNotes?.trim() || undefined);
      toast({ title: `Report ${action === 'approve' ? 'approved' : 'rejected'}` });
      load();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" subtitle="Review community reports" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {pendingAction && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="text-sm text-orange-300 flex-1">
                {pendingAction.action === 'approve' ? 'Approve' : 'Reject'} report for{' '}
                <span className="font-mono font-semibold">{pendingAction.number}</span>?
              </span>
              <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={() => setPendingAction(null)}>Cancel</Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Resolution notes (optional)..."
                className="h-8 text-sm bg-black/20 border-orange-500/20 focus:border-orange-500/50"
                value={pendingAction.resolutionNotes ?? ''}
                onChange={(e) => setPendingAction({ ...pendingAction, resolutionNotes: e.target.value })}
              />
              <Button
                size="sm"
                className={`h-8 shrink-0 text-white ${pendingAction.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={confirmReview}
              >
                {pendingAction.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Tabs value={tab} onValueChange={(t) => { setTab(t); setPendingAction(null); }}>
            <TabsList>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-3">
            {tab === 'PENDING' && reports.length > 0 && (
              <span className="text-xs text-muted-foreground hidden md:flex items-center gap-2">
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">A</kbd> approve ·
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">R</kbd> reject ·
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> cancel
              </span>
            )}
            <Button variant="outline" size="icon" onClick={load}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  {tab === 'PENDING' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: tab === 'PENDING' ? 9 : 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-14 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 opacity-30" />
                        <span>No {tab.toLowerCase()} reports</span>
                        {tab === 'PENDING' && <span className="text-xs opacity-60">All caught up!</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reports.map((r) => (
                  <TableRow
                    key={r.id}
                    className={pendingAction?.id === r.id ? 'bg-orange-500/5' : ''}
                  >
                    <TableCell className="font-mono text-sm">{r.phoneNumber?.e164Number ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{r.reportType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={riskBadgeColor(r.phoneNumber?.riskLevel ?? 'UNKNOWN')}>
                        {(r.phoneNumber?.riskLevel ?? 'UNKNOWN').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {r.moneyRequested && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">💰 Money</Badge>}
                        {r.otpRequested && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">🔑 OTP</Badge>}
                        {r.threatUsed && <Badge className="bg-red-700/20 text-red-500 border-red-700/30 text-xs">⚠️ Threat</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{r.notes ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.reporter?.phoneNumber
                        ? (() => {
                            const p = r.reporter.phoneNumber;
                            return p.length > 6
                              ? p.slice(0, 3) + '*'.repeat(p.length - 5) + p.slice(-2)
                              : '***';
                          })()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeColor(r.status)}>{r.status}</Badge>
                    </TableCell>
                    {tab === 'PENDING' && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            disabled={!!acting}
                            onClick={() => setPendingAction({ id: r.id, action: 'approve', number: r.phoneNumber?.e164Number ?? r.id })}
                            title="Approve"
                          >
                            {acting === r.id
                              ? <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                              : <Check className="h-3.5 w-3.5 text-green-400" />}
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            disabled={!!acting}
                            onClick={() => setPendingAction({ id: r.id, action: 'reject', number: r.phoneNumber?.e164Number ?? r.id })}
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
