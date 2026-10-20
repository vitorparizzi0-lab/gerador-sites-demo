import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  checkPassword,
  isAuthenticated,
  newSessionValue,
  passwordConfigured,
  SESSION_COOKIE,
} from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const attempt = String(formData.get("password") ?? "");
  if (!checkPassword(attempt)) {
    // Atraso curto para dificultar tentativas em sequência.
    await new Promise((resolve) => setTimeout(resolve, 800));
    redirect("/login?erro=1");
  }
  (await cookies()).set(SESSION_COOKIE, newSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (await isAuthenticated()) redirect("/");
  const { erro } = await searchParams;
  const configured = passwordConfigured();

  return (
    <main className="grid min-h-screen place-items-center bg-nav px-5 text-hero-foreground">
      <form action={login} className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-black uppercase">Gerador de sites demo</h1>
        <p className="mt-2 text-sm text-hero-muted">Digite a senha para acessar o painel.</p>
        {!configured && (
          <p className="mt-4 border-l-2 border-destructive bg-white/5 px-3 py-2 text-xs">
            A senha ainda não foi configurada. Defina a variável DEMO_PASSWORD na Vercel.
          </p>
        )}
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Senha"
          className="mt-6 h-12 w-full border border-white/20 bg-white/5 px-4 text-sm outline-none focus:border-primary"
        />
        {erro && <p className="mt-2 text-xs font-semibold text-red-400">Senha incorreta.</p>}
        <button
          type="submit"
          className="mt-4 h-12 w-full bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
