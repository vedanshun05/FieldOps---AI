"use client";
import { useState, useRef, useEffect } from "react";

export default function VoiceRecorder({ onResult, onError, onRecordingStateChange, onProcessingStateChange }) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                await submitAudio(blob);
            };

            mediaRecorder.start();
            setRecording(true);
            onRecordingStateChange?.(true);
            setDuration(0);
            timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
        } catch (err) {
            onError?.("Microphone access denied. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            onRecordingStateChange?.(false);
            clearInterval(timerRef.current);
        }
    };

    const submitAudio = async (blob) => {
        setProcessing(true);
        onProcessingStateChange?.(true);
        try {
            const { submitVoice } = await import("@/lib/api");
            const result = await submitVoice(blob);
            onResult?.(result);
        } catch (err) {
            onError?.(err.message || "Failed to process voice note");
        } finally {
            setProcessing(false);
            onProcessingStateChange?.(false);
            setDuration(0);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    if (processing) {
        return (
            <div className="py-12 flex flex-col items-center justify-center animate-fade-in">
                <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin opacity-50"></div>
                    <div className="absolute inset-2 border-4 border-indigo-500/30 border-b-transparent rounded-full animate-spin-slow"></div>
                    <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-medium tracking-wide">Processing Field Note...</h3>
                <p className="text-[var(--color-text-muted)] mt-2 text-sm uppercase tracking-widest">AI Extraction in Progress</p>
            </div>
        );
    }

    return (
        <div className="py-12 flex flex-col items-center justify-center transition-all duration-500">
            <button
                onClick={recording ? stopRecording : startRecording}
                className={`group relative w-28 h-28 rounded-full flex items-center justify-center outline-none transition-all duration-500 ${recording
                    ? "bg-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.4)] scale-110"
                    : "bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] hover:scale-105"
                    }`}
            >
                {recording && (
                    <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping"></div>
                )}

                {recording ? (
                    <div className="w-8 h-8 bg-red-500 rounded-sm animate-pulse"></div>
                ) : (
                    <svg className="w-10 h-10 text-[var(--color-primary)] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                )}
            </button>

            <div className="mt-8 h-8 flex items-center justify-center">
                {recording ? (
                    <span className="text-red-400 font-mono tracking-widest text-lg animate-pulse">
                        {formatTime(duration)}
                    </span>
                ) : (
                    <span className="text-[var(--color-text-muted)] uppercase tracking-widest text-xs font-medium">
                        Tap to Record Note
                    </span>
                )}
            </div>
        </div>
    );
}
