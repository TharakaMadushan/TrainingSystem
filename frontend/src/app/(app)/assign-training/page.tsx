'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Loader2, Search, CheckCircle } from 'lucide-react';

interface LookupDto { id: number; code: string; name: string; }
interface EmployeeLookup { employeeNo: string; employeeName: string; department: string | null; }

export default function AssignTrainingPage() {
    const [trainings, setTrainings] = useState<LookupDto[]>([]);
    const [employees, setEmployees] = useState<EmployeeLookup[]>([]);
    const [empSearch, setEmpSearch] = useState('');
    const [form, setForm] = useState({ trainingId: 0, assignmentType: 'Individual', employeeNos: [] as string[], dueDate: '', priority: 'Normal', isMandatory: false, notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/training', { params: { page: 1, pageSize: 100 } });
                setTrainings((res.data.data?.items ?? []).map((t: { id: number; trainingCode: string; title: string }) => ({ id: t.id, code: t.trainingCode, name: t.title })));
            } catch { }
        })();
    }, []);

    useEffect(() => {
        if (empSearch.length < 2) { setEmployees([]); return; }
        const t = setTimeout(async () => {
            try {
                const res = await api.get('/employee/search', { params: { term: empSearch } });
                setEmployees(res.data.data ?? []);
            } catch { setEmployees([]); }
        }, 300);
        return () => clearTimeout(t);
    }, [empSearch]);

    const toggleEmployee = (no: string) => {
        setForm(f => ({ ...f, employeeNos: f.employeeNos.includes(no) ? f.employeeNos.filter(x => x !== no) : [...f.employeeNos, no] }));
    };

    const submit = async () => {
        if (!form.trainingId || form.employeeNos.length === 0) return;
        setSubmitting(true); setSuccess(false);
        try {
            await api.post('/assignment', { ...form, dueDate: form.dueDate || null });
            setSuccess(true); setForm(f => ({ ...f, employeeNos: [], notes: '', dueDate: '' }));
            setTimeout(() => setSuccess(false), 4000);
        } catch { }
        setSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Assign Training</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Assign training programs to employees</p>
            </div>
            <div className="card p-6 max-w-2xl space-y-5">
                <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Training Program *</label>
                    <select className="input-field" value={form.trainingId} onChange={e => setForm(f => ({ ...f, trainingId: +e.target.value }))}>
                        <option value={0}>Select training...</option>
                        {trainings.map(t => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Due Date</label>
                        <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Priority</label>
                        <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                            {['Low', 'Normal', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isMandatory} onChange={e => setForm(f => ({ ...f, isMandatory: e.target.checked }))} className="w-4 h-4" style={{ accentColor: 'var(--color-accent-primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Mandatory training</span>
                    </label>
                </div>
                <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Employees * ({form.employeeNos.length} selected)</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                        <input className="input-field pl-9" placeholder="Search employees..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} />
                    </div>
                    {employees.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg" style={{ border: '1px solid var(--color-border-default)' }}>
                            {employees.map(e => (
                                <div key={e.employeeNo} onClick={() => toggleEmployee(e.employeeNo)} className="flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-all"
                                    style={{ background: form.employeeNos.includes(e.employeeNo) ? 'var(--color-bg-hover)' : 'transparent' }}
                                    onMouseEnter={ev => ev.currentTarget.style.background = 'var(--color-bg-hover)'} onMouseLeave={ev => ev.currentTarget.style.background = form.employeeNos.includes(e.employeeNo) ? 'var(--color-bg-hover)' : 'transparent'}>
                                    <input type="checkbox" readOnly checked={form.employeeNos.includes(e.employeeNo)} className="w-3.5 h-3.5" style={{ accentColor: 'var(--color-accent-primary)' }} />
                                    <span className="font-mono text-xs" style={{ color: 'var(--color-accent-primary)' }}>{e.employeeNo}</span>
                                    <span style={{ color: 'var(--color-text-primary)' }}>{e.employeeName}</span>
                                    {e.department && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>({e.department})</span>}
                                </div>
                            ))}
                        </div>
                    )}
                    {form.employeeNos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {form.employeeNos.map(no => <span key={no} className="badge badge-info text-[11px] cursor-pointer" onClick={() => toggleEmployee(no)}>{no} ✕</span>)}
                        </div>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-primary)' }}>Notes</label>
                    <textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
                </div>
                <div className="pt-4 flex gap-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                    <button onClick={submit} disabled={submitting || !form.trainingId || form.employeeNos.length === 0} className="btn-primary text-sm disabled:opacity-50">
                        {submitting ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <Send size={14} className="inline mr-1" />}
                        {submitting ? 'Assigning...' : 'Assign Training'}
                    </button>
                    {success && <span className="text-sm font-medium flex items-center gap-1" style={{ color: '#10b981' }}><CheckCircle size={14} /> Assigned successfully!</span>}
                </div>
            </div>
        </div>
    );
}
