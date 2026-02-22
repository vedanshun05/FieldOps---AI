"use client";
import { useState, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import { getFollowups } from "@/lib/api";

export default function FollowupsPage() {
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getFollowups();
                setFollowups(data);
            } catch (err) {
                console.error("Failed to load follow-ups:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        const interval = setInterval(fetch, 10000);
        return () => clearInterval(interval);
    }, []);

    const getDaysUntil = (dateStr) => {
        const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `${Math.abs(diff)} days overdue`;
        if (diff === 0) return "Due today";
        if (diff === 1) return "Due tomorrow";
        return `In ${diff} days`;
    };

    const getUrgency = (dateStr) => {
        const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return "overdue";
        if (diff <= 3) return "soon";
        return "normal";
    };

    const urgencyStyles = {
        overdue: "border-l-red-500 bg-red-500/5",
        soon: "border-l-amber-500 bg-amber-500/5",
        normal: "border-l-indigo-500",
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Follow-ups</h2>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">Scheduled customer follow-ups — auto-extracted from voice notes</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Loading follow-ups...
                </div>
            ) : followups.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <CalendarPlus size={48} className="mx-auto text-[var(--color-border-accent)] mb-4 opacity-50" />
                    <p className="text-lg font-medium">No pending follow-ups</p>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Mention a follow-up date in your voice note to auto-schedule</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {followups.map((fu) => {
                        const urgency = getUrgency(fu.scheduled_date);
                        return (
                            <div
                                key={fu.id}
                                className={`glass-card p-5 border-l-4 ${urgencyStyles[urgency]} animate-fade-in`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{fu.customer_name}</h3>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{fu.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {new Date(fu.scheduled_date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${urgency === "overdue" ? "text-red-400" :
                                            urgency === "soon" ? "text-amber-400" :
                                                "text-[var(--color-text-muted)]"
                                            }`}>
                                            {getDaysUntil(fu.scheduled_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
