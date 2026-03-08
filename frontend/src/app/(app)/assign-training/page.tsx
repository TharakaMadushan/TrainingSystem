'use client';
import { UserPlus, Search, BookOpen, CalendarDays, Users, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const trainingOptions = [
    { id: 1, title: 'Workplace Safety Standards', category: 'Safety', mandatory: true },
    { id: 2, title: 'Data Privacy & GDPR', category: 'Compliance', mandatory: true },
    { id: 3, title: 'Leadership Workshop', category: 'Soft Skills', mandatory: false },
    { id: 4, title: 'First Aid Certification', category: 'Safety', mandatory: true },
    { id: 5, title: 'Quality Management System', category: 'Compliance', mandatory: true },
    { id: 6, title: 'Advanced Excel & Data Analysis', category: 'Technical', mandatory: false },
];

const employees = [
    { empNo: 'EMP001', name: 'John Smith', department: 'Engineering' },
    { empNo: 'EMP002', name: 'Emily Davis', department: 'Engineering' },
    { empNo: 'EMP003', name: 'Mark Wilson', department: 'Engineering' },
    { empNo: 'EMP004', name: 'Sarah Lee', department: 'QA' },
    { empNo: 'EMP005', name: 'David Brown', department: 'QA' },
    { empNo: 'EMP006', name: 'Lisa Chen', department: 'HR' },
];

export default function AssignTrainingPage() {
    const [selectedTraining, setSelectedTraining] = useState<number | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState('');

    const toggleEmployee = (empNo: string) => {
        setSelectedEmployees(prev => prev.includes(empNo) ? prev.filter(e => e !== empNo) : [...prev, empNo]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Assign Training</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Assign training programs to employees</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Step 1: Select Training */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Select Training</h3>
                    </div>
                    <div className="relative mb-3">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9 text-sm" placeholder="Search..." />
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {trainingOptions.map((t) => (
                            <button key={t.id} onClick={() => setSelectedTraining(t.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                                style={{ background: selectedTraining === t.id ? 'var(--color-bg-active)' : 'var(--color-bg-secondary)', border: selectedTraining === t.id ? '2px solid var(--color-accent-primary)' : '2px solid transparent' }}>
                                <BookOpen size={16} style={{ color: selectedTraining === t.id ? 'var(--color-accent-primary)' : 'var(--color-text-muted)' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{t.title}</p>
                                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t.category} {t.mandatory && '· Required'}</p>
                                </div>
                                {selectedTraining === t.id && <CheckCircle size={16} style={{ color: 'var(--color-accent-primary)' }} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Select Employees */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                            style={{ background: selectedTraining ? '#3b82f6' : 'var(--color-bg-tertiary)', color: selectedTraining ? 'white' : 'var(--color-text-muted)' }}>2</div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Select Employees</h3>
                        {selectedEmployees.length > 0 && <span className="badge badge-info text-[10px]">{selectedEmployees.length} selected</span>}
                    </div>
                    <div className="relative mb-3">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9 text-sm" placeholder="Search employees..." />
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {employees.map((e) => (
                            <button key={e.empNo} onClick={() => toggleEmployee(e.empNo)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                                style={{ background: selectedEmployees.includes(e.empNo) ? 'var(--color-bg-active)' : 'var(--color-bg-secondary)', border: selectedEmployees.includes(e.empNo) ? '2px solid var(--color-accent-primary)' : '2px solid transparent' }}>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>{e.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{e.name}</p>
                                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{e.empNo} · {e.department}</p>
                                </div>
                                {selectedEmployees.includes(e.empNo) && <CheckCircle size={16} style={{ color: 'var(--color-accent-primary)' }} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 3: Set Details */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                            style={{ background: selectedEmployees.length > 0 ? '#3b82f6' : 'var(--color-bg-tertiary)', color: selectedEmployees.length > 0 ? 'white' : 'var(--color-text-muted)' }}>3</div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Set Details</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Due Date</label>
                            <div className="relative">
                                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                                <input type="date" className="input-field pl-9" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Priority</label>
                            <select className="input-field">
                                <option>Normal</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Notes (Optional)</label>
                            <textarea className="input-field" rows={3} placeholder="Add any additional notes..." />
                        </div>

                        {/* Summary */}
                        <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Summary</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                {selectedTraining ? trainingOptions.find(t => t.id === selectedTraining)?.title : 'No training selected'}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                {selectedEmployees.length} employee(s) · Due: {dueDate || 'Not set'}
                            </p>
                        </div>

                        <button className="btn-primary w-full text-sm justify-center" disabled={!selectedTraining || selectedEmployees.length === 0 || !dueDate}>
                            <UserPlus size={16} /> Assign Training
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
