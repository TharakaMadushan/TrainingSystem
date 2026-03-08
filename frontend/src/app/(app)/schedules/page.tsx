'use client';
import { CalendarDays, MapPin, Users, Clock, Video, Search, Filter, Plus } from 'lucide-react';

const schedules = [
    { id: 1, title: 'Fire Safety Training', training: 'Workplace Safety Standards', date: '2025-03-12', time: '09:00 AM - 12:00 PM', venue: 'Training Room 301', trainer: 'John Anderson', capacity: 30, enrolled: 25, status: 'Scheduled', mode: 'Classroom' },
    { id: 2, title: 'GDPR Awareness Session', training: 'Data Privacy & GDPR', date: '2025-03-14', time: '02:00 PM - 04:00 PM', venue: 'Virtual', trainer: 'Emily Richards', capacity: 50, enrolled: 38, status: 'Scheduled', mode: 'Online' },
    { id: 3, title: 'Leadership Masterclass', training: 'Leadership Workshop', date: '2025-03-10', time: '10:00 AM - 01:00 PM', venue: 'Conference Hall A', trainer: 'Dr. Sarah Miller', capacity: 20, enrolled: 20, status: 'Completed', mode: 'Classroom' },
    { id: 4, title: 'First Aid Practical', training: 'First Aid Certification', date: '2025-03-18', time: '09:00 AM - 05:00 PM', venue: 'Medical Wing', trainer: 'Mark Torres', capacity: 15, enrolled: 12, status: 'Scheduled', mode: 'Practical' },
    { id: 5, title: 'ISO Audit Prep', training: 'Quality Management System', date: '2025-03-20', time: '11:00 AM - 01:00 PM', venue: 'Virtual', trainer: 'Lisa Chen', capacity: 40, enrolled: 15, status: 'Open', mode: 'Online' },
];

const statusStyles: Record<string, string> = { Scheduled: 'badge-info', Open: 'badge-success', Completed: 'badge-neutral', Cancelled: 'badge-danger' };

export default function SchedulesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Schedules</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Upcoming and past training sessions</p>
                </div>
                <button className="btn-primary text-sm"><Plus size={16} /> New Session</button>
            </div>

            {/* Search & Filter */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search sessions..." />
                    </div>
                    <button className="btn-secondary text-sm"><Filter size={14} /> Filters</button>
                </div>
            </div>

            {/* Session Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-stagger">
                {schedules.map((s) => (
                    <div key={s.id} className="card p-5 card-interactive">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{s.title}</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.training}</p>
                            </div>
                            <span className={`badge ${statusStyles[s.status]} text-[10px]`}>{s.status}</span>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <CalendarDays size={14} /> <span>{s.date} · {s.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                {s.mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                                <span>{s.venue}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <Users size={14} /> <span>{s.trainer}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full" style={{ background: 'var(--color-bg-tertiary)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${(s.enrolled / s.capacity) * 100}%`, background: s.enrolled >= s.capacity ? '#ef4444' : '#3b82f6' }} />
                                </div>
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.enrolled}/{s.capacity} enrolled</span>
                            </div>
                            {s.status !== 'Completed' && (
                                <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: 'var(--color-accent-primary)', background: 'var(--color-bg-active)' }}>
                                    {s.enrolled >= s.capacity ? 'Waitlist' : 'Enroll'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
