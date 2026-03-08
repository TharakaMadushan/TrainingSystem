'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Settings, Loader2, Save } from 'lucide-react';

interface Preferences { themeMode: string; sidebarCollapsed: boolean; defaultPageSize: number; }

export default function SettingsPage() {
    const [prefs, setPrefs] = useState<Preferences>({ themeMode: 'Light', sidebarCollapsed: false, defaultPageSize: 20 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/settings/preferences');
                if (res.data.data) setPrefs(res.data.data);
            } catch { }
            setLoading(false);
        })();
    }, []);

    const save = async () => {
        setSaving(true); setSaved(false);
        try {
            await api.put('/settings/preferences', prefs);
            setSaved(true); setTimeout(() => setSaved(false), 3000);
        } catch { }
        setSaving(false);
    };

    if (loading) return <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Customize your experience</p>
            </div>
            <div className="card p-6 max-w-lg space-y-6">
                <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Theme</label>
                    <div className="flex gap-2">
                        {['Light', 'Dark'].map(t => (
                            <button key={t} onClick={() => setPrefs(p => ({ ...p, themeMode: t }))}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: prefs.themeMode === t ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
                                    color: prefs.themeMode === t ? 'white' : 'var(--color-text-secondary)'
                                }}>{t}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Sidebar</label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={prefs.sidebarCollapsed} onChange={e => setPrefs(p => ({ ...p, sidebarCollapsed: e.target.checked }))}
                            className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-accent-primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Collapse sidebar by default</span>
                    </label>
                </div>
                <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Items per page</label>
                    <select className="input-field w-32" value={prefs.defaultPageSize} onChange={e => setPrefs(p => ({ ...p, defaultPageSize: +e.target.value }))}>
                        {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                    <button onClick={save} disabled={saving} className="btn-primary text-sm">
                        {saving ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <Save size={14} className="inline mr-1" />}
                        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
}
