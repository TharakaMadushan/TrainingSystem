'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Award, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface Certificate {
    id: number; certificateNumber: string; trainingTitle: string;
    employeeNo: string; employeeName: string | null;
    issueDate: string; expiryDate: string | null; status: string; daysToExpiry: number | null;
}

export default function CertificatesPage() {
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/certificate', { params: { page: 1, pageSize: 50 } });
                setCerts(res.data.data?.items ?? []);
            } catch { setCerts([]); }
            setLoading(false);
        })();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Certificates</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>View your training certificates and their validity status</p>
            </div>

            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : certs.length === 0 ? (
                <div className="card p-12 text-center">
                    <Award size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No certificates</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Complete training programs to earn certificates.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
                    {certs.map(c => {
                        const expiring = c.daysToExpiry !== null && c.daysToExpiry <= 30 && c.daysToExpiry > 0;
                        const expired = c.daysToExpiry !== null && c.daysToExpiry <= 0;
                        return (
                            <div key={c.id} className="card p-5 card-interactive">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: expired ? '#fef2f2' : expiring ? '#fffbeb' : '#ecfdf5', color: expired ? '#ef4444' : expiring ? '#f59e0b' : '#10b981' }}>
                                        {expired ? <AlertTriangle size={20} /> : <Award size={20} />}
                                    </div>
                                    <span className={`badge ${expired ? 'badge-danger' : expiring ? 'badge-warning' : 'badge-success'} text-[11px]`}>
                                        {expired ? 'Expired' : expiring ? 'Expiring Soon' : c.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{c.trainingTitle}</h3>
                                <p className="text-xs font-mono mb-3" style={{ color: 'var(--color-text-muted)' }}>{c.certificateNumber}</p>
                                <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    <div className="flex justify-between"><span>Issued</span><span className="font-medium">{new Date(c.issueDate).toLocaleDateString()}</span></div>
                                    {c.expiryDate && <div className="flex justify-between"><span>Expires</span><span className="font-medium">{new Date(c.expiryDate).toLocaleDateString()}</span></div>}
                                    {c.daysToExpiry !== null && c.daysToExpiry > 0 && <div className="flex justify-between"><span>Days left</span><span className="font-medium" style={{ color: expiring ? '#f59e0b' : '#10b981' }}>{Math.round(c.daysToExpiry)}</span></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
