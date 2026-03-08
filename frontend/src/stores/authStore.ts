import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, MenuItem, ScopeFilter, UserPreference } from '@/types';

interface AuthState {
    token: string | null;
    user: UserProfile | null;
    isAuthenticated: boolean;
    menuItems: MenuItem[];
    permissions: string[];
    roles: string[];
    scopeFilter: ScopeFilter | null;
    preferences: UserPreference;

    setAuth: (token: string, user: UserProfile) => void;
    logout: () => void;
    updatePreferences: (prefs: Partial<UserPreference>) => void;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
}

const defaultPreferences: UserPreference = {
    themeMode: 'Light',
    sidebarCollapsed: false,
    defaultPageSize: 20,
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            menuItems: [],
            permissions: [],
            roles: [],
            scopeFilter: null,
            preferences: defaultPreferences,

            setAuth: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    menuItems: user.menuItems || [],
                    permissions: user.permissions || [],
                    roles: user.roles || [],
                    scopeFilter: user.scopeFilter || null,
                    preferences: user.preferences || defaultPreferences,
                }),

            logout: () =>
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    menuItems: [],
                    permissions: [],
                    roles: [],
                    scopeFilter: null,
                    preferences: defaultPreferences,
                }),

            updatePreferences: (prefs) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...prefs },
                })),

            hasPermission: (permission) => get().permissions.includes(permission),
            hasRole: (role) => get().roles.includes(role),
        }),
        {
            name: 'trds-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                menuItems: state.menuItems,
                permissions: state.permissions,
                roles: state.roles,
                scopeFilter: state.scopeFilter,
                preferences: state.preferences,
            }),
        }
    )
);
