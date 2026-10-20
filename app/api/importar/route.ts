import { NextResponse } from "next/server";
import { importDemoWithAi, ImportError } from "@/lib/ai-import";
import { isAuthenticated } from "@/lib/auth";

// A IA lê páginas e pesquisa na web; pode levar mais de um minuto.
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { url?: unknown; notes?: unknown } | null;
  let url = typeof body?.url === "string" ? body.url.trim().slice(0, 500) : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 4000) : "";
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (url && !/^https?:\/\/[^\s]+$/i.test(url)) {
    return NextResponse.json({ error: "Informe um link válido." }, { status: 400 });
  }
  if (!url && !notes) {
    return NextResponse.json({ error: "Informe um link ou cole as informações." }, { status: 400 });
  }

  try {
    return NextResponse.json(await importDemoWithAi({ url, notes }));
  } catch (error) {
    if (error instanceof ImportError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error("[importar]", error);
    return NextResponse.json({ error: "Não foi possível importar com a IA." }, { status: 500 });
  }
}
