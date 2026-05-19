'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getBusinessClaims, reviewBusinessClaim } from '@/lib/api';
import { statusBadgeColor, formatDateTime } from '@/lib/utils';
import { Check, X, RefreshCw, Building2, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface Claim {
  id: string;
  phoneNumber: { e164Number: string };
  businessName: string;
  verificationStatus: string;
  claimedBy?: { phoneNumber: string };
  businessType: string | null;
  website: string | null;
  createdAt: string;
}

interface PendingAction {
  id: string;
  businessName: string;
  action: 'approve' | 'reject';
  notes?: string;
}

export default function BusinessPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [acting, setActing] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBusinessClaims({ status: tab, limit: 50 });
      setClaims(result.claims ?? result.data ?? result ?? []);
    } catch {
      toast({ title: 'Failed to load claims', variant: 'destructive' });
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
      await reviewBusinessClaim(id, action);
      toast({ title: `Claim ${action === 'approve' ? 'approved ✓' : 'rejected'}` });
      load();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Business Claims" subtitle="Verify business number ownership" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {pendingAction && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="text-sm text-orange-300 flex-1">
                {pendingAction.action === 'approve' ? 'Approve' : 'Reject'} claim for{' '}
                <span className="font-semibold">&quot;{pendingAction.businessName}&quot;</span>?{' '}
                {pendingAction.action === 'approve' && 'This will grant a verified badge.'}
              </span>
              <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={() => setPendingAction(null)}>Cancel</Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Review notes (optional)..."
                className="h-8 text-sm bg-black/20 border-orange-500/20 focus:border-orange-500/50"
                value={pendingAction.notes ?? ''}
                onChange={(e) => setPendingAction({ ...pendingAction, notes: e.target.value })}
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
          <Button variant="outline" size="icon" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  {tab === 'PENDING' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: tab === 'PENDING' ? 7 : 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-14 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 opacity-30" />
                        <span>No {tab.toLowerCase()} claims</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : claims.map((c) => (
                  <TableRow key={c.id} className={pendingAction?.id === c.id ? 'bg-orange-500/5' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        {c.businessName}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{c.phoneNumber?.e164Number ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.businessType ?? '—'}</TableCell>
                    <TableCell className="text-sm">
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[130px]"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{c.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeColor(c.verificationStatus)}>{c.verificationStatus}</Badge>
                    </TableCell>
                    {tab === 'PENDING' && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            disabled={!!acting}
                            onClick={() => setPendingAction({ id: c.id, businessName: c.businessName, action: 'approve' })}
                            title="Approve claim"
                          >
                            {acting === c.id
                              ? <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                              : <Check className="h-3.5 w-3.5 text-green-400" />}
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            disabled={!!acting}
                            onClick={() => setPendingAction({ id: c.id, businessName: c.businessName, action: 'reject' })}
                            title="Reject claim"
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
