"use client";

export default function AgentTrace({ result }) {
    if (!result) return null;

    const { extraction, agent_result } = result;

    return (
        <div className="animate-fade-in stagger-2 mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--color-border)]"></div>
                <h3 className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest px-4 py-1 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
                    Agent Execution Trace
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--color-border)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Data Flow */}
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">1. Raw Transcript</p>
                        <p className="text-sm font-serif italic text-[var(--color-text-secondary)] border-l-2 border-[var(--color-border)] pl-3 py-1">
                            &quot;{result.transcript}&quot;
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">2. Neural Extraction</p>
                        <div className="font-mono text-xs text-[var(--color-text-secondary)] space-y-1 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                            <div><span className="text-indigo-400">customer</span>: &quot;{extraction.customer_name}&quot;</div>
                            <div><span className="text-indigo-400">job_type</span>: &quot;{extraction.job_type}&quot;</div>
                            <div><span className="text-indigo-400">labor_hours</span>: {extraction.labor_hours}</div>
                            <div><span className="text-indigo-400">confidence</span>: {Math.round(extraction.confidence_score * 100)}%</div>

                            {extraction.materials_used?.length > 0 && (
                                <div className="mt-2 text-[var(--color-text-muted)]">
                                    // Materials detected
                                    {extraction.materials_used.map((m, i) => (
                                        <div key={i} className="ml-4"><span className="text-amber-400">{m.quantity}</span>x {m.item}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Execution */}
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">3. Orchestrator Actions</p>
                        <div className="space-y-4">
                            {agent_result.steps.map((step, i) => (
                                <div key={i} className="relative pl-4 border-l border-[var(--color-border-accent)]">
                                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-[var(--color-background)] ${step.result?.success === false ? "bg-red-500" : step.result?.success === true ? "bg-emerald-500" : "bg-indigo-500"
                                        }`}></div>
                                    <p className="text-sm font-medium tracking-tight text-[var(--color-text)]">{step.action.replace(/_/g, " ")}</p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{step.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {result.agent_trace?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">4. State Mutations</p>
                            <div className="font-mono text-[10px] space-y-2">
                                {result.agent_trace.map((trace, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                                        <span className="text-[var(--color-text-muted)] uppercase tracking-widest mb-2 block">{trace.step}</span>
                                        {trace.before && trace.after && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-[var(--color-text-secondary)] opacity-50 line-through">{JSON.stringify(trace.before)}</div>
                                                <div className="text-emerald-400">{JSON.stringify(trace.after)}</div>
                                            </div>
                                        )}
                                        {trace.amount !== undefined && trace.amount !== null && (
                                            <div className="text-emerald-400 mt-1">+ ${trace.amount.toFixed(2)}</div>
                                        )}
                                        {trace.due_date && (
                                            <div className="text-amber-400 mt-1">Due: {trace.due_date}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {agent_result.summary && (
                <div className="mt-8 text-center">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 px-4 py-2 rounded-full border border-[#10b981]/20">
                        {agent_result.summary}
                    </span>
                </div>
            )}
        </div>
    );
}
