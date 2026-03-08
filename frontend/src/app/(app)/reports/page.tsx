'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { BarChart3, Loader2, Download } from 'lucide-react';

interface ReportColumn { key: string; label: string; type: string; }
interface ReportData { reportTitle: string; rows: Record<string, unknown>[]; columns: ReportColumn[]; summary: Record<string, unknown> | null; }

export default function ReportsPage() {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('TrainingCompletion');

    const generate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/report', { reportType, dateFrom: null, dateTo: null });
            setReport(res.data.data);
        } catch { setReport(null); }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Reports</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Generate and view training reports</p>
            </div>
            <div className="card p-4 flex flex-col sm:flex-row gap-3">
                <select className="input-field flex-1" value={reportType} onChange={e => setReportType(e.target.value)}>
                    <option value="TrainingCompletion">Training Completion Report</option>
                    <option value="General">General Training Report</option>
                </select>
                <button onClick={generate} disabled={loading} className="btn-primary text-sm">
                    {loading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <BarChart3 size={14} className="inline mr-1" />}
                    Generate Report
                </button>
            </div>

            {report && (
                <div className="card overflow-hidden animate-stagger">
                    <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{report.reportTitle}</h2>
                    </div>
                    {report.summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4" style={{ background: 'var(--color-bg-secondary)' }}>
                            {Object.entries(report.summary).map(([k, v]) => (
                                <div key={k} className="text-center">
                                    <div className="text-xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>{String(v)}</div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>
                                {report.columns.map(c => (
                                    <th key={c.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>{c.label}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {report.rows.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                        {report.columns.map(c => (
                                            <td key={c.key} className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                {c.type === 'percent' ? `${row[c.key]}%` : String(row[c.key] ?? '—')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
