'use client';
import { Shield, Plus, Edit, CheckCircle, Search } from 'lucide-react';

const roles = [
    { id: 1, code: 'EMPLOYEE', name: 'Employee', desc: 'Regular employee', users: 120, permissions: 6, system: true },
    { id: 2, code: 'MANAGER', name: 'Manager', desc: 'Team manager with direct reports', users: 15, permissions: 12, system: true },
    { id: 3, code: 'HR_OFFICER', name: 'HR Officer', desc: 'HR team member', users: 5, permissions: 16, system: true },
    { id: 4, code: 'HR_ADMIN', name: 'HR Admin', desc: 'Senior HR administrator', users: 2, permissions: 25, system: true },
    { id: 5, code: 'HOD', name: 'Department HOD', desc: 'Head of department', users: 8, permissions: 13, system: true },
    { id: 6, code: 'TRAINING_COORD', name: 'Training Coordinator', desc: 'Manages training operations', users: 3, permissions: 22, system: true },
    { id: 7, code: 'SUPERUSER', name: 'SuperUser', desc: 'System super user', users: 2, permissions: 30, system: true },
    { id: 8, code: 'SYSADMIN', name: 'System Admin', desc: 'Full system administrator', users: 1, permissions: 30, system: true },
    { id: 9, code: 'AUDITOR', name: 'Auditor / ReadOnly', desc: 'Read-only audit access', users: 2, permissions: 13, system: true },
];

const permissionModules = ['DASHBOARD', 'TRAINING', 'ASSIGNMENT', 'APPROVAL', 'SCHEDULE', 'ATTENDANCE', 'ASSESSMENT', 'CERTIFICATE', 'REPORT', 'ADMIN', 'AUDIT'];

export default function AdminRolesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Role Management</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Configure roles and their permission assignments</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> New Role</button>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input className="input-field pl-9" placeholder="Search roles..." />
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
                {roles.map((r) => (
                    <div key={r.id} className="card p-5 card-interactive">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white' }}>
                                <Shield size={20} />
                            </div>
                            <div className="flex items-center gap-2">
                                {r.system && <span className="badge badge-neutral text-[10px]">System</span>}
                                <button className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--color-text-secondary)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <Edit size={14} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{r.name}</h3>
                        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{r.desc}</p>
                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>{r.users} users</span>
                            <span>{r.permissions} permissions</span>
                        </div>
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                            <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Module Access</p>
                            <div className="flex flex-wrap gap-1">
                                {permissionModules.slice(0, r.permissions > 20 ? 11 : r.permissions > 10 ? 7 : 3).map((m) => (
                                    <span key={m} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-active)', color: 'var(--color-accent-primary)' }}>
                                        {m}
                                    </span>
                                ))}
                                {r.permissions > 20 && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#dcfce7', color: '#16a34a' }}>ALL</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
