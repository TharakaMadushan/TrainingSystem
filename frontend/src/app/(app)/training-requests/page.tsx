'use client';
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter } from 'lucide-react';

const requests = [
    { id: 1, employee: 'John Smith', empNo: 'EMP001', department: 'Engineering', training: 'Advanced Python Programming', reason: 'Need to upskill for upcoming project', date: '2025-03-06', status: 'Pending' },
    { id: 2, employee: 'Emily Davis', empNo: 'EMP002', department: 'Engineering', training: 'Cloud Architecture Certification', reason: 'Team transitioning to cloud-based infrastructure', date: '2025-03-05', status: 'Pending' },
    { id: 3, employee: 'Sarah Lee', empNo: 'EMP004', department: 'QA', training: 'Selenium Testing Framework', reason: 'Automation testing requirement', date: '2025-03-04', status: 'Approved' },
    { id: 4, employee: 'David Brown', empNo: 'EMP005', department: 'QA', training: 'Project Management Professional', reason: 'Career development path', date: '2025-03-03', status: 'Rejected' },
    { id: 5, employee: 'Lisa Chen', empNo: 'EMP006', department: 'HR', training: 'HR Analytics Certification', reason: 'Data-driven HR initiatives', date: '2025-03-02', status: 'Pending' },
];

const statusConfig: Record<string, { badge: string; color: string }> = {
    Pending: { badge: 'badge-warning', color: '#f59e0b' },
    Approved: { badge: 'badge-success', color: '#10b981' },
    Rejected: { badge: 'badge-danger', color: '#ef4444' },
};

export default function TrainingRequestsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Training Requests</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Review employee training requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 animate-stagger">
                {[
                    { label: 'Pending', value: 3, color: '#f59e0b' },
                    { label: 'Approved', value: 1, color: '#10b981' },
                    { label: 'Rejected', value: 1, color: '#ef4444' },
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
                        <input className="input-field pl-9" placeholder="Search requests..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Request Cards */}
            <div className="space-y-3 animate-stagger">
                {requests.map((r) => {
                    const config = statusConfig[r.status];
                    return (
                        <div key={r.id} className="card p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.color + '15', color: config.color }}>
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.training}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        <span>{r.employee} ({r.empNo})</span><span>·</span>
                                        <span>{r.department}</span><span>·</span>
                                        <span>{r.date}</span>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        <span className="font-medium">Reason:</span> {r.reason}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${config.badge}`}>{r.status}</span>
                                    {r.status === 'Pending' && (
                                        <>
                                            <button className="text-xs px-3 py-2 rounded-lg font-medium text-white transition-all" style={{ background: '#10b981' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}>
                                                <CheckCircle size={14} className="inline mr-1" /> Approve
                                            </button>
                                            <button className="text-xs px-3 py-2 rounded-lg font-medium text-white transition-all" style={{ background: '#ef4444' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}>
                                                <XCircle size={14} className="inline mr-1" /> Reject
                                            </button>
                                        </>
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
