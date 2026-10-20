import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "demo_session";

function sessionToken(password: string) {
  return createHmac("sha256", password).update("gerador-sites-demo:sessao").digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordConfigured() {
  return Boolean(process.env["DEMO_PASSWORD"]);
}

export function checkPassword(attempt: string) {
  const password = process.env["DEMO_PASSWORD"];
  return Boolean(password) && safeEqual(attempt, password!);
}

export function newSessionValue() {
  return sessionToken(process.env["DEMO_PASSWORD"]!);
}

/** True quando o navegador tem o cookie da senha atual (trocar a senha desloga todo mundo). */
export async function isAuthenticated() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const password = process.env["DEMO_PASSWORD"];
  if (!password) return false;
  return safeEqual(value, sessionToken(password));
}
