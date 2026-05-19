'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getDisputes, reviewDispute } from '@/lib/api';
import { statusBadgeColor, formatDateTime } from '@/lib/utils';
import { Check, X, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface Dispute {
  id: string;
  phoneNumber: { e164Number: string };
  suggestedLabel: string | null;
  notes: string | null;
  status: string;
  submittedBy?: { phoneNumber: string };
  createdAt: string;
}

interface PendingAction {
  id: string;
  action: 'approve' | 'reject';
  number: string;
  resolutionNotes?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [acting, setActing] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDisputes({ status: tab, limit: 50 });
      setDisputes(result.disputes ?? result.data ?? result ?? []);
    } catch {
      toast({ title: 'Failed to load disputes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function confirmReview() {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    setPendingAction(null);
    setActing(id);
    try {
      await reviewDispute(id, action, pendingAction?.resolutionNotes?.trim() || undefined);
      toast({ title: `Dispute ${action === 'approve' ? 'approved' : 'rejected'}` });
      load();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setActing(null);
    }
  }

  const colCount = tab === 'PENDING' ? 6 : 5;

  return (
    <div className="flex flex-col h-full">
      <Header title="Disputes" subtitle="Review correction requests" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setPendingAction(null); }}>
            <TabsList>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Inline confirmation banner with resolution notes */}
        {pendingAction && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="text-sm text-orange-300 flex-1">
                {pendingAction.action === 'approve' ? 'Approve' : 'Reject'} dispute for{' '}
                <span className="font-mono font-semibold">{pendingAction.number}</span>?
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-300 hover:text-orange-100 h-7 shrink-0"
                onClick={() => setPendingAction(null)}
              >
                Cancel
              </Button>
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
                className={`h-8 shrink-0 ${pendingAction.action === 'approve' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white`}
                onClick={confirmReview}
              >
                {pendingAction.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Suggested Label</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  {tab === 'PENDING' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                ) : disputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colCount} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Check className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span>No {tab.toLowerCase()} disputes</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : disputes.map((d) => {
                  const isExpanded = expandedNotes === d.id;
                  const hasLongNotes = (d.notes?.length ?? 0) > 80;
                  const isPendingTarget = pendingAction?.id === d.id;
                  return (
                    <TableRow key={d.id} className={isPendingTarget ? 'bg-orange-500/5' : undefined}>
                      <TableCell className="font-mono text-sm font-medium">{d.phoneNumber?.e164Number ?? '—'}</TableCell>
                      <TableCell>
                        {d.suggestedLabel ? (
                          <Badge variant="outline" className="font-mono text-xs">{d.suggestedLabel}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[260px]">
                        {d.notes ? (
                          <div>
                            <span>{isExpanded ? d.notes : d.notes.slice(0, 80)}{!isExpanded && hasLongNotes ? '…' : ''}</span>
                            {hasLongNotes && (
                              <button
                                onClick={() => setExpandedNotes(isExpanded ? null : d.id)}
                                className="ml-1 text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                              >
                                {isExpanded ? <><ChevronUp className="h-3 w-3" /> less</> : <><ChevronDown className="h-3 w-3" /> more</>}
                              </button>
                            )}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(d.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeColor(d.status)}>{d.status}</Badge>
                      </TableCell>
                      {tab === 'PENDING' && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              disabled={acting === d.id}
                              onClick={() => setPendingAction({ id: d.id, action: 'approve', number: d.phoneNumber?.e164Number ?? d.id })}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              disabled={acting === d.id}
                              onClick={() => setPendingAction({ id: d.id, action: 'reject', number: d.phoneNumber?.e164Number ?? d.id })}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
