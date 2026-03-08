'use client';
import { Shield, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function ApprovalsPage() {
    const approvals = [
        { id: 1, type: 'Training Assignment', requester: 'John Smith', training: 'Safety Training Batch', date: '2025-03-06', level: 1, status: 'Pending' },
        { id: 2, type: 'Schedule Change', requester: 'Emily Davis', training: 'Leadership Workshop', date: '2025-03-05', level: 1, status: 'Pending' },
        { id: 3, type: 'Certificate Request', requester: 'Mark Wilson', training: 'ISO 9001 Certification', date: '2025-03-04', level: 2, status: 'Pending' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Pending Approvals</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Review and approve training requests</p>
            </div>

            <div className="space-y-3 animate-stagger">
                {approvals.map((a) => (
                    <div key={a.id} className="card p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                <Shield size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{a.training}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    <span>{a.type}</span><span>·</span>
                                    <span>By: {a.requester}</span><span>·</span>
                                    <span>Level {a.level}</span><span>·</span>
                                    <span>{a.date}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn-secondary text-xs px-3 py-2"><Eye size={14} /> View</button>
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {approvals.length === 0 && (
                <div className="card p-12 text-center">
                    <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>All caught up!</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No pending approvals at this time.</p>
                </div>
            )}
        </div>
    );
}
