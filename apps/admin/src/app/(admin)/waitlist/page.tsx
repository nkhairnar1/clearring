'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getWaitlist } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { RefreshCw, Mail, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface WaitlistEntry {
  id: string;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  source: string | null;
  createdAt: string;
}

const PAGE_SIZE = 50;

const sourceColors: Record<string, string> = {
  hero: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'download-cta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  footer: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  website: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWaitlist({ page, limit: PAGE_SIZE });
      setEntries(result.data ?? result ?? []);
      setTotal(result.total ?? 0);
    } catch {
      toast({ title: 'Failed to load waitlist', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Waitlist" subtitle={`${total} people signed up`} />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {total > 0 && (
              <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <>
                <Button variant="outline" size="icon" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">{page}/{totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'}/admin/waitlist/export`} download="clearring-waitlist.csv">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </a>
            </Button>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Signed Up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-14 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="h-8 w-8 opacity-30" />
                        <span>No waitlist entries yet</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-sm">{e.email}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{e.phoneNumber ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.country ?? '—'}</TableCell>
                    <TableCell>
                      {e.source ? (
                        <Badge className={`text-xs ${sourceColors[e.source] ?? sourceColors.website}`}>
                          {e.source}
                        </Badge>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</TableCell>
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
