'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, Clock, CheckCircle, AlertTriangle, Play, Search, Filter, Loader2 } from 'lucide-react';

const statusColor: Record<string, string> = { InProgress: '#3b82f6', NotStarted: '#94a3b8', Completed: '#10b981', Overdue: '#ef4444' };
const statusBadge: Record<string, string> = { InProgress: 'badge-info', NotStarted: 'badge-neutral', Completed: 'badge-success', Overdue: 'badge-danger' };

interface MyTraining {
    id: number; trainingTitle: string; trainingCode: string; assignmentType: string;
    status: string; totalAssigned: number; completedCount: number;
    dueDate: string | null; priority: string; isMandatory: boolean; createdDate: string;
}

export default function MyTrainingsPage() {
    const [trainings, setTrainings] = useState<MyTraining[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/assignment/my', { params: { page: 1, pageSize: 50, searchTerm: search || undefined } });
            setTrainings(res.data.data?.items ?? []);
        } catch { setTrainings([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { const t = setTimeout(fetchData, 400); return () => clearTimeout(t); }, [search]);

    const getStatus = (t: MyTraining) => {
        if (t.completedCount >= t.totalAssigned && t.totalAssigned > 0) return 'Completed';
        if (t.dueDate && new Date(t.dueDate) < new Date() && t.completedCount < t.totalAssigned) return 'Overdue';
        if (t.completedCount > 0) return 'InProgress';
        return 'NotStarted';
    };

    const getProgress = (t: MyTraining) => t.totalAssigned > 0 ? Math.round(t.completedCount * 100 / t.totalAssigned) : 0;

    const counts = {
        pending: trainings.filter(t => getStatus(t) === 'NotStarted').length,
        inProgress: trainings.filter(t => getStatus(t) === 'InProgress').length,
        completed: trainings.filter(t => getStatus(t) === 'Completed').length,
        overdue: trainings.filter(t => getStatus(t) === 'Overdue').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Trainings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Track and complete your training assignments</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger">
                {[
                    { label: 'Pending', value: counts.pending, color: '#3b82f6', icon: <Clock size={18} /> },
                    { label: 'In Progress', value: counts.inProgress, color: '#f59e0b', icon: <Play size={18} /> },
                    { label: 'Completed', value: counts.completed, color: '#10b981', icon: <CheckCircle size={18} /> },
                    { label: 'Overdue', value: counts.overdue, color: '#ef4444', icon: <AlertTriangle size={18} /> },
                ].map((s) => (
                    <div key={s.label} className="card p-4 text-center">
                        <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search my trainings..."
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
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No trainings assigned</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>You don&apos;t have any training assignments yet.</p>
                </div>
            ) : (
                <div className="space-y-3 animate-stagger">
                    {trainings.map((t) => {
                        const status = getStatus(t);
                        const progress = getProgress(t);
                        return (
                            <div key={t.id} className="card p-5 card-interactive cursor-pointer">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: (statusColor[status] || '#94a3b8') + '15', color: statusColor[status] || '#94a3b8' }}>
                                        <BookOpen size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.trainingTitle}</h3>
                                            {t.isMandatory && <span className="badge badge-warning text-[10px]">Required</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            <span>{t.trainingCode}</span><span>·</span>
                                            <span>{t.assignmentType}</span><span>·</span>
                                            <span>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Progress</span>
                                                <span className="text-xs font-semibold" style={{ color: statusColor[status] }}>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: statusColor[status] }} />
                                            </div>
                                        </div>
                                        <span className={`badge ${statusBadge[status] || 'badge-neutral'}`}>
                                            {status.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
