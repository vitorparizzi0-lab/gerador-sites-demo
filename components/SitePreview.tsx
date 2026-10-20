"use client";

import { useEffect, useState } from "react";
import { DemoSite } from "@/components/DemoSite";
import {
  DEMO_CONFIG_MESSAGE,
  DEMO_READY_MESSAGE,
  sanitizeDemoConfig,
  type DemoConfig,
} from "@/lib/demo-site";

export function SitePreview({ initial, embed }: { initial: DemoConfig | null; embed: boolean }) {
  const [config, setConfig] = useState<DemoConfig | null>(initial);

  // No painel, a pré-visualização recebe os dados ao vivo do formulário.
  useEffect(() => {
    if (!embed || window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DEMO_CONFIG_MESSAGE) setConfig(sanitizeDemoConfig(event.data.config));
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: DEMO_READY_MESSAGE }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [embed]);

  if (!config) {
    if (embed) return null;
    return (
      <main className="grid min-h-screen place-items-center bg-nav px-5 text-center text-hero-foreground">
        <div>
          <h1 className="font-display text-2xl font-black uppercase">Link de demonstração inválido</h1>
          <p className="mt-3 text-sm text-hero-muted">
            Este link está incompleto. Peça um novo link de pré-visualização.
          </p>
        </div>
      </main>
    );
  }

  return <DemoSite config={config} />;
}
