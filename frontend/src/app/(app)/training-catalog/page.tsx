'use client';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';

export default function TrainingCatalogPage() {
    const trainings = [
        { code: 'TR-001', title: 'Workplace Safety Standards', category: 'Safety', mode: 'Classroom', mandatory: true, status: true },
        { code: 'TR-002', title: 'Data Privacy & GDPR Compliance', category: 'Compliance', mode: 'Online', mandatory: true, status: true },
        { code: 'TR-003', title: 'Leadership Excellence Program', category: 'Soft Skills', mode: 'Hybrid', mandatory: false, status: true },
        { code: 'TR-004', title: 'Advanced Excel & Data Analysis', category: 'Technical', mode: 'Online', mandatory: false, status: true },
        { code: 'TR-005', title: 'Quality Management System (ISO 9001)', category: 'Compliance', mode: 'Classroom', mandatory: true, status: true },
        { code: 'TR-006', title: 'First Aid & Emergency Response', category: 'Safety', mode: 'Practical', mandatory: true, status: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Training Catalog</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage and browse all available training programs</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> New Training</button>
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search training programs..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['Code', 'Title', 'Category', 'Mode', 'Mandatory', 'Status', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {trainings.map((t, idx) => (
                                <tr key={t.code} className="transition-all cursor-pointer"
                                    style={{ borderBottom: '1px solid var(--color-border-light)', animationDelay: `${idx * 50}ms` }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--color-accent-primary)' }}>{t.code}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} style={{ color: 'var(--color-text-muted)' }} />
                                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.category}</td>
                                    <td className="px-4 py-3.5"><span className="badge badge-info text-[11px]">{t.mode}</span></td>
                                    <td className="px-4 py-3.5">
                                        {t.mandatory ? (
                                            <span className="badge badge-warning text-[11px]">Required</span>
                                        ) : (
                                            <span className="badge badge-neutral text-[11px]">Optional</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5"><span className="badge badge-success text-[11px]">Active</span></td>
                                    <td className="px-4 py-3.5">
                                        <button className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Showing 1 to 6 of 24 results</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map((p) => (
                            <button key={p} className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                style={{ background: p === 1 ? 'var(--color-accent-primary)' : 'transparent', color: p === 1 ? 'white' : 'var(--color-text-secondary)' }}>{p}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
