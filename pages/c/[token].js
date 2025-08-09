import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function CountdownPage() {
    const router = useRouter();
    const { token } = router.query;

    const [countdown, setCountdown] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState(null);

    const handleBack = () => {
        if (typeof document !== "undefined" && typeof window !== "undefined") {
            if (document.referrer) {
                try {
                    const ref = new URL(document.referrer);
                    if (ref.origin === window.location.origin) {
                        router.back();
                        return;
                    }
                } catch {}
            }
            const wid = localStorage.getItem("wallet_id");
            router.push(wid ? `/w/${wid}` : "/");
        } else {
            router.push("/");
        }
    };

    const updateTimeLeft = useCallback((target) => {
        const now = new Date();
        const targetTime = new Date(target);
        const diff = targetTime - now;

        if (Number.isNaN(targetTime.getTime())) {
            setTimeLeft("—");
            return;
        }
        if (diff <= 0) {
            setTimeLeft("🎉 It’s time!");
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, []);

    useEffect(() => {
        if (!router.isReady || !token) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("countdowns")
                .select("*")
                .eq("token", token)
                .single();

            if (!cancelled) {
                if (error || !data) {
                    console.error("Countdown not found:", error);
                    setNotFound(true);
                } else {
                    setCountdown(data);
                    updateTimeLeft(data.target_time);
                }
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [router.isReady, token, updateTimeLeft]);

    useEffect(() => {
        if (!countdown) return;
        const id = setInterval(
            () => updateTimeLeft(countdown.target_time),
            1000
        );
        return () => clearInterval(id);
    }, [countdown, updateTimeLeft]);

    if (notFound) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Countdown not found</h1>
                    <p className="mt-2 text-gray-500">
                        Make sure the link or passphrase is correct.
                    </p>
                    <button
                        onClick={handleBack}
                        className="mt-6 px-4 py-2 rounded border border-gray-300 dark:border-gray-700"
                    >
                        ← Back
                    </button>
                </div>
            </main>
        );
    }

    if (loading || !countdown || timeLeft === null) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white">
                <p>Loading…</p>
            </main>
        );
    }

    const targetLocal = new Date(countdown.target_time).toLocaleString();
    const repeats =
        countdown.repeat && countdown.repeat !== "none"
            ? countdown.repeat
            : null;
    const reminder =
        countdown.remind_at && countdown.remind_at !== "none"
            ? countdown.remind_at.replaceAll("_", " ")
            : null;

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 px-4 py-12">
            {/* Header with Back + Copy */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    ← Back
                </button>

                <button
                    onClick={() => {
                        const url = `${window.location.origin}/c/${countdown.token}`;
                        if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(url).then(() => {
                                setCopied(true);
                                setToast("Link copied!");
                                setTimeout(() => {
                                    setCopied(false);
                                    setToast(null);
                                }, 1200);
                            });
                        } else {
                            // Fallback
                            try {
                                const ta = document.createElement("textarea");
                                ta.value = url;
                                document.body.appendChild(ta);
                                ta.select();
                                document.execCommand("copy");
                                document.body.removeChild(ta);
                                setCopied(true);
                                setToast("Link copied!");
                                setTimeout(() => {
                                    setCopied(false);
                                    setToast(null);
                                }, 1200);
                            } catch {
                                setToast("Copy failed");
                                setTimeout(() => setToast(null), 1500);
                            }
                        }
                    }}
                    className={`px-3 py-1.5 rounded text-sm ${
                        copied
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    {copied ? "Copied!" : "Copy Link"}
                </button>
            </div>

            {/* Content */}
            <div className="max-w-lg w-full mx-auto text-center bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {countdown.title}
                </h1>

                {countdown.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {countdown.description}
                    </p>
                )}

                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {timeLeft}
                </div>

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        Target: {targetLocal}
                        {countdown.all_day ? " (all day)" : ""}
                    </p>
                    {repeats && <p>Repeats: {repeats}</p>}
                    {reminder && <p>Reminder: {reminder}</p>}
                </div>
            </div>
        </main>
    );
}
