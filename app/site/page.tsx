import type { Metadata } from "next";
import { SitePreview } from "@/components/SitePreview";
import { decodeDemoConfig } from "@/lib/demo-site";

type Props = { searchParams: Promise<{ d?: string; embed?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const config = decodeDemoConfig((await searchParams).d);
  const name = config?.businessName || "Site demonstrativo";
  const description = config?.tagline || "Pré-visualização do seu novo site com agendamento.";
  return {
    title: `${name} — Pré-visualização`,
    description,
    openGraph: { title: `${name} — Pré-visualização do site`, description },
  };
}

export default async function SitePage({ searchParams }: Props) {
  const { d, embed } = await searchParams;
  return <SitePreview initial={decodeDemoConfig(d)} embed={embed === "1"} />;
}
