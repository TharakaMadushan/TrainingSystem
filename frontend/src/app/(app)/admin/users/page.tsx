'use client';
import { UserCog, Search, Filter, Plus, Shield, Edit, Trash2 } from 'lucide-react';

const users = [
    { id: 1, username: 'admin', displayName: 'System Administrator', email: 'admin@company.com', roles: ['SuperUser', 'SysAdmin'], isActive: true, lastLogin: '2025-03-08', type: 'SuperUser' },
    { id: 2, username: 'hr.admin', displayName: 'HR Administrator', email: 'hr.admin@company.com', roles: ['HR Admin'], isActive: true, lastLogin: '2025-03-07', type: 'SuperUser' },
    { id: 3, username: 'trainer01', displayName: 'Training Coordinator', email: 'trainer@company.com', roles: ['Training Coordinator'], isActive: true, lastLogin: '2025-03-06', type: 'SuperUser' },
    { id: 4, username: 'EMP001', displayName: 'John Smith', email: 'john.smith@company.com', roles: ['Employee', 'Manager'], isActive: true, lastLogin: '2025-03-08', type: 'Employee' },
    { id: 5, username: 'EMP002', displayName: 'Emily Davis', email: 'emily.davis@company.com', roles: ['Employee'], isActive: true, lastLogin: '2025-03-07', type: 'Employee' },
    { id: 6, username: 'EMP003', displayName: 'Mark Wilson', email: 'mark.wilson@company.com', roles: ['Employee'], isActive: false, lastLogin: '2025-02-15', type: 'Employee' },
];

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>User Management</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage system users and their role assignments</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> Add User</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger">
                {[
                    { label: 'Total Users', value: 6, color: '#3b82f6' },
                    { label: 'Active', value: 5, color: '#10b981' },
                    { label: 'Inactive', value: 1, color: '#ef4444' },
                    { label: 'Super Users', value: 3, color: '#8b5cf6' },
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
                        <input className="input-field pl-9" placeholder="Search users..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['User', 'Username', 'Type', 'Roles', 'Status', 'Last Login', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="transition-all"
                                    style={{ borderBottom: '1px solid var(--color-border-light)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                style={{ background: u.type === 'SuperUser' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                                {u.displayName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{u.displayName}</p>
                                                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm font-mono" style={{ color: 'var(--color-accent-primary)' }}>{u.username}</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`badge ${u.type === 'SuperUser' ? 'badge-info' : 'badge-neutral'} text-[11px]`}>{u.type}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex flex-wrap gap-1">
                                            {u.roles.map((r) => (
                                                <span key={r} className="badge badge-neutral text-[10px]">{r}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'} text-[11px]`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{u.lastLogin}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex gap-2">
                                            <button className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--color-text-secondary)' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                                <Edit size={14} />
                                            </button>
                                            <button className="p-1.5 rounded-lg transition-all" style={{ color: '#ef4444' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
