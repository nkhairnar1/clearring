'use client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const themes = [
  {
    id: 'CRYSTAL_GLASS',
    name: 'Crystal Glass',
    description: 'Glassmorphism with blue/purple gradients and frosted panels — the default premium experience',
    preview: {
      bg: 'from-slate-900 via-blue-950 to-slate-900',
      surface: 'bg-white/10 backdrop-blur border border-white/20',
      accent: '#3b82f6',
      text: 'text-white',
    },
    badge: 'Default',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'MIDNIGHT_TRUST',
    name: 'Midnight Trust',
    description: 'Navy, slate, and electric blue — dark premium mode for serious users',
    preview: {
      bg: 'from-slate-950 via-blue-950 to-slate-950',
      surface: 'bg-slate-800/80 backdrop-blur border border-slate-700',
      accent: '#60a5fa',
      text: 'text-slate-100',
    },
    badge: 'Dark',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  {
    id: 'CLEAN_LIGHT',
    name: 'Clean Light',
    description: 'White, light grey, and blue accents — professional and minimal',
    preview: {
      bg: 'from-gray-50 via-white to-gray-100',
      surface: 'bg-white border border-gray-200 shadow-sm',
      accent: '#2563eb',
      text: 'text-gray-900',
    },
    badge: 'Light',
    badgeColor: 'bg-gray-200/50 text-gray-700 border-gray-300',
  },
  {
    id: 'HIGH_CONTRAST',
    name: 'High Contrast',
    description: 'Black/white with yellow accents — optimized for accessibility and visibility',
    preview: {
      bg: 'from-black via-zinc-950 to-black',
      surface: 'bg-zinc-900 border border-yellow-500',
      accent: '#facc15',
      text: 'text-white',
    },
    badge: 'A11y',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    id: 'TRUE_SIGNAL',
    name: 'True Signal',
    description: 'Green/teal and blue — trust-first design focused on verified information',
    preview: {
      bg: 'from-emerald-950 via-teal-950 to-cyan-950',
      surface: 'bg-emerald-900/40 backdrop-blur border border-emerald-700/50',
      accent: '#10b981',
      text: 'text-emerald-50',
    },
    badge: 'Trust',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
];

const riskColors = [
  { level: 'SAFE', color: '#22c55e', label: 'Safe' },
  { level: 'LOW_RISK', color: '#eab308', label: 'Low Risk' },
  { level: 'CAUTION', color: '#f97316', label: 'Caution' },
  { level: 'LIKELY_SPAM', color: '#ef4444', label: 'Likely Spam' },
  { level: 'HIGH_RISK', color: '#dc2626', label: 'High Risk' },
  { level: 'VERIFIED', color: '#3b82f6', label: 'Verified' },
  { level: 'UNKNOWN', color: '#6b7280', label: 'Unknown' },
];

export default function ThemesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Themes" subtitle="ClearRing design system preview" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Risk Color Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Color System</CardTitle>
            <CardDescription>Shared tokens used across all themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {riskColors.map(({ level, color, label }) => (
                <div key={level} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <div className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} className="overflow-hidden">
              {/* Preview */}
              <div className={`h-32 bg-gradient-to-br ${theme.preview.bg} p-4 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${theme.preview.surface} ${theme.preview.text}`}>
                    ClearRing
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.preview.accent }} />
                </div>
                <div className={`rounded-lg p-2 text-xs ${theme.preview.surface} ${theme.preview.text}`}>
                  <div className="font-mono">+91 98765 43210</div>
                  <div className="text-xs opacity-70 mt-0.5">HIGH RISK • Score: 88</div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-foreground">{theme.name}</h3>
                  <Badge className={theme.badgeColor}>{theme.badge}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Accent:</span>
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.preview.accent }} />
                  <span className="text-xs font-mono text-muted-foreground">{theme.preview.accent}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
