'use client';
import { FileSearch, Search, Filter, Clock, User, Monitor } from 'lucide-react';

const auditLogs = [
    { id: 1, user: 'admin', action: 'Login', resource: 'Authentication', details: 'Successful login from 192.168.1.50', date: '2025-03-08 10:30:00', status: 'Success' },
    { id: 2, user: 'hr.admin', action: 'Create', resource: 'Training', details: 'Created training "Advanced Python Programming"', date: '2025-03-08 09:15:00', status: 'Success' },
    { id: 3, user: 'admin', action: 'Update', resource: 'User', details: 'Updated roles for user EMP003', date: '2025-03-07 16:45:00', status: 'Success' },
    { id: 4, user: 'trainer01', action: 'Assign', resource: 'Assignment', details: 'Assigned "Safety Training" to 15 employees', date: '2025-03-07 14:20:00', status: 'Success' },
    { id: 5, user: 'EMP001', action: 'Login', resource: 'Authentication', details: 'Failed login attempt - incorrect password', date: '2025-03-07 11:00:00', status: 'Failed' },
    { id: 6, user: 'admin', action: 'Delete', resource: 'Schedule', details: 'Cancelled session "ERP Training - Batch 2"', date: '2025-03-06 17:30:00', status: 'Success' },
    { id: 7, user: 'hr.admin', action: 'Export', resource: 'Report', details: 'Exported compliance report for Q1 2025', date: '2025-03-06 15:00:00', status: 'Success' },
    { id: 8, user: 'admin', action: 'Update', resource: 'Settings', details: 'Updated email notification settings', date: '2025-03-06 10:00:00', status: 'Success' },
];

const actionColors: Record<string, string> = {
    Login: '#3b82f6', Create: '#10b981', Update: '#f59e0b', Delete: '#ef4444', Assign: '#8b5cf6', Export: '#06b6d4',
};

export default function AuditLogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Audit Logs</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>System activity and user action history</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search audit logs..." />
                    </div>
                    <select className="input-field sm:w-40">
                        <option>All Actions</option>
                        <option>Login</option>
                        <option>Create</option>
                        <option>Update</option>
                        <option>Delete</option>
                    </select>
                    <button className="btn-secondary text-sm"><Filter size={14} /> More Filters</button>
                </div>
            </div>

            {/* Audit Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {['Timestamp', 'User', 'Action', 'Resource', 'Details', 'Status'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="transition-all"
                                    style={{ borderBottom: '1px solid var(--color-border-light)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            <Clock size={12} /> {log.date}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                                {log.user.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs font-medium px-2 py-1 rounded"
                                            style={{ background: (actionColors[log.action] || '#64748b') + '15', color: actionColors[log.action] || '#64748b' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{log.resource}</td>
                                    <td className="px-4 py-3.5 text-sm max-w-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{log.details}</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`badge ${log.status === 'Success' ? 'badge-success' : 'badge-danger'} text-[11px]`}>{log.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Showing 1 to 8 of 156 entries</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, '...', 20].map((p, i) => (
                            <button key={i} className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                style={{ background: p === 1 ? 'var(--color-accent-primary)' : 'transparent', color: p === 1 ? 'white' : 'var(--color-text-secondary)' }}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
