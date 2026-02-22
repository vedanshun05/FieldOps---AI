"use client";
import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { getJobs } from "@/lib/api";

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch (err) {
                console.error("Failed to load jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        const interval = setInterval(fetch, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Jobs</h2>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">All completed field service jobs</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Loading jobs...
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Wrench size={48} className="mx-auto text-[var(--color-border-accent)] mb-4 opacity-50" />
                    <p className="text-lg font-medium">No jobs yet</p>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Record a voice note on the dashboard to log your first job</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass-card p-5 animate-fade-in">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg">{job.customer_name}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">{job.job_type}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                        {job.status}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400">
                                        {Math.round(job.confidence_score * 100)}% confidence
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="p-2.5 rounded-lg bg-[var(--color-background)]">
                                    <p className="text-[var(--color-text-muted)] text-xs">Labor</p>
                                    <p className="font-medium">{job.labor_hours}h</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-[var(--color-background)]">
                                    <p className="text-[var(--color-text-muted)] text-xs">Materials</p>
                                    <p className="font-medium">{job.materials_used?.length || 0} items</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-[var(--color-background)] col-span-2">
                                    <p className="text-[var(--color-text-muted)] text-xs">Date</p>
                                    <p className="font-medium">{new Date(job.created_at).toLocaleDateString()} {new Date(job.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                </div>
                            </div>

                            {job.materials_used?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {job.materials_used.map((m, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs">
                                            {m.quantity}× {m.item}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {job.transcript && (
                                <div className="mt-3 p-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-muted)]">Transcript</p>
                                    <p className="text-xs text-[var(--color-text-secondary)] italic mt-0.5">{job.transcript}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
