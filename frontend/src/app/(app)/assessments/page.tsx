'use client';
import { Award, CheckCircle, XCircle, Clock, Search, Filter, FileText } from 'lucide-react';

const assessments = [
    { id: 1, title: 'Safety Standards Quiz', training: 'Workplace Safety Standards', type: 'Quiz', questions: 20, duration: '30 min', passingScore: 80, status: 'Completed', score: 92, passed: true, date: '2025-03-08' },
    { id: 2, title: 'GDPR Compliance Test', training: 'Data Privacy & GDPR', type: 'Exam', questions: 40, duration: '60 min', passingScore: 75, status: 'Pending', score: null, passed: null, date: '2025-03-15' },
    { id: 3, title: 'Leadership Assessment', training: 'Leadership Workshop', type: 'Assessment', questions: 15, duration: '20 min', passingScore: 70, status: 'Completed', score: 88, passed: true, date: '2025-03-05' },
    { id: 4, title: 'First Aid Practical Eval', training: 'First Aid Certification', type: 'Practical', questions: 10, duration: '45 min', passingScore: 90, status: 'Failed', score: 65, passed: false, date: '2025-03-02' },
    { id: 5, title: 'QMS Knowledge Check', training: 'Quality Management System', type: 'Quiz', questions: 25, duration: '30 min', passingScore: 80, status: 'Pending', score: null, passed: null, date: '2025-03-20' },
];

const statusConfig: Record<string, { badge: string; color: string }> = {
    Completed: { badge: 'badge-success', color: '#10b981' },
    Pending: { badge: 'badge-warning', color: '#f59e0b' },
    Failed: { badge: 'badge-danger', color: '#ef4444' },
};

export default function AssessmentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Assessments</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>View and take training assessments</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger">
                {[
                    { label: 'Total', value: 5, color: '#3b82f6' },
                    { label: 'Passed', value: 2, color: '#10b981' },
                    { label: 'Pending', value: 2, color: '#f59e0b' },
                    { label: 'Failed', value: 1, color: '#ef4444' },
                ].map((s) => (
                    <div key={s.label} className="card p-4 text-center">
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
                        <input className="input-field pl-9" placeholder="Search assessments..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Assessment Cards */}
            <div className="space-y-3 animate-stagger">
                {assessments.map((a) => {
                    const config = statusConfig[a.status];
                    return (
                        <div key={a.id} className="card p-5 card-interactive">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: config.color + '15', color: config.color }}>
                                    <FileText size={22} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{a.title}</h3>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{a.training}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        <span>{a.type}</span>
                                        <span>·</span>
                                        <span>{a.questions} questions</span>
                                        <span>·</span>
                                        <span>{a.duration}</span>
                                        <span>·</span>
                                        <span>Pass: {a.passingScore}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {a.score !== null && (
                                        <div className="text-center">
                                            <div className="text-lg font-bold" style={{ color: a.passed ? '#10b981' : '#ef4444' }}>{a.score}%</div>
                                            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Score</div>
                                        </div>
                                    )}
                                    <span className={`badge ${config.badge}`}>
                                        {a.status === 'Completed' && <CheckCircle size={12} className="mr-1" />}
                                        {a.status === 'Failed' && <XCircle size={12} className="mr-1" />}
                                        {a.status === 'Pending' && <Clock size={12} className="mr-1" />}
                                        {a.status}
                                    </span>
                                    {a.status === 'Pending' && (
                                        <button className="btn-primary text-xs">Start</button>
                                    )}
                                    {a.status === 'Failed' && (
                                        <button className="btn-secondary text-xs">Retry</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
