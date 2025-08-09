import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ownerTokenFromMnemonic } from "../lib/wallet";

export default function ImportWalletModal({ onClose }) {
    const [walletId, setWalletId] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleImport() {
        setBusy(true);
        try {
            const owner_token = await ownerTokenFromMnemonic(mnemonic);
            const { data, error } = await supabase
                .from("wallets")
                .select("wallet_id")
                .eq("wallet_id", walletId)
                .single();
            if (error || !data) throw new Error("Wallet not found");
            localStorage.setItem("owner_token", owner_token);
            localStorage.setItem("wallet_id", walletId);
            window.location.href = `/w/${walletId}`;
        } catch (e) {
            console.error(e);
            alert("Failed to import wallet");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl p-6">
                <h2 className="text-xl font-bold mb-3">Import Wallet</h2>
                <input
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white mb-3"
                    placeholder="Wallet ID (e.g. glacier-owl-echo)"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                />
                <textarea
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white mb-4"
                    placeholder="Recovery phrase"
                    rows={3}
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-3 py-2 rounded border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={busy}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        {busy ? "Importing…" : "Import"}
                    </button>
                </div>
            </div>
        </div>
    );
}
