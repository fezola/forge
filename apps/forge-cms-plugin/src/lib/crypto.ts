interface EncryptedData {
  iv: number[];
  data: number[];
  salt: string;
}

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const ITERATIONS = 100000;

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function getSessionSalt(): string {
  let salt = sessionStorage.getItem("forge_crypto_salt");
  if (!salt) {
    salt = bufToHex(crypto.getRandomValues(new Uint8Array(16)));
    sessionStorage.setItem("forge_crypto_salt", salt);
  }
  return salt;
}

function getSessionPassphrase(): string {
  let phrase = sessionStorage.getItem("forge_crypto_passphrase");
  if (!phrase) {
    phrase = `forge_session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("forge_crypto_passphrase", phrase);
  }
  return phrase;
}

async function deriveKey(passphrase: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(plaintext: string): Promise<string> {
  const salt = getSessionSalt();
  const passphrase = getSessionPassphrase();
  const key = await deriveKey(passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  const result: EncryptedData = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
    salt,
  };

  return btoa(JSON.stringify(result));
}

export async function decrypt(encryptedStr: string): Promise<string> {
  try {
    const parsed: EncryptedData = JSON.parse(atob(encryptedStr));
    const passphrase = getSessionPassphrase();
    const key = await deriveKey(passphrase, parsed.salt);
    const iv = new Uint8Array(parsed.iv);
    const data = new Uint8Array(parsed.data);

    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error("Decryption failed");
  }
}

export async function encryptWithPassphrase(plaintext: string, passphrase: string): Promise<string> {
  const salt = bufToHex(crypto.getRandomValues(new Uint8Array(16)));
  const key = await deriveKey(passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  const result: EncryptedData = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
    salt,
  };

  return btoa(JSON.stringify(result));
}

export async function decryptWithPassphrase(encryptedStr: string, passphrase: string): Promise<string> {
  try {
    const parsed: EncryptedData = JSON.parse(atob(encryptedStr));
    const key = await deriveKey(passphrase, parsed.salt);
    const iv = new Uint8Array(parsed.iv);
    const data = new Uint8Array(parsed.data);

    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error("Decryption failed - wrong passphrase or corrupted data");
  }
}

export function isEncrypted(value: string): boolean {
  try {
    const parsed = JSON.parse(atob(value));
    return !!(parsed.iv && parsed.data && parsed.salt);
  } catch {
    return false;
  }
}
