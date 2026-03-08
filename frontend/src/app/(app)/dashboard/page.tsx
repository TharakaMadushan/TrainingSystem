'use client';
import { useAuthStore } from '@/stores/authStore';
import {
    BookOpen, ClipboardCheck, CalendarDays, Award, AlertTriangle,
    TrendingUp, Clock, Users, CheckCircle, ArrowUpRight, BarChart3
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    change?: string;
    changeType?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, icon, gradient, change, changeType }: StatCardProps) {
    return (
        <div className="card p-5 card-interactive">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                    {change && (
                        <p
                            className="text-xs mt-2 flex items-center gap-1"
                            style={{
                                color: changeType === 'up' ? '#10b981' : changeType === 'down' ? '#ef4444' : '#64748b',
                            }}
                        >
                            <ArrowUpRight size={12} className={changeType === 'down' ? 'rotate-90' : ''} />
                            {change}
                        </p>
                    )}
                </div>
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ background: gradient }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function UpcomingSessionCard() {
    const sessions = [
        { title: 'Fire Safety Training', time: 'Today, 2:00 PM', venue: 'Room 301', status: 'Live' },
        { title: 'Leadership Workshop', time: 'Tomorrow, 10:00 AM', venue: 'Virtual', status: 'Upcoming' },
        { title: 'ERP System Module 3', time: 'Mar 12, 9:00 AM', venue: 'Lab A', status: 'Upcoming' },
    ];

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Upcoming Sessions
                </h3>
                <button className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {sessions.map((session, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer"
                        style={{ background: 'var(--color-bg-secondary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                background: session.status === 'Live' ? '#dcfce7' : '#dbeafe',
                                color: session.status === 'Live' ? '#16a34a' : '#2563eb',
                            }}
                        >
                            <CalendarDays size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {session.title}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {session.time} · {session.venue}
                            </p>
                        </div>
                        {session.status === 'Live' && (
                            <span className="badge badge-success text-[10px]">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function RecentAssignmentsCard() {
    const assignments = [
        { training: 'Workplace Safety Standards', status: 'InProgress', progress: 65, due: 'Mar 15' },
        { training: 'Data Privacy & GDPR', status: 'NotStarted', progress: 0, due: 'Mar 20' },
        { training: 'Quality Management System', status: 'Completed', progress: 100, due: 'Mar 10' },
        { training: 'First Aid Certification', status: 'Overdue', progress: 30, due: 'Mar 05' },
    ];

    const statusColor: Record<string, string> = {
        InProgress: '#3b82f6',
        NotStarted: '#94a3b8',
        Completed: '#10b981',
        Overdue: '#ef4444',
    };

    const statusBadge: Record<string, string> = {
        InProgress: 'badge-info',
        NotStarted: 'badge-neutral',
        Completed: 'badge-success',
        Overdue: 'badge-danger',
    };

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    My Assignments
                </h3>
                <button className="text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {assignments.map((a, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate flex-1 mr-3" style={{ color: 'var(--color-text-primary)' }}>
                                {a.training}
                            </p>
                            <span className={`badge ${statusBadge[a.status]} text-[10px]`}>
                                {a.status.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${a.progress}%`,
                                        background: statusColor[a.status],
                                    }}
                                />
                            </div>
                            <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--color-text-muted)' }}>
                                {a.progress}%
                            </span>
                        </div>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                            Due: {a.due}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ComplianceChart() {
    const data = [
        { label: 'Safety', value: 92 },
        { label: 'Technical', value: 78 },
        { label: 'Compliance', value: 95 },
        { label: 'Soft Skills', value: 65 },
        { label: 'Leadership', value: 88 },
    ];

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Compliance by Category
                </h3>
                <BarChart3 size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div className="space-y-3">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs w-20 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.label}
                        </span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${item.value}%`,
                                    background: item.value >= 90
                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                        : item.value >= 70
                                            ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                            : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                }}
                            />
                        </div>
                        <span className="text-xs font-semibold w-8" style={{ color: 'var(--color-text-primary)' }}>
                            {item.value}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        Welcome back, {user?.employeeName?.split(' ')[0] || 'User'} 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Here&apos;s your training overview for today
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary text-sm">
                        <Clock size={16} />
                        Last 30 Days
                    </button>
                    <button className="btn-primary text-sm">
                        <BookOpen size={16} />
                        Browse Programs
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
                <StatCard title="Pending Tasks" value={5} icon={<ClipboardCheck size={22} />} color="#3b82f6" gradient="linear-gradient(135deg, #3b82f6, #2563eb)" change="+2 this week" changeType="up" />
                <StatCard title="Completed" value={12} icon={<CheckCircle size={22} />} color="#10b981" gradient="linear-gradient(135deg, #10b981, #059669)" change="+3 this month" changeType="up" />
                <StatCard title="Overdue" value={2} icon={<AlertTriangle size={22} />} color="#ef4444" gradient="linear-gradient(135deg, #f59e0b, #d97706)" change="Requires attention" changeType="down" />
                <StatCard title="Compliance" value="87%" icon={<TrendingUp size={22} />} color="#8b5cf6" gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" change="+5% from last month" changeType="up" />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6 animate-stagger">
                    <RecentAssignmentsCard />
                    <ComplianceChart />
                </div>
                <div className="animate-stagger">
                    <UpcomingSessionCard />
                </div>
            </div>
        </div>
    );
}
