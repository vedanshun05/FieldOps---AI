"use client";
import { useState, useEffect, useCallback } from "react";
import { Wrench, DollarSign, PackageOpen, CalendarPlus, Settings2 } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import StatsCard from "@/components/StatsCard";
import AgentTrace, { LiveAgentTrace } from "@/components/AgentTrace";
import AlertBanner from "@/components/AlertBanner";
import { getDashboardSummary, getAlerts } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, alertsData] = await Promise.all([
        getDashboardSummary(),
        getAlerts(),
      ]);
      setSummary(summaryData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setError("Cannot connect to backend. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleVoiceResult = (result) => {
    setLastResult(result);
    fetchData(); // Refresh dashboard immediately
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Voice Recorder - Absolute Focal Point */}
      <div className="flex flex-col items-center justify-center min-h-[35vh]">
        <VoiceRecorder
          onResult={handleVoiceResult}
          onError={(msg) => setError(msg)}
          onRecordingStateChange={setIsRecording}
          onProcessingStateChange={setIsProcessing}
        />
        {error && (
          <div className="mt-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm max-w-md text-center">
            {error}
          </div>
        )}
      </div>

      {/* Agent Trace (shows while recording/processing OR after processing) */}
      {(isRecording || isProcessing) ? (
        <LiveAgentTrace isRecording={isRecording} isProcessing={isProcessing} />
      ) : lastResult ? (
        <AgentTrace result={lastResult} />
      ) : null}

      {/* Alerts */}
      <AlertBanner alerts={alerts} />

      {/* Minimal Stats Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div className="stagger-1">
            <StatsCard title="Jobs Today" value={summary.total_jobs_today} icon={<Wrench size={18} />} variant="primary" />
          </div>
          <div className="stagger-2">
            <StatsCard title="Today's Rev" value={`$${summary.total_revenue_today.toFixed(0)}`} icon={<DollarSign size={18} />} variant="success" />
          </div>
          <div className="stagger-3">
            <StatsCard title="Low Stock" value={summary.low_stock_items.length} icon={<PackageOpen size={18} />} variant={summary.low_stock_items.length > 0 ? "warning" : "success"} />
          </div>
          <div className="stagger-4">
            <StatsCard title="Follow-ups" value={summary.upcoming_followups.length} icon={<CalendarPlus size={18} />} variant={summary.upcoming_followups.length > 0 ? "danger" : "success"} />
          </div>
        </div>
      )}

      {/* Abstracted Recent Jobs */}
      {summary?.recent_jobs?.length > 0 && (
        <div className="animate-fade-in stagger-4">
          <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 px-2">Recent Field Activity</h3>
          <div className="space-y-2">
            {summary.recent_jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-accent)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  <div>
                    <p className="text-sm font-medium tracking-tight">{job.customer_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{job.job_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono tracking-tighter text-[var(--color-text-secondary)]">
                    {new Date(job.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && !summary && (
        <div className="text-center py-20 text-[var(--color-text-muted)] flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest font-bold">Syncing Systems...</p>
        </div>
      )}
    </div>
  );
}
