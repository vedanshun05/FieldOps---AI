import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export default function AlertBanner({ alerts }) {
    if (!alerts || alerts.length === 0) return null;

    const severityStyles = {
        critical: "border-red-500/30 bg-red-500/5 text-red-400",
        warning: "border-amber-500/30 bg-amber-500/5 text-amber-400",
        info: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    };

    const severityIcons = {
        critical: <AlertCircle size={18} />,
        warning: <AlertTriangle size={18} />,
        info: <Info size={18} />,
    };

    return (
        <div className="space-y-2">
            {alerts.map((alert, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${severityStyles[alert.severity] || severityStyles.info}`}
                >
                    <span className="flex items-center justify-center opacity-80">{severityIcons[alert.severity] || <Info size={18} />}</span>
                    <span className="text-sm font-medium">{alert.message}</span>
                </div>
            ))}
        </div>
    );
}
