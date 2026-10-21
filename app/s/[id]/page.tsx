import type { Metadata } from "next";
import { SitePreview } from "@/components/SitePreview";
import { cache } from "react";
import { loadDemoLink as load } from "@/lib/store";

// Metadados e página usam a mesma leitura do banco.
const loadDemoLink = cache(load);

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = await loadDemoLink((await params).id);
  const name = config?.businessName || "Site demonstrativo";
  const description = config?.tagline || "Pré-visualização do seu novo site com agendamento.";
  return {
    title: `${name} — Pré-visualização`,
    description,
    openGraph: { title: `${name} — Pré-visualização do site`, description },
  };
}

export default async function ShortLinkPage({ params }: Props) {
  const config = await loadDemoLink((await params).id);
  return <SitePreview initial={config} embed={false} />;
}
