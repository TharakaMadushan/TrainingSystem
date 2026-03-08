'use client';
import { ClipboardCheck, Search, CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';

const sessions = [
    {
        id: 1, title: 'Fire Safety Training', date: '2025-03-10', venue: 'Room 301', trainer: 'John Anderson',
        attendees: [
            { empNo: 'EMP001', name: 'John Smith', status: 'Present' },
            { empNo: 'EMP002', name: 'Emily Davis', status: 'Present' },
            { empNo: 'EMP003', name: 'Mark Wilson', status: 'Absent' },
            { empNo: 'EMP004', name: 'Sarah Lee', status: 'Present' },
            { empNo: 'EMP005', name: 'David Brown', status: 'Late' },
        ],
    },
    {
        id: 2, title: 'GDPR Awareness Session', date: '2025-03-08', venue: 'Virtual', trainer: 'Emily Richards',
        attendees: [
            { empNo: 'EMP001', name: 'John Smith', status: 'Present' },
            { empNo: 'EMP003', name: 'Mark Wilson', status: 'Present' },
            { empNo: 'EMP006', name: 'Lisa Chen', status: 'Present' },
        ],
    },
];

const statusIcon: Record<string, React.ReactNode> = {
    Present: <CheckCircle size={14} style={{ color: '#10b981' }} />,
    Absent: <XCircle size={14} style={{ color: '#ef4444' }} />,
    Late: <Clock size={14} style={{ color: '#f59e0b' }} />,
};

const statusBadge: Record<string, string> = { Present: 'badge-success', Absent: 'badge-danger', Late: 'badge-warning' };

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Attendance</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Mark and view training session attendance</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 animate-stagger">
                {[
                    { label: 'Total Sessions', value: 2, color: '#3b82f6' },
                    { label: 'Avg Attendance', value: '88%', color: '#10b981' },
                    { label: 'Absentees', value: 1, color: '#ef4444' },
                ].map((s) => (
                    <div key={s.label} className="card p-4 text-center">
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Session Attendance */}
            {sessions.map((session) => (
                <div key={session.id} className="card overflow-hidden">
                    <div className="p-4 flex items-center justify-between" style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border-default)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                <ClipboardCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{session.title}</h3>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {session.date} · {session.venue} · {session.trainer}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            {session.attendees.filter(a => a.status === 'Present').length}/{session.attendees.length} Present
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                    {['Employee', 'Employee No', 'Status', 'Action'].map((h) => (
                                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider"
                                            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {session.attendees.map((a) => (
                                    <tr key={a.empNo} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.name}</td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{a.empNo}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${statusBadge[a.status]} flex items-center gap-1 w-fit`}>
                                                {statusIcon[a.status]} {a.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
