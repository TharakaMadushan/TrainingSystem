'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { UserCheck, Loader2 } from 'lucide-react';

export default function AttendancePage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Attendance data comes from training schedules — no separate endpoint yet
        setTimeout(() => setLoading(false), 500);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Training Attendance</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Track attendance for scheduled training sessions</p>
            </div>
            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : (
                <div className="card p-12 text-center">
                    <UserCheck size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No attendance records</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Attendance will be recorded when training sessions are conducted. Check the Schedules page for upcoming sessions.</p>
                </div>
            )}
        </div>
    );
}
