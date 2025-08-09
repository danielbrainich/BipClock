import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import CountdownTile from "../../components/CountdownTile";
import CreateCountdownModal from "../../components/CreateCountdownModal";

export default function WalletPage() {
    const router = useRouter();
    const { walletId } = router.query;

    const [wallet, setWallet] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [shareLink, setShareLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchWalletAndCountdowns = useCallback(async () => {
        if (!walletId) return;
        setLoading(true);
        setErrorMsg("");

        const { data: w, error: wErr } = await supabase
            .from("wallets")
            .select("id, wallet_id")
            .eq("wallet_id", walletId)
            .single();

        if (wErr || !w) {
            setWallet(null);
            setItems([]);
            setErrorMsg("Wallet not found.");
            setLoading(false);
            return;
        }

        setWallet(w);

        const { data: cds, error: cErr } = await supabase
            .from("countdowns")
            .select("*")
            .eq("wallet_id", w.id)
            .order("created_at", { ascending: false });

        if (cErr) {
            setErrorMsg("Failed to load countdowns.");
            setItems([]);
        } else {
            setItems(cds || []);
        }
        setLoading(false);
    }, [walletId]);

    useEffect(() => {
        if (!router.isReady) return;
        fetchWalletAndCountdowns();
    }, [router.isReady, fetchWalletAndCountdowns]);

    const handleCreated = (token) => {
        const origin =
            typeof window !== "undefined" ? window.location.origin : "";
        setShareLink(`${origin}/c/${token}`);
        fetchWalletAndCountdowns();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setShareLink(null);
        }, 1000);
    };

    return (
        <main className="relative min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Wallet: {walletId || "…"}
                </h1>
                {wallet && (
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setShowCreate(true)}
                    >
                        + New
                    </button>
                )}
            </div>

            {/* Status states */}
            {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading…</p>
            ) : errorMsg ? (
                <p className="text-red-500">{errorMsg}</p>
            ) : items.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                    No countdowns yet. Click “+ New” to create one.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {items.map((cd) => (
                        <CountdownTile
                            key={cd.id}
                            countdown={cd}
                            walletId={walletId}
                        />
                    ))}
                </div>
            )}

            {/* Share link toast */}
            {shareLink && (
                <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg p-4 flex items-center gap-4 z-50 max-w-md">
                    <div className="text-sm text-gray-800 dark:text-gray-200 break-all">
                        {shareLink}
                    </div>
                    <button
                        className={`px-3 py-1 text-sm rounded ${
                            copied
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        onClick={handleCopy}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            )}

            {/* Create modal */}
            {showCreate && wallet && (
                <CreateCountdownModal
                    walletRow={wallet}
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}
        </main>
    );
}
