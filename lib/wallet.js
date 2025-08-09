import { wordlist } from "./wordlist"; // your existing BIP-style wordlist

export function generateSlug(n = 3) {
    const pick = () => wordlist[Math.floor(Math.random() * wordlist.length)];
    return Array.from({ length: n }, pick).join("-");
}

export function generateMnemonic(n = 12) {
    const pick = () => wordlist[Math.floor(Math.random() * wordlist.length)];
    return Array.from({ length: n }, pick).join(" ");
}

export function randomOwnerToken(bytes = 32) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

// simple deterministic token from mnemonic (MVP; harden later with PBKDF2/HKDF)
export async function ownerTokenFromMnemonic(m) {
    const enc = new TextEncoder().encode(m.trim().toLowerCase());
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash), (b) =>
        b.toString(16).padStart(2, "0")
    ).join("");
}
