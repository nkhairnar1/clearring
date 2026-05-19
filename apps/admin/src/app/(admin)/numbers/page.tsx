'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getNumbers, updateNumber } from '@/lib/api';
import { riskBadgeColor, formatDateTime } from '@/lib/utils';
import { Search, RefreshCw, Shield, ShieldAlert, ShieldCheck, Edit2, Check, X, Phone, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface PhoneNumber {
  id: string;
  e164Number: string;
  spamScore: number;
  riskLevel: string;
  category: string | null;
  adminOverrideStatus: string | null;
  isVerified: boolean;
  totalReports: number;
  createdAt: string;
  updatedAt: string;
}

function scoreColor(score: number): string {
  if (score >= 75) return '#ef4444';
  if (score >= 50) return '#f97316';
  if (score >= 25) return '#eab308';
  return '#22c55e';
}

export default function NumbersPage() {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState('');
  const [editOverride, setEditOverride] = useState('');
  const [togglingVerify, setTogglingVerify] = useState<string | null>(null);
  const [detail, setDetail] = useState<PhoneNumber | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (search) params.search = search;
      if (riskFilter !== 'ALL') params.riskLevel = riskFilter;
      const result = await getNumbers(params);
      setNumbers(result.numbers ?? result.data ?? result ?? []);
    } catch {
      toast({ title: 'Failed to load numbers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, riskFilter]);

  useEffect(() => { load(); }, [load]);

  async function saveEdit(id: string) {
    try {
      await updateNumber(id, {
        ...(editScore !== '' ? { spamScore: Number(editScore) } : {}),
        ...(editOverride !== '' ? { adminOverrideStatus: editOverride === 'NONE' ? null : editOverride } : {}),
      });
      toast({ title: 'Number updated' });
      setEditingId(null);
      load();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  }

  async function toggleVerify(n: PhoneNumber) {
    setTogglingVerify(n.id);
    try {
      await updateNumber(n.id, { isVerified: !n.isVerified });
      toast({ title: n.isVerified ? 'Verification removed' : 'Number verified' });
      load();
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setTogglingVerify(null);
    }
  }

  function startEdit(n: PhoneNumber) {
    setEditingId(n.id);
    setEditScore(String(n.spamScore));
    setEditOverride(n.adminOverrideStatus ?? 'NONE');
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Numbers" subtitle="Manage phone number intelligence" />

      {/* Detail panel */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="w-96 bg-card border-l border-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-semibold">Number Detail</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetail(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Score ring */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 text-xl font-black"
                  style={{ borderColor: scoreColor(detail.spamScore), color: scoreColor(detail.spamScore) }}
                >
                  {detail.spamScore}
                </div>
                <div>
                  <div className="font-mono text-lg font-semibold">{detail.e164Number}</div>
                  <Badge className={riskBadgeColor(detail.riskLevel)}>{detail.riskLevel.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Score bar */}
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>Spam Score</span>
                  <span className="font-semibold" style={{ color: scoreColor(detail.spamScore) }}>{detail.spamScore}/100</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${detail.spamScore}%`, background: scoreColor(detail.spamScore) }}
                  />
                </div>
              </div>

              {/* Info grid */}
              <div className="rounded-lg border border-border divide-y divide-border text-sm">
                {[
                  ['Category', detail.category ?? '—'],
                  ['Total Reports', String(detail.totalReports)],
                  ['Verified Business', detail.isVerified ? '✓ Yes' : 'No'],
                  ['Admin Override', detail.adminOverrideStatus ?? 'None'],
                  ['Added', formatDateTime(detail.createdAt)],
                  ['Updated', formatDateTime(detail.updatedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => { startEdit(detail); setDetail(null); }}
                >
                  <Edit2 className="h-4 w-4" /> Edit Score & Override
                </Button>
                <Button
                  variant="outline"
                  className={`w-full justify-start gap-2 text-sm ${detail.isVerified ? 'text-red-400 border-red-500/30' : 'text-blue-400 border-blue-500/30'}`}
                  disabled={togglingVerify === detail.id}
                  onClick={async () => { await toggleVerify(detail); setDetail(null); }}
                >
                  {detail.isVerified ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  {detail.isVerified ? 'Remove Verification' : 'Mark as Verified'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['ALL', 'SAFE', 'LOW_RISK', 'CAUTION', 'LIKELY_SPAM', 'HIGH_RISK', 'UNKNOWN'].map((v) => (
                <SelectItem key={v} value={v}>{v.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : numbers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-14 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Phone className="h-8 w-8 opacity-30" />
                        <span>No numbers found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : numbers.map((n) => (
                  <TableRow key={n.id} className={editingId === n.id ? 'bg-blue-500/5' : 'cursor-pointer hover:bg-muted/30'}>
                    <TableCell className="font-mono text-sm font-medium" onClick={() => editingId !== n.id && setDetail(n)}>
                      <div className="flex items-center gap-2">
                        {n.isVerified ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        ) : n.riskLevel === 'HIGH_RISK' ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        ) : (
                          <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        {n.e164Number}
                        <ExternalLink className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === n.id ? (
                        <Input
                          className="w-20 h-7 text-sm"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                          type="number"
                          min="0"
                          max="100"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${n.spamScore}%`, background: scoreColor(n.spamScore) }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold tabular-nums" style={{ color: scoreColor(n.spamScore) }}>
                            {n.spamScore}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={riskBadgeColor(n.riskLevel)}>{n.riskLevel.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{n.category ?? '—'}</TableCell>
                    <TableCell className="text-sm">{n.totalReports}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleVerify(n)}
                        disabled={togglingVerify === n.id}
                        className="flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
                        title={n.isVerified ? 'Remove verification' : 'Mark as verified'}
                      >
                        {n.isVerified ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-400">Yes</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">No</span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      {editingId === n.id ? (
                        <Select value={editOverride} onValueChange={setEditOverride}>
                          <SelectTrigger className="h-7 w-40 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['NONE', 'CONFIRMED_FRAUD', 'VERIFIED_SAFE', 'UNDER_REVIEW'].map((v) => (
                              <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">{n.adminOverrideStatus ?? 'None'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(n.updatedAt)}</TableCell>
                    <TableCell>
                      {editingId === n.id ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(n.id)}>
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(n)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
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
