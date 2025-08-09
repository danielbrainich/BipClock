import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
    generateSlug,
    generateMnemonic,
    randomOwnerToken,
} from "../lib/wallet";

export default function CreateWalletModal({ onClose }) {
    const [mnemonic, setMnemonic] = useState(generateMnemonic(12));
    const [busy, setBusy] = useState(false);

    async function handleCreate() {
        setBusy(true);
        try {
            const walletId = generateSlug(3);
            const owner_token = randomOwnerToken();
            const { data, error } = await supabase
                .from("wallets")
                .insert([{ wallet_id: walletId, owner_token }])
                .select("wallet_id")
                .single();
            if (error) throw error;
            // store locally (acts like "signed in")
            localStorage.setItem("owner_token", owner_token);
            localStorage.setItem("wallet_id", walletId);
            alert(`Save these words!\n\n${mnemonic}`);
            window.location.href = `/w/${walletId}`;
        } catch (e) {
            console.error(e);
            alert("Failed to create wallet");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl p-6">
                <h2 className="text-xl font-bold mb-3">Create Wallet</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Write down your recovery phrase. It lets you restore your
                    wallet on another device.
                </p>
                <textarea
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white mb-4"
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
                        onClick={handleCreate}
                        disabled={busy}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        {busy ? "Creating…" : "Create Wallet"}
                    </button>
                </div>
            </div>
        </div>
    );
}
