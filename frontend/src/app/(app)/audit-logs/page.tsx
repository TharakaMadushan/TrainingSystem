'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FileText, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
    id: number; tableName: string; recordId: string; action: string;
    oldValues: string | null; newValues: string | null; userId: string; timestamp: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/audit/logs', { params: { page, pageSize: 25, searchTerm: search || undefined } });
            const d = res.data.data;
            setLogs(d?.items ?? []);
            setTotalPages(d?.totalPages ?? 0);
        } catch { setLogs([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [page]);
    useEffect(() => { setPage(1); fetchData(); }, [search]);

    const actionColor: Record<string, string> = { Insert: '#10b981', Update: '#3b82f6', Delete: '#ef4444' };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Audit Logs</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>System activity and change history</p>
            </div>
            <div className="card p-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input className="input-field pl-9" placeholder="Search by table, action, or user..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>
            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : logs.length === 0 ? (
                <div className="card p-12 text-center">
                    <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No audit logs</h3>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['Timestamp', 'User', 'Table', 'Record ID', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id} style={{ borderBottom: '1px solid var(--color-border-light)' }} className="transition-all"
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(l.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>{l.userId}</td>
                                        <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--color-accent-primary)' }}>{l.tableName}</td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{l.recordId}</td>
                                        <td className="px-4 py-3"><span className="badge text-[11px]" style={{ background: (actionColor[l.action] || '#94a3b8') + '15', color: actionColor[l.action] || '#94a3b8' }}>{l.action}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 py-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary text-xs px-2 py-1 disabled:opacity-40"><ChevronLeft size={14} /></button>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-secondary text-xs px-2 py-1 disabled:opacity-40"><ChevronRight size={14} /></button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
