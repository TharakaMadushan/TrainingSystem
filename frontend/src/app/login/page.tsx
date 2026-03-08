'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types';
import { Eye, EyeOff, User, Lock, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

// Count-up animation hook
function useCountUp(target: number, duration = 2000, delay = 0) {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);

    const easeOutExpo = useCallback((t: number) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const animate = (timestamp: number) => {
                if (!startTimeRef.current) startTimeRef.current = timestamp;
                const elapsed = timestamp - startTimeRef.current;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);

                setCount(Math.floor(easedProgress * target));

                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                } else {
                    setCount(target);
                }
            };
            rafRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, delay, easeOutExpo]);

    return count;
}

// Animated stat component
function AnimatedStat({ label, target, suffix, delay }: {
    label: string;
    target: number;
    suffix: string;
    delay: number;
}) {
    const count = useCountUp(target, 2000, delay);

    return (
        <div className="login-stat-item">
            <div className="login-stat-value">{count}{suffix}</div>
            <div className="login-stat-label">{label}</div>
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const { setAuth, isAuthenticated } = useAuthStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const request: LoginRequest = { username, password, rememberMe };
            const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', request);
            const result = response.data;

            if (result.success && result.data?.success && result.data.token && result.data.profile) {
                setAuth(result.data.token, result.data.profile);
                router.push('/dashboard');
            } else {
                setError(result.data?.errorMessage || result.message || 'Login failed');
            }
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError.response?.data?.message || 'Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="login-page">
            {/* Left Panel - Branding */}
            <div className="login-left-panel">
                <div className="login-left-bg" />
                <div className="login-left-pattern" />

                {/* Decorative floating shapes */}
                <div className="login-floating-shape login-shape-1" />
                <div className="login-floating-shape login-shape-2" />
                <div className="login-floating-shape login-shape-3" />

                <div className="login-left-content">
                    <div className="animate-fadeUp">
                        <div className="login-brand">
                            <div className="login-brand-icon">
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <h1 className="login-brand-title">SkillForge</h1>
                                <p className="login-brand-subtitle">Training & Development System</p>
                            </div>
                        </div>

                        <h2 className="login-hero-title">
                            Empower Your<br />
                            <span>Workforce</span> With<br />
                            Smart Training
                        </h2>

                        <p className="login-hero-desc">
                            A comprehensive enterprise platform for managing employee training
                            assignments, certifications, and professional development.
                        </p>

                        {/* Stats */}
                        <div className="login-stats">
                            <AnimatedStat label="Training Programs" target={50} suffix="+" delay={300} />
                            <AnimatedStat label="Active Users" target={500} suffix="+" delay={500} />
                            <AnimatedStat label="Compliance Rate" target={94} suffix="%" delay={700} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="login-right-panel">
                <div className="login-form-wrapper animate-fadeUp" style={{ animationDelay: '100ms' }}>
                    {/* Mobile Logo */}
                    <div className="login-mobile-logo">
                        <div className="login-mobile-logo-icon">TR</div>
                        <div>
                            <h1 className="login-mobile-logo-title">SkillForge</h1>
                            <p className="login-mobile-logo-sub">Training System</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="login-card">
                        <div className="login-card-header">
                            <div className="login-card-logo">
                                <GraduationCap size={28} />
                            </div>
                            <h2 className="login-card-title">Welcome back</h2>
                            <p className="login-card-subtitle">
                                Sign in to access your training dashboard
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            {/* Username */}
                            <div className="login-field">
                                <label htmlFor="username" className="login-label">
                                    Username
                                </label>
                                <div className="login-input-wrapper">
                                    <User size={18} className="login-input-icon" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username or employee number"
                                        className="login-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="login-field">
                                <label htmlFor="password" className="login-label">
                                    Password
                                </label>
                                <div className="login-input-wrapper">
                                    <Lock size={18} className="login-input-icon" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="login-input login-input-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="login-password-toggle"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="login-options">
                                <label className="login-remember">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="login-checkbox"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <button type="button" className="login-forgot">
                                    Forgot password?
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="login-error animate-scaleUp">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="login-submit"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="login-footer">
                        © {new Date().getFullYear()} TRDS - Training & Development System
                    </p>
                </div>
            </div>
        </div>
    );
}
