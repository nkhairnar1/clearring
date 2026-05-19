'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAuditLogs } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  ADMIN_UPDATE_NUMBER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ADMIN_APPROVE_REPORT: 'bg-green-500/20 text-green-400 border-green-500/30',
  ADMIN_REJECT_REPORT: 'bg-red-500/20 text-red-400 border-red-500/30',
  ADMIN_APPROVE_BUSINESS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ADMIN_REJECT_BUSINESS: 'bg-red-500/20 text-red-400 border-red-500/30',
  ADMIN_APPROVE_DISPUTE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ADMIN_REJECT_DISPUTE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ADMIN_UPDATE_USER: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ADMIN_OVERRIDE_SET: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  BUSINESS_APPROVED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

const ENTITY_COLORS: Record<string, string> = {
  PhoneNumber: 'bg-blue-500/15 text-blue-400',
  NumberReport: 'bg-orange-500/15 text-orange-400',
  BusinessProfile: 'bg-purple-500/15 text-purple-400',
  Dispute: 'bg-yellow-500/15 text-yellow-400',
  User: 'bg-cyan-500/15 text-cyan-400',
};

function formatAction(action: string): string {
  return action
    .replace(/^ADMIN_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function SkeletonRow() {
  return (
    <TableRow>
      {[40, 55, 30, 70, 50, 80].map((w, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${w}%` }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('ALL');

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: PAGE_SIZE };
      if (actionFilter !== 'ALL') params.action = actionFilter;
      const result = await getAuditLogs(params);
      const items = result.data ?? result.logs ?? result ?? [];
      setLogs(Array.isArray(items) ? items : []);
      setTotal(result.total ?? items.length ?? 0);
    } catch {
      toast({ title: 'Failed to load audit logs', variant: 'destructive' });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page, actionFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col h-full">
      <Header title="Audit Logs" subtitle="Complete trail of all admin actions" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {Object.keys(ACTION_COLORS).map((a) => (
                <SelectItem key={a} value={a}>{formatAction(a)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground flex-1">
            {total > 0 ? `${total.toLocaleString()} total actions` : 'No actions logged yet'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              const csv = [
                'Timestamp,Action,Entity,Entity ID,Actor',
                ...logs.map(l => `"${l.createdAt}","${l.action}","${l.entityType}","${l.entityId ?? ''}","${l.actorUserId ?? 'system'}"`)
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="icon" onClick={() => load(page)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const metaEntries = log.metadata
                    ? Object.entries(log.metadata).filter(([, v]) => v !== null && v !== undefined)
                    : [];
                  const shortMeta = metaEntries.map(([k, v]) => `${k}: ${String(v)}`).join(', ');

                  return (
                    <>
                      <TableRow
                        key={log.id}
                        className={`cursor-pointer hover:bg-muted/40 ${isExpanded ? 'bg-muted/30' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${ACTION_COLORS[log.action] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENTITY_COLORS[log.entityType] ?? 'bg-slate-500/20 text-slate-400'}`}>
                            {log.entityType}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground" title={log.entityId ?? ''}>
                          {log.entityId ? log.entityId.slice(0, 8) + '…' : '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground" title={log.actorUserId ?? ''}>
                          {log.actorUserId ? log.actorUserId.slice(0, 8) + '…' : (
                            <span className="text-slate-500 italic">System</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                          <div className="flex items-center gap-1">
                            <span className="truncate">{shortMeta.slice(0, 60) || '—'}</span>
                            {metaEntries.length > 0 && (
                              isExpanded
                                ? <ChevronUp className="h-3 w-3 shrink-0 text-muted-foreground" />
                                : <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && metaEntries.length > 0 && (
                        <TableRow key={`${log.id}-expanded`} className="bg-muted/20">
                          <TableCell colSpan={6} className="py-3 px-6">
                            <div className="rounded-lg border border-border bg-card p-3 font-mono text-xs text-muted-foreground space-y-1">
                              <p className="text-xs font-semibold text-foreground mb-2 font-sans">Metadata</p>
                              {metaEntries.map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-primary shrink-0">{k}:</span>
                                  <span className="break-all">{JSON.stringify(v)}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
