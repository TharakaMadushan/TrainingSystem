'use client';
import { Moon, Sun, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
    const { preferences, updatePreferences } = useAuthStore();

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Customize your experience</p>
            </div>

            <div className="card p-6">
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>Appearance</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { mode: 'Light' as const, icon: <Sun size={20} />, label: 'Light' },
                        { mode: 'Dark' as const, icon: <Moon size={20} />, label: 'Dark' },
                    ].map((theme) => (
                        <button key={theme.mode} onClick={() => updatePreferences({ themeMode: theme.mode })}
                            className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                            style={{
                                borderColor: preferences.themeMode === theme.mode ? 'var(--color-accent-primary)' : 'var(--color-border-default)',
                                background: preferences.themeMode === theme.mode ? 'var(--color-bg-active)' : 'var(--color-bg-primary)',
                                color: 'var(--color-text-primary)',
                            }}>
                            {theme.icon}
                            <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="card p-6">
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>Display</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Sidebar Collapsed</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Start with sidebar minimized</p>
                        </div>
                        <button className="w-11 h-6 rounded-full transition-all relative"
                            style={{ background: preferences.sidebarCollapsed ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)' }}
                            onClick={() => updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed })}>
                            <div className="w-5 h-5 rounded-full bg-white shadow transition-all absolute top-0.5"
                                style={{ left: preferences.sidebarCollapsed ? 22 : 2 }} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Default Page Size</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Number of items per page</p>
                        </div>
                        <select className="input-field w-24 text-sm" value={preferences.defaultPageSize}
                            onChange={(e) => updatePreferences({ defaultPageSize: Number(e.target.value) })}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            <button className="btn-primary text-sm"><Save size={16} /> Save Preferences</button>
        </div>
    );
}
