'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import api from '@/lib/api';
import {
    BookOpen, ClipboardCheck, CalendarDays, Award, AlertTriangle,
    TrendingUp, Clock, Users, CheckCircle, ArrowUpRight, BarChart3,
    RefreshCw, Loader2
} from 'lucide-react';

// ============ Types ============
interface DashboardStats {
    pendingCount: number;
    overdueCount: number;
    completedCount: number;
    inProgressCount: number;
    totalAssigned: number;
    compliancePercent: number;
    pendingApprovals: number;
    upcomingSessions: number;
    expiringCertificates: number;
}

interface RecentAssignment {
    id: number;
    employeeName: string; // actually training title from backend
    status: string;
    completionPercent: number;
    dueDate: string;
}

interface UpcomingSession {
    id: number;
    title: string;
    startDateTime: string;
    venue: string;
    status: string;
}

interface DashboardWidget {
    id: string;
    title: string;
    type: string;
    data: unknown;
    icon?: string;
    color?: string;
    order: number;
}

interface DashboardData {
    widgets: DashboardWidget[];
    userRole: string;
}

// ============ Animated Stat Card ============
function AnimatedStatCard({ title, value, icon, gradient, change, changeType, suffix = '' }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
    change?: string;
    changeType?: 'up' | 'down' | 'neutral';
    suffix?: string;
}) {
    const animated = useAnimatedCounter(value, 1200, suffix === '%' ? 1 : 0);

    return (
        <div className="card p-5 card-interactive">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {animated}{suffix}
                    </p>
                    {change && (
                        <p className="text-xs mt-2 flex items-center gap-1"
                            style={{
                                color: changeType === 'up' ? '#10b981' : changeType === 'down' ? '#ef4444' : '#64748b',
                            }}
                        >
                            <ArrowUpRight size={12} className={changeType === 'down' ? 'rotate-90' : ''} />
                            {change}
                        </p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ background: gradient }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ============ Skeleton loader ============
function StatSkeleton() {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-8 w-16" />
                    <div className="skeleton h-3 w-28" />
                </div>
                <div className="skeleton w-12 h-12 rounded-xl" />
            </div>
        </div>
    );
}

function CardSkeleton({ lines = 4 }: { lines?: number }) {
    return (
        <div className="card p-5 space-y-4">
            <div className="flex justify-between items-center">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-16" />
            </div>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-2 w-3/4" />
                </div>
            ))}
        </div>
    );
}

