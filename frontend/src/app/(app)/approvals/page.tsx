'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Shield, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';

interface Approval {
    id: number; referenceType: string; referenceId: number;
    requestedBy: string; requestedByName: string; approverEmployeeNo: string;
    approvalLevel: number; action: string; remarks: string | null;
    actionDate: string | null; createdDate: string; trainingTitle: string | null;
}

export default function ApprovalsPage() {
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/approval/pending', { params: { page: 1, pageSize: 50 } });
            setApprovals(res.data.data?.items ?? []);
        } catch { setApprovals([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async (id: number, action: string) => {
        setProcessing(id);
        try {
            await api.post(`/approval/${id}/action`, { action, remarks: null });
            await fetchData();
        } catch (err) {
            console.error('Approval action failed:', err);
        }
        setProcessing(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Pending Approvals</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Review and approve training requests</p>
            </div>

            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : approvals.length === 0 ? (
                <div className="card p-12 text-center">
                    <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>All caught up!</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No pending approvals at this time.</p>
                </div>
            ) : (
                <div className="space-y-3 animate-stagger">
                    {approvals.map((a) => (
                        <div key={a.id} className="card p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <Shield size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{a.trainingTitle || `${a.referenceType} #${a.referenceId}`}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        <span>{a.referenceType}</span><span>·</span>
                                        <span>By: {a.requestedByName || a.requestedBy}</span><span>·</span>
                                        <span>Level {a.approvalLevel}</span><span>·</span>
                                        <span>{new Date(a.createdDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn-secondary text-xs px-3 py-2"><Eye size={14} /> View</button>
                                    <button disabled={processing === a.id} onClick={() => handleAction(a.id, 'Approved')}
                                        className="text-xs px-3 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                                        style={{ background: '#10b981' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}>
                                        <CheckCircle size={14} className="inline mr-1" /> Approve
                                    </button>
                                    <button disabled={processing === a.id} onClick={() => handleAction(a.id, 'Rejected')}
                                        className="text-xs px-3 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                                        style={{ background: '#ef4444' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}>
                                        <XCircle size={14} className="inline mr-1" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
