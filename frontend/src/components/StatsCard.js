export default function StatsCard({ title, value, subtitle, icon, variant = "primary" }) {
    const textAccent = {
        primary: "text-indigo-400",
        success: "text-emerald-400",
        warning: "text-amber-400",
        danger: "text-red-400",
    }[variant];

    return (
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-accent)] transition-colors flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{title}</p>
                {icon && <span className={`text-lg opacity-80 ${textAccent}`}>{icon}</span>}
            </div>
            <div>
                <p className="text-3xl font-light tracking-tight">{value}</p>
                {subtitle && <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
}
