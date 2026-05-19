'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers, updateUser } from '@/lib/api';
import { statusBadgeColor, formatDateTime } from '@/lib/utils';
import { Search, RefreshCw, Ban, ShieldCheck, AlertTriangle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  role: string;
  status: string;
  trustScore: number;
  totalReports: number;
  createdAt: string;
}

interface PendingAction {
  id: string;
  phone: string;
  type: 'ban' | 'promote';
}

const PAGE_SIZE = 20;

const ROLE_COLORS: Record<string, string> = {
  USER: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  BUSINESS_OWNER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MODERATOR: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ADMIN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  SUPER_ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      const result = await getUsers(params);
      const list = result.users ?? result.data ?? result ?? [];
      setUsers(Array.isArray(list) ? list : []);
      setTotal(result.total ?? result.count ?? list.length);
    } catch {
      toast({ title: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  async function confirmAction() {
    if (!pendingAction) return;
    const { id, type } = pendingAction;
    setPendingAction(null);
    setActing(id);
    try {
      if (type === 'ban') {
        await updateUser(id, { status: 'BANNED' });
        toast({ title: 'User banned' });
      } else {
        await updateUser(id, { role: 'MODERATOR' });
        toast({ title: 'User promoted to Moderator' });
      }
      load();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setActing(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col h-full">
      <Header title="Users" subtitle="Manage platform users" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Inline confirmation banner */}
        {pendingAction && (
          <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
            <span className="text-sm text-orange-300 flex-1">
              {pendingAction.type === 'ban'
                ? <>Ban <span className="font-mono font-semibold">{pendingAction.phone}</span>? They&apos;ll lose access immediately.</>
                : <>Promote <span className="font-mono font-semibold">{pendingAction.phone}</span> to Moderator?</>}
            </span>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPendingAction(null)}>Cancel</Button>
              <Button
                size="sm"
                className={`h-7 text-xs text-white ${pendingAction.type === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                onClick={confirmAction}
              >
                {pendingAction.type === 'ban' ? 'Ban' : 'Promote'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by phone or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-14 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 opacity-30" />
                        <span>No users found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.map((u) => (
                  <TableRow key={u.id} className={pendingAction?.id === u.id ? 'bg-orange-500/5' : ''}>
                    <TableCell className="font-mono text-sm">{u.phoneNumber}</TableCell>
                    <TableCell className="text-sm">{u.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_COLORS[u.role] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadgeColor(u.status)}>{u.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-400 transition-all"
                            style={{ width: `${u.trustScore ?? 50}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{u.trustScore ?? 50}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{u.totalReports ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(u.createdAt)}</TableCell>
                    <TableCell>
                      {!['ADMIN', 'SUPER_ADMIN'].includes(u.role) && (
                        <div className="flex gap-1">
                          {u.status !== 'BANNED' && (
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              disabled={!!acting}
                              onClick={() => setPendingAction({ id: u.id, phone: u.phoneNumber, type: 'ban' })}
                              title="Ban user"
                            >
                              {acting === u.id
                                ? <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                : <Ban className="h-3.5 w-3.5 text-red-400" />}
                            </Button>
                          )}
                          {u.role === 'USER' && (
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              disabled={!!acting}
                              onClick={() => setPendingAction({ id: u.id, phone: u.phoneNumber, type: 'promote' })}
                              title="Promote to Moderator"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{start}–{end} of {total} users</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="tabular-nums">Page {page} / {totalPages}</span>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
