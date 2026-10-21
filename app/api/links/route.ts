import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { sanitizeDemoConfig } from "@/lib/demo-site";
import {
  demoLinkExists,
  isValidLinkId,
  newLinkId,
  saveDemoLink,
  storeConfigured,
} from "@/lib/store";

/** Cria um link curto para a demo ou atualiza o link que o painel já tinha gerado. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }
  if (!storeConfigured()) {
    return NextResponse.json({ error: "Banco de links não configurado." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown; config?: unknown } | null;
  if (!body?.config) return NextResponse.json({ error: "Dados ausentes." }, { status: 400 });
  const config = sanitizeDemoConfig(body.config);

  try {
    let id = typeof body.id === "string" && isValidLinkId(body.id) ? body.id : "";
    // Só reaproveita um link que já existe; senão cria outro.
    if (!id || !(await demoLinkExists(id))) id = newLinkId(config.businessName);
    await saveDemoLink(id, config);
    return NextResponse.json({ id });
  } catch (error) {
    console.error("[links]", error);
    return NextResponse.json({ error: "Não foi possível gerar o link." }, { status: 502 });
  }
}
