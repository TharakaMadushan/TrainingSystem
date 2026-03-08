'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';
import {
    LayoutDashboard, GraduationCap, ClipboardCheck, Users, CalendarDays,
    Award, FileBarChart, Settings, Bell, ChevronDown, ChevronRight,
    LogOut, Moon, Sun, Menu, X, Shield, Layers, UserCog,
    BookOpen, UserPlus, FileText, CheckSquare, Calendar, Filter,
    FileSearch, Sliders, ShieldCheck, BarChart3, Library
} from 'lucide-react';

// Map icon name strings from backend to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
    'LayoutDashboard': LayoutDashboard,
    'BookOpen': BookOpen,
    'Users': Users,
    'UserPlus': UserPlus,
    'Library': Library,
    'FileText': FileText,
    'CheckSquare': CheckSquare,
    'Calendar': Calendar,
    'ClipboardCheck': ClipboardCheck,
    'Award': Award,
    'Shield': Shield,
    'BarChart3': BarChart3,
    'Settings': Settings,
    'UserCog': UserCog,
    'ShieldCheck': ShieldCheck,
    'Menu': Menu,
    'Filter': Filter,
    'FileSearch': FileSearch,
    'Sliders': Sliders,
    'CalendarDays': CalendarDays,
    'GraduationCap': GraduationCap,
    'FileBarChart': FileBarChart,
    'Layers': Layers,
    // Fallbacks for module codes (backward compat)
    'DASHBOARD': LayoutDashboard,
    'TRAINING': GraduationCap,
    'ASSIGNMENT': ClipboardCheck,
    'EMPLOYEES': Users,
    'SCHEDULE': CalendarDays,
    'CERTIFICATES': Award,
    'REPORTS': FileBarChart,
    'SETTINGS': Settings,
    'APPROVAL': Shield,
    'ADMIN': UserCog,
    'MODULES': Layers,
};

function getIcon(iconName: string) {
    const Icon = iconMap[iconName] || LayoutDashboard;
    return <Icon size={20} />;
}

