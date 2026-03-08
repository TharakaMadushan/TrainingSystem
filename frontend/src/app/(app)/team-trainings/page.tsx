'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, BookOpen, Search, Filter, Loader2 } from 'lucide-react';

interface TeamAssignment {
    id: number; trainingTitle: string; trainingCode: string; assignmentType: string;
    status: string; totalAssigned: number; completedCount: number;
    dueDate: string | null; priority: string; isMandatory: boolean; assignedBy: string;
}

export default function TeamTrainingsPage() {
    const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/assignment/team', { params: { page: 1, pageSize: 50 } });
            setAssignments(res.data.data?.items ?? []);
        } catch { setAssignments([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = assignments.filter(a => !search || a.trainingTitle.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Team Trainings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Monitor training progress for your team members</p>
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search team trainings..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn-secondary text-sm" onClick={fetchData}><Filter size={14} /> Refresh</button>
                </div>
            </div>

            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No team trainings</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No training assignments for your team yet.</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['Training', 'Type', 'Assigned', 'Completed', 'Progress', 'Due Date', 'Priority'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {filtered.map((a, i) => {
                                    const pct = a.totalAssigned > 0 ? Math.round(a.completedCount * 100 / a.totalAssigned) : 0;
                                    return (
                                        <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}
                                            className="transition-all" onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="px-4 py-3.5"><div className="flex items-center gap-2"><BookOpen size={14} style={{ color: 'var(--color-text-muted)' }} /><span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.trainingTitle}</span></div></td>
                                            <td className="px-4 py-3.5"><span className="badge badge-info text-[11px]">{a.assignmentType}</span></td>
                                            <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{a.totalAssigned}</td>
                                            <td className="px-4 py-3.5 text-sm font-medium" style={{ color: '#10b981' }}>{a.completedCount}</td>
                                            <td className="px-4 py-3.5 w-32">
                                                <div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3b82f6' }} /></div><span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{pct}%</span></div>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</td>
                                            <td className="px-4 py-3.5"><span className={`badge ${a.priority === 'High' ? 'badge-danger' : a.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'} text-[11px]`}>{a.priority}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
