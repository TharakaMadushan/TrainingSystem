'use client';
import { Users, Search, Filter, ChevronDown } from 'lucide-react';

const statusColor: Record<string, string> = { InProgress: '#3b82f6', NotStarted: '#94a3b8', Completed: '#10b981', Overdue: '#ef4444' };
const statusBadge: Record<string, string> = { InProgress: 'badge-info', NotStarted: 'badge-neutral', Completed: 'badge-success', Overdue: 'badge-danger' };

const teamMembers = [
    { empNo: 'EMP001', name: 'John Smith', department: 'Engineering', totalAssigned: 5, completed: 3, inProgress: 1, overdue: 1, compliance: 82 },
    { empNo: 'EMP002', name: 'Emily Davis', department: 'Engineering', totalAssigned: 4, completed: 4, inProgress: 0, overdue: 0, compliance: 100 },
    { empNo: 'EMP003', name: 'Mark Wilson', department: 'Engineering', totalAssigned: 6, completed: 2, inProgress: 3, overdue: 1, compliance: 67 },
    { empNo: 'EMP004', name: 'Sarah Lee', department: 'QA', totalAssigned: 3, completed: 3, inProgress: 0, overdue: 0, compliance: 100 },
    { empNo: 'EMP005', name: 'David Brown', department: 'QA', totalAssigned: 5, completed: 1, inProgress: 2, overdue: 2, compliance: 45 },
    { empNo: 'EMP006', name: 'Lisa Chen', department: 'HR', totalAssigned: 4, completed: 3, inProgress: 1, overdue: 0, compliance: 90 },
];

export default function TeamTrainingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Team Trainings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Monitor your team&apos;s training progress and compliance</p>
                </div>
                <button className="btn-secondary text-sm"><ChevronDown size={14} /> All Departments</button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
                {[
                    { label: 'Team Members', value: 6, color: '#3b82f6' },
                    { label: 'Avg Compliance', value: '80%', color: '#10b981' },
                    { label: 'Total Overdue', value: 4, color: '#ef4444' },
                    { label: 'Fully Compliant', value: 2, color: '#8b5cf6' },
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
                        <input className="input-field pl-9" placeholder="Search team members..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Team Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['Employee', 'Department', 'Assigned', 'Completed', 'In Progress', 'Overdue', 'Compliance', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map((m) => (
                                <tr key={m.empNo} className="transition-all cursor-pointer"
                                    style={{ borderBottom: '1px solid var(--color-border-light)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                                {m.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.name}</p>
                                                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{m.empNo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{m.department}</td>
                                    <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.totalAssigned}</td>
                                    <td className="px-4 py-3.5"><span className="badge badge-success text-[11px]">{m.completed}</span></td>
                                    <td className="px-4 py-3.5"><span className="badge badge-info text-[11px]">{m.inProgress}</span></td>
                                    <td className="px-4 py-3.5"><span className={`badge ${m.overdue > 0 ? 'badge-danger' : 'badge-neutral'} text-[11px]`}>{m.overdue}</span></td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                                <div className="h-full rounded-full" style={{ width: `${m.compliance}%`, background: m.compliance >= 80 ? '#10b981' : m.compliance >= 60 ? '#f59e0b' : '#ef4444' }} />
                                            </div>
                                            <span className="text-xs font-semibold" style={{ color: m.compliance >= 80 ? '#10b981' : m.compliance >= 60 ? '#f59e0b' : '#ef4444' }}>{m.compliance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <button className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
