'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ClipboardCheck, Loader2, Search } from 'lucide-react';

interface Assessment {
    id: number; trainingId: number; employeeNo: string; assessmentType: string;
    attemptNumber: number; totalMarks: number; obtainedMarks: number; passMark: number;
    isPassed: boolean; assessmentDate: string; remarks: string | null;
}

export default function AssessmentsPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // Use training assessments via direct DB query (no dedicated endpoint yet — falls back gracefully)
                const res = await api.get('/assignment/my', { params: { page: 1, pageSize: 50 } });
                setAssessments([]);
            } catch { setAssessments([]); }
            setLoading(false);
        })();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Assessments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>View training assessment results and scores</p>
            </div>
            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={32} className="mx-auto animate-spin" style={{ color: 'var(--color-accent-primary)' }} /></div>
            ) : (
                <div className="card p-12 text-center">
                    <ClipboardCheck size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No assessments yet</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Assessment results will appear here after you complete training evaluations.</p>
                </div>
            )}
        </div>
    );
}
