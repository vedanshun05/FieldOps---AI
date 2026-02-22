"use client";
import { useState, useEffect } from "react";
import { PackageOpen, Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getInventory } from "@/lib/api";

export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getInventory();
                setItems(data);
            } catch (err) {
                console.error("Failed to load inventory:", err);
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
                <h2 className="text-2xl font-bold">Inventory</h2>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">Material stock levels — auto-updated from job reports</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Loading inventory...
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <PackageOpen size={48} className="mx-auto text-[var(--color-border-accent)] mb-4 opacity-50" />
                    <p className="text-lg font-medium">No inventory items</p>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Items are created automatically when materials are used in jobs</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Item</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Quantity</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Unit</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Unit Cost</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Package size={16} /></div>
                                            <span className="font-medium capitalize">{item.item_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-lg font-bold ${item.is_low_stock ? "text-[var(--color-danger)]" : ""}`}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[var(--color-text-secondary)]">{item.unit}</td>
                                    <td className="p-4 text-[var(--color-text-secondary)]">${item.unit_cost.toFixed(2)}</td>
                                    <td className="p-4">
                                        {item.is_low_stock ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400">
                                                <AlertTriangle size={14} /> Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                                <CheckCircle2 size={14} /> In Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
