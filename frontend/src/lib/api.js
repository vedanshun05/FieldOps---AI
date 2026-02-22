const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function submitVoice(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const res = await fetch(`${API_BASE}/api/voice`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function getDashboardSummary() {
    const res = await fetch(`${API_BASE}/api/dashboard/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getJobs() {
    const res = await fetch(`${API_BASE}/api/dashboard/jobs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getInventory() {
    const res = await fetch(`${API_BASE}/api/dashboard/inventory`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getFollowups() {
    const res = await fetch(`${API_BASE}/api/dashboard/followups`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getAlerts() {
    const res = await fetch(`${API_BASE}/api/dashboard/alerts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
