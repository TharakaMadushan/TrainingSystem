'use client';
import { BarChart3, Download, CalendarDays, TrendingUp, Users, FileText } from 'lucide-react';

const reportTypes = [
    { id: 'training-summary', name: 'Training Summary Report', desc: 'Overview of all training programs, completion rates, and trends', icon: <BarChart3 size={20} />, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { id: 'compliance', name: 'Compliance Report', desc: 'Mandatory training compliance status by department', icon: <TrendingUp size={20} />, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { id: 'employee-progress', name: 'Employee Progress Report', desc: 'Individual employee training progress and achievements', icon: <Users size={20} />, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { id: 'attendance', name: 'Attendance Report', desc: 'Training session attendance records and statistics', icon: <CalendarDays size={20} />, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { id: 'assessment', name: 'Assessment Report', desc: 'Quiz and assessment results with pass/fail analysis', icon: <FileText size={20} />, gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
    { id: 'audit', name: 'Audit Trail Report', desc: 'System activity logs and user action history', icon: <FileText size={20} />, gradient: 'linear-gradient(135deg, #64748b, #475569)' },
];

const recentReports = [
    { name: 'Compliance_Q1_2025.xlsx', date: '2025-03-05', type: 'Compliance', size: '245 KB' },
    { name: 'Training_Summary_Feb.pdf', date: '2025-03-01', type: 'Training Summary', size: '1.2 MB' },
    { name: 'Employee_Progress_March.xlsx', date: '2025-02-28', type: 'Employee Progress', size: '580 KB' },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Reports & Analytics</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Generate and download training reports</p>
                </div>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
                {reportTypes.map((r) => (
                    <div key={r.id} className="card p-5 card-interactive cursor-pointer">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: r.gradient }}>
                            {r.icon}
                        </div>
                        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{r.name}</h3>
                        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>{r.desc}</p>
                        <button className="btn-secondary text-xs w-full justify-center">
                            <BarChart3 size={14} /> Generate Report
                        </button>
                    </div>
                ))}
            </div>

            {/* Recent Reports */}
            <div className="card p-5">
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Reports</h3>
                <div className="space-y-3">
                    {recentReports.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.name}</p>
                                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{r.type} · {r.date} · {r.size}</p>
                                </div>
                            </div>
                            <button className="btn-secondary text-xs"><Download size={14} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
