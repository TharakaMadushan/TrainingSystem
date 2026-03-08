'use client';
import { BookOpen, Clock, CheckCircle, AlertTriangle, Play, Search, Filter } from 'lucide-react';

const statusColor: Record<string, string> = { InProgress: '#3b82f6', NotStarted: '#94a3b8', Completed: '#10b981', Overdue: '#ef4444' };
const statusBadge: Record<string, string> = { InProgress: 'badge-info', NotStarted: 'badge-neutral', Completed: 'badge-success', Overdue: 'badge-danger' };

const trainings = [
    { id: 1, title: 'Workplace Safety Standards', category: 'Safety', mode: 'Classroom', status: 'InProgress', progress: 65, due: '2025-03-15', mandatory: true },
    { id: 2, title: 'Data Privacy & GDPR', category: 'Compliance', mode: 'Online', status: 'NotStarted', progress: 0, due: '2025-03-20', mandatory: true },
    { id: 3, title: 'Leadership Workshop', category: 'Soft Skills', mode: 'Hybrid', status: 'Completed', progress: 100, due: '2025-03-10', mandatory: false },
    { id: 4, title: 'First Aid Certification', category: 'Safety', mode: 'Practical', status: 'Overdue', progress: 30, due: '2025-03-05', mandatory: true },
    { id: 5, title: 'Quality Management System', category: 'Compliance', mode: 'Online', status: 'InProgress', progress: 45, due: '2025-03-25', mandatory: true },
    { id: 6, title: 'Advanced Excel & Data Analysis', category: 'Technical', mode: 'Online', status: 'NotStarted', progress: 0, due: '2025-04-01', mandatory: false },
];

export default function MyTrainingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>My Trainings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Track and complete your training assignments</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger">
                {[
                    { label: 'Pending', value: 2, color: '#3b82f6', icon: <Clock size={18} /> },
                    { label: 'In Progress', value: 2, color: '#f59e0b', icon: <Play size={18} /> },
                    { label: 'Completed', value: 1, color: '#10b981', icon: <CheckCircle size={18} /> },
                    { label: 'Overdue', value: 1, color: '#ef4444', icon: <AlertTriangle size={18} /> },
                ].map((s) => (
                    <div key={s.label} className="card p-4 text-center">
                        <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: s.color + '15', color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search my trainings..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Training Cards */}
            <div className="space-y-3 animate-stagger">
                {trainings.map((t) => (
                    <div key={t.id} className="card p-5 card-interactive cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: statusColor[t.status] + '15', color: statusColor[t.status] }}>
                                <BookOpen size={22} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h3>
                                    {t.mandatory && <span className="badge badge-warning text-[10px]">Required</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    <span>{t.category}</span><span>·</span>
                                    <span>{t.mode}</span><span>·</span>
                                    <span>Due: {t.due}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-32">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Progress</span>
                                        <span className="text-xs font-semibold" style={{ color: statusColor[t.status] }}>{t.progress}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${t.progress}%`, background: statusColor[t.status] }} />
                                    </div>
                                </div>
                                <span className={`badge ${statusBadge[t.status]}`}>
                                    {t.status.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