// Static fallback menu for when backend menus aren't loaded
const defaultMenu = [
    { route: '/dashboard', menuName: 'Dashboard', menuCode: 'DASHBOARD', icon: 'LayoutDashboard', children: [] },
    { route: '/training-catalog', menuName: 'Training', menuCode: 'TRAINING', icon: 'GraduationCap', children: [] },
    {
        route: '/my-trainings', menuName: 'Assignments', menuCode: 'ASSIGNMENT', icon: 'ClipboardCheck', children: [
            { route: '/my-trainings', menuName: 'My Assignments', menuCode: 'MY_ASSIGN', icon: 'BookOpen', children: [] },
            { route: '/team-trainings', menuName: 'Team View', menuCode: 'TEAM_ASSIGN', icon: 'Users', children: [] },
        ]
    },
    { route: '/approvals', menuName: 'Approvals', menuCode: 'APPROVAL', icon: 'Shield', children: [] },
    { route: '/schedules', menuName: 'Schedule', menuCode: 'SCHEDULE', icon: 'Calendar', children: [] },
    { route: '/certificates', menuName: 'Certificates', menuCode: 'CERTIFICATES', icon: 'Award', children: [] },
    { route: '/reports', menuName: 'Reports', menuCode: 'REPORTS', icon: 'BarChart3', children: [] },
    {
        route: '/admin', menuName: 'Administration', menuCode: 'ADMIN', icon: 'Settings', children: [
            { route: '/admin/users', menuName: 'Users', menuCode: 'USERS', icon: 'UserCog', children: [] },
            { route: '/admin/roles', menuName: 'Roles', menuCode: 'ROLES', icon: 'ShieldCheck', children: [] },
        ]
    },
    { route: '/settings', menuName: 'Settings', menuCode: 'SETTINGS', icon: 'Sliders', children: [] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout, preferences, updatePreferences, menuItems } = useAuthStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationCount] = useState(3);

    const isDark = preferences.themeMode === 'Dark';
    const navMenus = menuItems?.length > 0 ? menuItems : defaultMenu;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const toggleTheme = () => {
        updatePreferences({ themeMode: isDark ? 'Light' : 'Dark' });
    };

    const toggleExpand = (code: string) => {
        setExpandedMenus((prev) => {
            const next = new Set(prev);
            next.has(code) ? next.delete(code) : next.add(code);
            return next;
        });
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed left-0 top-0 h-full z-40 flex flex-col border-r transition-all duration-300',
                    sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
                style={{
                    background: 'var(--color-bg-sidebar)',
                    borderColor: 'var(--color-border-default)',
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-3 px-4 border-b"
                    style={{
                        height: 'var(--topbar-height)',
                        borderColor: 'var(--color-border-default)',
                    }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        TR
                    </div>
                    {!sidebarCollapsed && (
                        <div className="animate-fadeIn">
                            <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                TRDS
                            </div>
                            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                                Training System
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    <div className="animate-stagger">
                        {navMenus.map((item) => {
                            const isActive = pathname === item.route || pathname?.startsWith(item.route + '/');
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedMenus.has(item.menuCode);

                            return (
                                <div key={item.menuCode} className="mb-0.5">
                                    {hasChildren ? (
                                        <button
                                            onClick={() => toggleExpand(item.menuCode)}
                                            className={clsx(
                                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                                isActive ? 'text-blue-600' : ''
                                            )}
                                            style={{
                                                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                                background: isActive ? 'var(--color-bg-active)' : 'transparent',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {getIcon(item.icon || item.menuCode)}
                                            {!sidebarCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left">{item.menuName}</span>
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.route || '/dashboard'}
                                            className={clsx(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all'
                                            )}
                                            style={{
                                                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                                background: isActive ? 'var(--color-bg-active)' : 'transparent',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {getIcon(item.icon || item.menuCode)}
                                            {!sidebarCollapsed && <span>{item.menuName}</span>}
                                        </Link>
                                    )}

                                    {/* Submenu */}
                                    {hasChildren && isExpanded && !sidebarCollapsed && (
                                        <div className="ml-8 mt-1 animate-fadeDown">
                                            {item.children.map((child) => {
                                                const childActive = pathname === child.route;
                                                return (
                                                    <Link
                                                        key={child.menuCode}
                                                        href={child.route || '#'}
                                                        className="block px-3 py-2 rounded-md text-[13px] transition-all"
                                                        style={{
                                                            color: childActive ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                                                            background: childActive ? 'var(--color-bg-active)' : 'transparent',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!childActive) e.currentTarget.style.background = 'var(--color-bg-hover)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!childActive) e.currentTarget.style.background = 'transparent';
                                                        }}
                                                    >
                                                        {child.menuName}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div
                    className="px-3 py-3 border-t"
                    style={{ borderColor: 'var(--color-border-default)' }}
                >
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                        style={{ color: 'var(--color-accent-danger)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <LogOut size={18} />
                        {!sidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main */}
            <div
                className={clsx(
                    'flex-1 flex flex-col transition-all duration-300',
                    sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
                )}
            >
                {/* Topbar */}
                <header
                    className="sticky top-0 z-20 flex items-center justify-between px-6 border-b"
                    style={{
                        height: 'var(--topbar-height)',
                        background: 'var(--color-bg-primary)',
                        borderColor: 'var(--color-border-default)',
                    }}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) setMobileMenuOpen(!mobileMenuOpen);
                                else setSidebarCollapsed(!sidebarCollapsed);
                            }}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h1 className="text-lg font-semibold hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
                            {navMenus.find((m) => pathname?.startsWith(m.route || ''))?.menuName || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg transition-all"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Notifications */}
                        <button
                            className="p-2.5 rounded-lg transition-all relative"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Bell size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* User */}
                        <div className="flex items-center gap-3 ml-2 pl-3 border-l" style={{ borderColor: 'var(--color-border-default)' }}>
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                            >
                                {user?.employeeName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    {user?.employeeName || 'User'}
                                </div>
                                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                                    {user?.roles?.[0] || user?.userType || 'Employee'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="animate-fadeUp">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
