'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CalendarDays, Plus, MapPin, Clock, Users, Loader2, Video } from 'lucide-react';

interface Schedule {
    id: number; scheduleCode: string; sessionTitle: string | null;
    trainingTitle: string; venue: string | null; meetingLink: string | null;
    trainerName: string | null; startDateTime: string; endDateTime: string;
    capacity: number | null; enrolledCount: number; status: string;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/schedule', { params: { page: 1, pageSize: 50 } });
                setSchedules(res.data.data?.items ?? []);
            } catch { setSchedules([]); }
            setLoading(false);
        })();
    }, []);

    const statusColor: Record<string, string> = { Scheduled: '#3b82f6', InProgress: '#f59e0b', Completed: '#10b981', Cancelled: '#ef4444' };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Training Schedules</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage upcoming and past training sessions</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> New Schedule</button>
            </div>

            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : schedules.length === 0 ? (
                <div className="card p-12 text-center">
                    <CalendarDays size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No schedules found</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create your first training schedule.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
                    {schedules.map(s => (
                        <div key={s.id} className="card p-5 card-interactive">
                            <div className="flex items-start justify-between mb-3">
                                <span className="badge text-[11px]" style={{ background: (statusColor[s.status] || '#94a3b8') + '15', color: statusColor[s.status] || '#94a3b8' }}>{s.status}</span>
                                <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{s.scheduleCode}</span>
                            </div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{s.sessionTitle || s.trainingTitle}</h3>
                            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{s.trainingTitle}</p>
                            <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <div className="flex items-center gap-2"><Clock size={12} />{new Date(s.startDateTime).toLocaleString()}</div>
                                {s.venue && <div className="flex items-center gap-2"><MapPin size={12} />{s.venue}</div>}
                                {s.meetingLink && <div className="flex items-center gap-2"><Video size={12} /><a href={s.meetingLink} className="underline" target="_blank">Join Meeting</a></div>}
                                {s.trainerName && <div className="flex items-center gap-2"><Users size={12} />{s.trainerName}</div>}
                            </div>
                            {s.capacity && (
                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span style={{ color: 'var(--color-text-muted)' }}>Enrollment</span>
                                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{s.enrolledCount}/{s.capacity}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, s.enrolledCount * 100 / s.capacity)}%`, background: s.enrolledCount >= s.capacity ? '#ef4444' : '#3b82f6' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
