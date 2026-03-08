'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Training {
    id: number; trainingCode: string; title: string; categoryName: string;
    trainingMode: string; isMandatory: boolean; isActive: boolean;
    durationHours: number | null; trainerName: string | null;
}

interface PagedResult { items: Training[]; totalCount: number; page: number; pageSize: number; totalPages: number; }

export default function TrainingCatalogPage() {
    const [data, setData] = useState<PagedResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/training', { params: { page, pageSize, searchTerm: search || undefined } });
            setData(res.data.data);
        } catch { setData(null); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [page]);
    useEffect(() => { setPage(1); fetchData(); }, [search]);

    const trainings = data?.items ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Training Catalog</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage and browse all available training programs</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> New Training</button>
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search training programs..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn-secondary text-sm" onClick={fetchData}><Filter size={14} /> Refresh</button>
                </div>
            </div>

            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : trainings.length === 0 ? (
                <div className="card p-12 text-center">
                    <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No trainings found</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or add a new training.</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                    {['Code', 'Title', 'Category', 'Mode', 'Duration', 'Mandatory', 'Status', 'Actions'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {trainings.map((t, idx) => (
                                    <tr key={t.id} className="transition-all cursor-pointer"
                                        style={{ borderBottom: '1px solid var(--color-border-light)', animationDelay: `${idx * 50}ms` }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                        <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--color-accent-primary)' }}>{t.trainingCode}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.categoryName || '—'}</td>
                                        <td className="px-4 py-3.5"><span className="badge badge-info text-[11px]">{t.trainingMode}</span></td>
                                        <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.durationHours ? `${t.durationHours}h` : '—'}</td>
                                        <td className="px-4 py-3.5">
                                            {t.isMandatory
                                                ? <span className="badge badge-warning text-[11px]">Required</span>
                                                : <span className="badge badge-neutral text-[11px]">Optional</span>}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'} text-[11px]`}>
                                                {t.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data?.totalCount ?? 0)} of {data?.totalCount ?? 0}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                    className="px-2 py-1.5 rounded-md text-xs transition-all disabled:opacity-40"><ChevronLeft size={14} /></button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)}
                                        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                        style={{ background: p === page ? 'var(--color-accent-primary)' : 'transparent', color: p === page ? 'white' : 'var(--color-text-secondary)' }}>{p}</button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                    className="px-2 py-1.5 rounded-md text-xs transition-all disabled:opacity-40"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
