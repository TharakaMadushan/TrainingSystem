'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FileQuestion, Loader2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TrainingRequest {
    id: number; referenceType: string; referenceId: number;
    requestedBy: string; approvalLevel: number; action: string;
    remarks: string | null; actionDate: string | null; createdDate: string;
    trainingTitle: string | null;
}

export default function TrainingRequestsPage() {
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // Training requests use the approval system
                const res = await api.get('/approval/pending', { params: { page: 1, pageSize: 50 } });
                setRequests(res.data.data?.items ?? []);
            } catch { setRequests([]); }
            setLoading(false);
        })();
    }, []);

    const actionIcon: Record<string, React.ReactNode> = {
        Pending: <Clock size={16} style={{ color: '#f59e0b' }} />,
        Approved: <CheckCircle size={16} style={{ color: '#10b981' }} />,
        Rejected: <XCircle size={16} style={{ color: '#ef4444' }} />,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Training Requests</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>View and manage training approval requests</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> New Request</button>
            </div>

            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : requests.length === 0 ? (
                <div className="card p-12 text-center">
                    <FileQuestion size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No training requests</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Submit a request to attend a training program.</p>
                </div>
            ) : (
                <div className="space-y-3 animate-stagger">
                    {requests.map(r => (
                        <div key={r.id} className="card p-5 card-interactive">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
                                    {actionIcon[r.action] || actionIcon.Pending}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.trainingTitle || `${r.referenceType} #${r.referenceId}`}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        <span>Level {r.approvalLevel}</span><span>·</span>
                                        <span>{new Date(r.createdDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className={`badge ${r.action === 'Approved' ? 'badge-success' : r.action === 'Rejected' ? 'badge-danger' : 'badge-warning'} text-[11px]`}>{r.action}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