// ============ Upcoming Sessions Card ============
function UpcomingSessionCard({ sessions }: { sessions: UpcomingSession[] }) {
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
                {sessions.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                        No upcoming sessions
                    </p>
                ) : sessions.map((session, idx) => (
                    <div key={session.id || idx}
                        className="flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer"
                        style={{ background: 'var(--color-bg-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                background: session.status === 'Live' ? '#dcfce7' : '#dbeafe',
                                color: session.status === 'Live' ? '#16a34a' : '#2563eb',
                            }}>
                            <CalendarDays size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {session.title}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {new Date(session.startDateTime).toLocaleDateString()} · {session.venue || 'TBD'}
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

// ============ Recent Assignments Card ============
function RecentAssignmentsCard({ assignments }: { assignments: RecentAssignment[] }) {
    const statusColor: Record<string, string> = {
        InProgress: '#6366f1', NotStarted: '#94a3b8', Completed: '#10b981', Overdue: '#ef4444',
    };
    const statusBadge: Record<string, string> = {
        InProgress: 'badge-info', NotStarted: 'badge-neutral', Completed: 'badge-success', Overdue: 'badge-danger',
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
                {assignments.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                        No assignments yet
                    </p>
                ) : assignments.map((a, idx) => (
                    <div key={a.id || idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate flex-1 mr-3" style={{ color: 'var(--color-text-primary)' }}>
                                {a.employeeName}
                            </p>
                            <span className={`badge ${statusBadge[a.status] || 'badge-neutral'} text-[10px]`}>
                                {a.status.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                <div className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${a.completionPercent}%`,
                                        background: statusColor[a.status] || '#94a3b8',
                                    }}
                                />
                            </div>
                            <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--color-text-muted)' }}>
                                {a.completionPercent}%
                            </span>
                        </div>
                        {a.dueDate && (
                            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                                Due: {new Date(a.dueDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============ Compliance Chart (animated bars) ============
function ComplianceChart({ stats }: { stats: DashboardStats }) {
    const categories = [
        { label: 'Completed', value: stats.totalAssigned > 0 ? Math.round((stats.completedCount / stats.totalAssigned) * 100) : 0 },
        { label: 'In Progress', value: stats.totalAssigned > 0 ? Math.round((stats.inProgressCount / stats.totalAssigned) * 100) : 0 },
        { label: 'Pending', value: stats.totalAssigned > 0 ? Math.round((stats.pendingCount / stats.totalAssigned) * 100) : 0 },
        { label: 'Overdue', value: stats.totalAssigned > 0 ? Math.round((stats.overdueCount / stats.totalAssigned) * 100) : 0 },
    ];

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Training Status Breakdown
                </h3>
                <BarChart3 size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div className="space-y-3">
                {categories.map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs w-20 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.label}
                        </span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${item.value}%`,
                                    background: item.label === 'Completed' ? 'linear-gradient(90deg, #10b981, #34d399)'
                                        : item.label === 'In Progress' ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                                            : item.label === 'Overdue' ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                                : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                                }}
                            />
                        </div>
                        <span className="text-xs font-semibold w-10" style={{ color: 'var(--color-text-primary)' }}>
                            {item.value}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============ Dashboard Page ============
const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [assignments, setAssignments] = useState<RecentAssignment[]>([]);
    const [sessions, setSessions] = useState<UpcomingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchDashboard = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const response = await api.get<{
                success: boolean;
                data: DashboardData;
            }>('/dashboard');

            if (response.data?.success && response.data.data) {
                const dashboard = response.data.data;

                // Extract stats from widgets
                const statsWidget = dashboard.widgets.find(w => w.type === 'stat' || w.id === 'stats');
                if (statsWidget?.data) {
                    setStats(statsWidget.data as DashboardStats);
                } else {
                    // Try to build stats from individual stat widgets
                    const allStats: Partial<DashboardStats> = {};
                    dashboard.widgets.forEach(w => {
                        if (w.type === 'stat' && w.data) {
                            Object.assign(allStats, w.data);
                        }
                    });
                    if (Object.keys(allStats).length > 0) {
                        setStats(allStats as DashboardStats);
                    }
                }

                // Extract assignments
                const assignWidget = dashboard.widgets.find(w => w.type === 'list' || w.id === 'assignments');
                if (assignWidget?.data) {
                    setAssignments(assignWidget.data as RecentAssignment[]);
                }

                // Extract sessions
                const sessionWidget = dashboard.widgets.find(w => w.id === 'sessions' || w.type === 'schedule');
                if (sessionWidget?.data) {
                    setSessions(sessionWidget.data as UpcomingSession[]);
                }
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            // Set empty stats so UI doesn't show infinite loading
            if (!stats) {
                setStats({
                    pendingCount: 0, overdueCount: 0, completedCount: 0,
                    inProgressCount: 0, totalAssigned: 0, compliancePercent: 0,
                    pendingApprovals: 0, upcomingSessions: 0, expiringCertificates: 0,
                });
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [stats]);

    // Initial fetch
    useEffect(() => {
        fetchDashboard();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchDashboard(true), AUTO_REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchDashboard]);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        Welcome back, {user?.employeeName?.split(' ')[0] || 'User'} 👋
                    </h1>
                    <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                        Here&apos;s your training overview
                        {lastUpdated && (
                            <span className="text-[11px]">
                                · Updated {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="btn-secondary text-sm"
                        onClick={() => fetchDashboard(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </button>
                    <button className="btn-primary text-sm">
                        <BookOpen size={16} />
                        Browse Programs
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
                    <AnimatedStatCard
                        title="Pending Tasks"
                        value={stats.pendingCount + stats.inProgressCount}
                        icon={<ClipboardCheck size={22} />}
                        gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
                        change={stats.inProgressCount > 0 ? `${stats.inProgressCount} in progress` : undefined}
                        changeType="neutral"
                    />
                    <AnimatedStatCard
                        title="Completed"
                        value={stats.completedCount}
                        icon={<CheckCircle size={22} />}
                        gradient="linear-gradient(135deg, #10b981, #059669)"
                        change={`of ${stats.totalAssigned} total`}
                        changeType="up"
                    />
                    <AnimatedStatCard
                        title="Overdue"
                        value={stats.overdueCount}
                        icon={<AlertTriangle size={22} />}
                        gradient="linear-gradient(135deg, #f59e0b, #d97706)"
                        change={stats.overdueCount > 0 ? 'Requires attention' : 'All on track'}
                        changeType={stats.overdueCount > 0 ? 'down' : 'up'}
                    />
                    <AnimatedStatCard
                        title="Compliance"
                        value={stats.compliancePercent}
                        suffix="%"
                        icon={<TrendingUp size={22} />}
                        gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
                    />
                </div>
            )}

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <CardSkeleton lines={5} />
                        <CardSkeleton lines={4} />
                    </div>
                    <CardSkeleton lines={3} />
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6 animate-stagger">
                        <RecentAssignmentsCard assignments={assignments} />
                        <ComplianceChart stats={stats} />
                    </div>
                    <div className="animate-stagger">
                        <UpcomingSessionCard sessions={sessions} />
                    </div>
                </div>
            )}
        </div>
    );
}
