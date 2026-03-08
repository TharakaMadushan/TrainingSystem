'use client';
import { Award, Download, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const certificates = [
    { id: 1, number: 'CERT-2025-001', training: 'Workplace Safety Standards', issueDate: '2025-02-15', expiryDate: '2026-02-15', status: 'Active', daysToExpiry: 342 },
    { id: 2, number: 'CERT-2025-002', training: 'Data Privacy & GDPR', issueDate: '2025-01-20', expiryDate: '2026-01-20', status: 'Active', daysToExpiry: 317 },
    { id: 3, number: 'CERT-2024-015', training: 'First Aid Certification', issueDate: '2024-03-10', expiryDate: '2025-03-10', status: 'Expiring', daysToExpiry: 2 },
    { id: 4, number: 'CERT-2024-008', training: 'Fire Safety Training', issueDate: '2024-01-05', expiryDate: '2025-01-05', status: 'Expired', daysToExpiry: -63 },
    { id: 5, number: 'CERT-2025-003', training: 'Quality Management System', issueDate: '2025-02-28', expiryDate: null, status: 'Active', daysToExpiry: null },
    { id: 6, number: 'CERT-2025-004', training: 'Leadership Workshop', issueDate: '2025-03-01', expiryDate: '2027-03-01', status: 'Active', daysToExpiry: 723 },
];

const statusConfig: Record<string, { badge: string; color: string; icon: React.ReactNode }> = {
    Active: { badge: 'badge-success', color: '#10b981', icon: <CheckCircle size={14} /> },
    Expiring: { badge: 'badge-warning', color: '#f59e0b', icon: <Clock size={14} /> },
    Expired: { badge: 'badge-danger', color: '#ef4444', icon: <AlertTriangle size={14} /> },
};

export default function CertificatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Certificates</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>View and manage your training certificates</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 animate-stagger">
                {[
                    { label: 'Active', value: 4, color: '#10b981' },
                    { label: 'Expiring Soon', value: 1, color: '#f59e0b' },
                    { label: 'Expired', value: 1, color: '#ef4444' },
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
                        <input className="input-field pl-9" placeholder="Search certificates..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Certificate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
                {certificates.map((c) => {
                    const config = statusConfig[c.status];
                    return (
                        <div key={c.id} className="card p-5 card-interactive">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.color + '15', color: config.color }}>
                                    <Award size={20} />
                                </div>
                                <span className={`badge ${config.badge} flex items-center gap-1 text-[10px]`}>
                                    {config.icon} {c.status}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{c.training}</h3>
                            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{c.number}</p>
                            <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <div className="flex justify-between"><span>Issued:</span><span>{c.issueDate}</span></div>
                                {c.expiryDate && <div className="flex justify-between"><span>Expires:</span><span>{c.expiryDate}</span></div>}
                                {c.daysToExpiry !== null && c.daysToExpiry > 0 && (
                                    <div className="flex justify-between"><span>Days Left:</span>
                                        <span style={{ color: c.daysToExpiry <= 30 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{c.daysToExpiry}</span>
                                    </div>
                                )}
                            </div>
                            <button className="w-full mt-4 btn-secondary text-xs justify-center">
                                <Download size={14} /> Download
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
