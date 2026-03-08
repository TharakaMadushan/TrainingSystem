'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users as UsersIcon, Search, Loader2 } from 'lucide-react';

interface UserDto {
    employeeNo: string; employeeName: string; department: string | null;
    roles: string[]; scopeType: string; isActive: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { page: 1, pageSize: 50, searchTerm: search || undefined } });
            setUsers(res.data.data?.items ?? []);
        } catch { setUsers([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { const t = setTimeout(fetchData, 400); return () => clearTimeout(t); }, [search]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>User Management</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage user roles and access permissions</p>
            </div>
            <div className="card p-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input className="input-field pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>
            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['Employee No', 'Name', 'Department', 'Roles', 'Scope', 'Status'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.employeeNo} style={{ borderBottom: '1px solid var(--color-border-light)' }} className="transition-all"
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td className="px-4 py-3.5 text-sm font-mono" style={{ color: 'var(--color-accent-primary)' }}>{u.employeeNo}</td>
                                        <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{u.employeeName}</td>
                                        <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{u.department || '—'}</td>
                                        <td className="px-4 py-3.5"><div className="flex gap-1 flex-wrap">{u.roles.map(r => <span key={r} className="badge badge-info text-[10px]">{r}</span>)}</div></td>
                                        <td className="px-4 py-3.5"><span className="badge badge-neutral text-[11px]">{u.scopeType}</span></td>
                                        <td className="px-4 py-3.5"><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'} text-[11px]`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
