import { sanitizeDemoConfig, type DemoConfig } from "@/lib/demo-site";

// Banco Upstash Redis (Vercel → Storage → Upstash for Redis), acessado pela API REST.
// A integração da Vercel cria KV_REST_API_*; uma conta Upstash direta usa UPSTASH_REDIS_REST_*.
function credentials() {
  const url = process.env["KV_REST_API_URL"] || process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["KV_REST_API_TOKEN"] || process.env["UPSTASH_REDIS_REST_TOKEN"];
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function storeConfigured() {
  return credentials() !== null;
}

async function command<T>(args: Array<string | number>): Promise<T | null> {
  const creds = credentials();
  if (!creds) throw new Error("Banco de links não configurado.");
  const response = await fetch(creds.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as { result?: T; error?: string } | null;
  if (!response.ok || payload?.error) throw new Error(payload?.error || `Upstash ${response.status}`);
  return payload?.result ?? null;
}

const key = (id: string) => `demo:${id}`;

export const isValidLinkId = (id: string) => /^[a-z0-9-]{4,60}$/.test(id);

/** "Auto Center Silva" → "auto-center-silva-k3x9" */
export function newLinkId(businessName: string) {
  const slug = businessName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  const random = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) =>
    "abcdefghjkmnpqrstuvwxyz23456789".charAt(b % 31),
  ).join("");
  return slug ? `${slug}-${random}` : `demo-${random}`;
}

export async function saveDemoLink(id: string, config: DemoConfig) {
  await command(["SET", key(id), JSON.stringify(config)]);
}

export async function demoLinkExists(id: string) {
  return (await command<number>(["EXISTS", key(id)])) === 1;
}

export async function loadDemoLink(id: string): Promise<DemoConfig | null> {
  if (!isValidLinkId(id) || !storeConfigured()) return null;
  try {
    const raw = await command<string>(["GET", key(id)]);
    return raw ? sanitizeDemoConfig(JSON.parse(raw)) : null;
  } catch (error) {
    console.error("[links]", error);
    return null;
  }
}
