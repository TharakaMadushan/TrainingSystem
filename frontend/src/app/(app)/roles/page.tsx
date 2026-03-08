'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Shield, Loader2 } from 'lucide-react';

interface RoleDto {
    id: number; roleCode: string; roleName: string; description: string | null;
    isSystemRole: boolean; isActive: boolean; userCount: number; permissions: string[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/admin/roles');
                setRoles(res.data.data ?? []);
            } catch { setRoles([]); }
            setLoading(false);
        })();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Role Management</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage roles and their permissions</p>
            </div>
            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
                    {roles.map(r => (
                        <div key={r.id} className="card p-5 card-interactive">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <Shield size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {r.isSystemRole && <span className="badge badge-warning text-[10px]">System</span>}
                                    <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'} text-[11px]`}>{r.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.roleName}</h3>
                            <p className="text-xs font-mono mb-2" style={{ color: 'var(--color-text-muted)' }}>{r.roleCode}</p>
                            {r.description && <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>{r.description}</p>}
                            <div className="flex justify-between text-xs pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}><strong>{r.userCount}</strong> users</span>
                                <span style={{ color: 'var(--color-text-muted)' }}><strong>{r.permissions.length}</strong> permissions</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
