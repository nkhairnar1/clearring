'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Phone, Flag, Building2, AlertTriangle,
  BarChart3, Users, Palette, LogOut, Shield, ScrollText, Mail
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';

interface PendingCounts {
  reports: number;
  claims: number;
  disputes: number;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, countKey: null },
  { href: '/numbers', label: 'Numbers', icon: Phone, countKey: null },
  { href: '/reports', label: 'Reports', icon: Flag, countKey: 'reports' },
  { href: '/business', label: 'Business Claims', icon: Building2, countKey: 'claims' },
  { href: '/disputes', label: 'Disputes', icon: AlertTriangle, countKey: 'disputes' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, countKey: null },
  { href: '/users', label: 'Users', icon: Users, countKey: null },
  { href: '/audit-logs', label: 'Audit Logs', icon: ScrollText, countKey: null },
  { href: '/waitlist', label: 'Waitlist', icon: Mail, countKey: null },
  { href: '/themes', label: 'Themes', icon: Palette, countKey: null },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<PendingCounts>({ reports: 0, claims: 0, disputes: 0 });

  useEffect(() => {
    getDashboard().then((data) => {
      setCounts({
        reports: data?.pendingReports ?? data?.stats?.pendingReports ?? 0,
        claims: data?.pendingClaims ?? data?.stats?.pendingClaims ?? 0,
        disputes: data?.pendingDisputes ?? data?.stats?.pendingDisputes ?? 0,
      });
    }).catch(() => {});
  }, []);

  function handleLogout() {
    Cookies.remove('admin_token');
    router.push('/login');
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">ClearRing</p>
          <p className="text-xs text-muted-foreground tracking-wide uppercase">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, countKey }) => {
          const active = pathname.startsWith(href);
          const count = countKey ? counts[countKey as keyof PendingCounts] : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
