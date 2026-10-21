"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  LogOut,
  Check,
  Copy,
  ExternalLink,
  FolderOpen,
  Loader2,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { DemoImportResult } from "@/lib/ai-import";
import {
  DEFAULT_DEMO_CONFIG,
  DEMO_CONFIG_MESSAGE,
  DEMO_READY_MESSAGE,
  DEMO_SEGMENTS,
  demoConfigFromSegment,
  encodeDemoConfig,
  sanitizeDemoConfig,
  WEEKDAYS,
  type DemoConfig,
  type DemoSegment,
} from "@/lib/demo-site";

const STORAGE_KEY = "demo-builder:saved";
const DRAFT_KEY = "demo-builder:draft";
const DRAFT_LINK_KEY = "demo-builder:draft-link";

type SavedDemo = { id: string; savedAt: string; config: DemoConfig; linkId?: string };

function readSaved(): SavedDemo[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.map((item) => ({
          id: String(item.id),
          savedAt: String(item.savedAt),
          config: sanitizeDemoConfig(item.config),
          ...(typeof item.linkId === "string" ? { linkId: item.linkId } : {}),
        }))
      : [];
  } catch {
    return [];
  }
}

function writeSaved(items: SavedDemo[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* Armazenamento indisponível (aba anônima, cota cheia). */
  }
}

function readDraft(): DemoConfig {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? sanitizeDemoConfig(JSON.parse(raw)) : DEFAULT_DEMO_CONFIG;
  } catch {
    return DEFAULT_DEMO_CONFIG;
  }
}

const segmentIds = Object.keys(DEMO_SEGMENTS) as DemoSegment[];

export function Builder() {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [saved, setSaved] = useState<SavedDemo[]>([]);
  const [origin, setOrigin] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  // Link curto (/s/...) desta demo; reenviar depois de editar atualiza o mesmo link.
  const [linkId, setLinkId] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const sendToPreview = useCallback((value: DemoConfig) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: DEMO_CONFIG_MESSAGE, config: value },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DEMO_READY_MESSAGE) sendToPreview(configRef.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendToPreview]);

  useEffect(() => {
    sendToPreview(config);
    if (!loaded) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(config));
      if (linkId) window.localStorage.setItem(DRAFT_LINK_KEY, linkId);
      else window.localStorage.removeItem(DRAFT_LINK_KEY);
    } catch {
      /* ignora */
    }
  }, [config, linkId, loaded, sendToPreview]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const set = <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));

  const longUrl = () => `${origin}/site?d=${encodeDemoConfig(config)}`;

  /** Gera (ou atualiza) o link curto. Sem banco configurado, usa o link longo. */
  const getShareUrl = async () => {
    setLinkLoading(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: linkId, config }),
      });
      if (response.status === 401) {
        window.location.href = "/login";
        return null;
      }
      const payload = (await response.json().catch(() => null)) as { id?: string } | null;
      if (!response.ok || !payload?.id) {
        if (response.status === 503) setNotice("Banco de links não configurado: usando link longo.");
        else setNotice("Não foi possível gerar o link curto: usando link longo.");
        return longUrl();
      }
      setLinkId(payload.id);
      if (currentId) {
        const next = saved.map((item) =>
          item.id === currentId ? { ...item, linkId: payload.id } : item,
        );
        setSaved(next);
        writeSaved(next);
      }
      return `${origin}/s/${payload.id}`;
    } catch {
      setNotice("Sem conexão para gerar o link curto: usando link longo.");
      return longUrl();
    } finally {
      setLinkLoading(false);
    }
  };

  const copyLink = async () => {
    const url = await getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link da demonstração:", url);
    }
  };

  // A aba é aberta antes de esperar o link, senão o navegador bloqueia o pop-up.
  const openWith = async (build: (url: string) => string) => {
    const tab = window.open("about:blank", "_blank");
    const url = await getShareUrl();
    if (!url) {
      tab?.close();
      return;
    }
    if (tab) tab.location.href = build(url);
    else window.location.href = build(url);
  };

  const openPreview = () => openWith((url) => url);

  const sendToClient = () =>
    openWith(
      (url) =>
        `https://wa.me/?text=${encodeURIComponent(
          `Olá! Preparei uma prévia de como pode ficar o site${config.businessName ? ` da ${config.businessName}` : ""}, com agendamento online: ${url}`,
        )}`,
    );

  // O rascunho e as demos salvas ficam no navegador; carregados depois da renderização inicial.
  useEffect(() => {
    setConfig(readDraft());
    try {
      setLinkId(window.localStorage.getItem(DRAFT_LINK_KEY));
    } catch {
      /* ignora */
    }
    setSaved(readSaved());
    setOrigin(window.location.origin);
    setLoaded(true);
  }, []);

  const [aiUrl, setAiUrl] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSummary, setAiSummary] = useState("");

  const runAiImport = async () => {
    const url = aiUrl.trim();
    if (!url && !aiNotes.trim()) {
      setAiError("Cole o link do site ou do Instagram, ou escreva as informações.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAiSummary("");
    try {
      const response = await fetch("/api/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, notes: aiNotes }),
      });
      const payload = (await response.json().catch(() => null)) as
        | (DemoImportResult & { error?: string })
        | null;
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok || !payload?.config) {
        throw new Error(payload?.error || "Não foi possível importar com a IA.");
      }
      const result = payload;
      setConfig(result.config);
      setCurrentId(null);
      setLinkId(null);
      setAiSummary(result.notes || "Site repaginado. Revise os dados abaixo.");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Não foi possível importar com a IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const applySegment = (segment: DemoSegment) => {
    setConfig((current) =>
      demoConfigFromSegment(segment, {
        businessName: current.businessName,
        city: current.city,
        address: current.address,
        phone: current.phone,
        whatsapp: current.whatsapp,
        instagram: current.instagram,
        email: current.email,
        logoUrl: current.logoUrl,
        heroImageUrl: current.heroImageUrl,
      }),
    );
  };

  const saveDemo = () => {
    const id = currentId ?? crypto.randomUUID();
    const entry: SavedDemo = {
      id,
      savedAt: new Date().toISOString(),
      config,
      ...(linkId ? { linkId } : {}),
    };
    const next = [entry, ...saved.filter((item) => item.id !== id)];
    setSaved(next);
    writeSaved(next);
    setCurrentId(id);
    setNotice("Demonstração salva neste navegador.");
  };

  const loadDemo = (item: SavedDemo) => {
    setConfig(item.config);
    setCurrentId(item.id);
    setLinkId(item.linkId ?? null);
    setNotice(`"${item.config.businessName || "Sem nome"}" carregada.`);
  };

  const deleteDemo = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    setSaved(next);
    writeSaved(next);
    if (currentId === id) setCurrentId(null);
  };

  const newDemo = () => {
    setConfig(demoConfigFromSegment(config.segment));
    setCurrentId(null);
    setLinkId(null);
  };

  return (
    <main className="demo-page flex min-h-screen flex-col bg-background text-foreground lg:h-screen">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-nav px-4 py-3 text-hero-foreground">
        <div className="flex items-center gap-3">
          <a
            href="/sair"
            className="grid size-9 place-items-center text-hero-muted hover:text-hero-foreground"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={18} />
          </a>
          <div>
            <h1 className="font-display text-base font-black uppercase leading-none">
              Gerador de sites demo
            </h1>
            <p className="mt-1 text-[11px] text-hero-muted">
              Preencha os dados do cliente e veja o site dele ao vivo
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={newDemo}
            className="border-white/25 text-hero-foreground"
          >
            <Plus size={14} aria-hidden="true" /> Nova
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={saveDemo}
            className="border-white/25 text-hero-foreground"
          >
            <Save size={14} aria-hidden="true" /> Salvar
          </Button>
          <Button size="sm" onClick={copyLink} disabled={linkLoading}>
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
            {copied ? "Copiado!" : "Copiar link"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 border-b border-border lg:hidden">
        {(["edit", "preview"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setMobileView(view)}
            className={`py-3 text-xs font-bold uppercase ${mobileView === view ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            {view === "edit" ? "Dados do cliente" : "Pré-visualização"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 overflow-y-auto border-r border-border bg-surface ${mobileView === "edit" ? "block" : "hidden"} lg:block`}
        >
          <div className="grid gap-1 p-4">
            {notice && (
              <p
                role="status"
                className="border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs font-semibold"
              >
                {notice}
              </p>
            )}

            <section className="mb-2 border border-primary/40 bg-primary/5 p-4">
              <p className="flex items-center gap-2 font-display text-sm font-bold uppercase">
                <Sparkles size={16} className="text-primary" aria-hidden="true" /> Repaginar com IA
              </p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Cole o link do site antigo ou do Instagram do cliente. O Claude lê a página, busca o
                negócio na internet e preenche tudo com um visual novo.
              </p>
              <div className="mt-3 grid gap-2">
                <input
                  value={aiUrl}
                  onChange={(e) => setAiUrl(e.target.value)}
                  placeholder="https://instagram.com/oficina ou site.com.br"
                  inputMode="url"
                  disabled={aiLoading}
                  className="h-10 border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <textarea
                  rows={2}
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  placeholder="Opcional: cole a bio, horários, serviços ou o que souber do cliente"
                  disabled={aiLoading}
                  className="border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
                <Button type="button" size="sm" onClick={runAiImport} disabled={aiLoading}>
                  {aiLoading ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles size={14} aria-hidden="true" />
                  )}
                  {aiLoading ? "Analisando... (até 1 min)" : "Gerar site com IA"}
                </Button>
                {aiError && (
                  <p role="alert" className="text-xs font-semibold text-destructive">
                    {aiError}
                  </p>
                )}
                {aiSummary && (
                  <p role="status" className="text-xs leading-5">
                    <Check size={13} className="mr-1 inline text-primary" aria-hidden="true" />
                    {aiSummary}
                  </p>
                )}
              </div>
            </section>

            {saved.length > 0 && (
              <Panel title="Demos salvas" defaultOpen={false}>
                <ul className="grid gap-2">
                  {saved.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center gap-2 border p-2 text-sm ${item.id === currentId ? "border-primary" : "border-border"}`}
                    >
                      <button
                        type="button"
                        onClick={() => loadDemo(item)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <FolderOpen
                          size={15}
                          className="shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <strong className="block truncate">
                            {item.config.businessName || "Sem nome"}
                          </strong>
                          <span className="block text-[11px] text-muted-foreground">
                            {DEMO_SEGMENTS[item.config.segment].label} ·{" "}
                            {new Date(item.savedAt).toLocaleDateString("pt-BR")}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDemo(item.id)}
                        className="grid size-8 place-items-center text-muted-foreground hover:text-destructive"
                        aria-label={`Excluir ${item.config.businessName || "demo"}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <Panel title="Tipo de negócio">
              <div className="grid grid-cols-2 gap-2">
                {segmentIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applySegment(id)}
                    className={`border px-3 py-2.5 text-left text-xs font-bold transition ${config.segment === id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}
                  >
                    {DEMO_SEGMENTS[id].label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] leading-4 text-muted-foreground">
                Trocar o tipo preenche serviços, textos e cores sugeridos. Os dados de contato são
                mantidos.
              </p>
            </Panel>

            <Panel title="Dados do negócio">
              <Input
                label="Nome do negócio"
                value={config.businessName}
                onChange={(v) => set("businessName", v)}
                placeholder="Ex.: Barbearia do João"
              />
              <Input
                label="Frase de destaque"
                value={config.tagline}
                onChange={(v) => set("tagline", v)}
              />
              <TextArea
                label="Descrição / sobre"
                value={config.description}
                onChange={(v) => set("description", v)}
              />
              <Input
                label="Cidade"
                value={config.city}
                onChange={(v) => set("city", v)}
                placeholder="Curitiba - PR"
              />
            </Panel>

            <Panel title="Contato">
              <Input
                label="WhatsApp (recebe os agendamentos)"
                value={config.whatsapp}
                onChange={(v) => set("whatsapp", v)}
                placeholder="(41) 99999-9999"
              />
              <Input
                label="Telefone"
                value={config.phone}
                onChange={(v) => set("phone", v)}
                placeholder="(41) 3333-3333"
              />
              <Input
                label="Endereço"
                value={config.address}
                onChange={(v) => set("address", v)}
                placeholder="Rua, número — bairro, cidade"
              />
              <Input
                label="Instagram (sem @)"
                value={config.instagram}
                onChange={(v) => set("instagram", v.replace(/^@/, ""))}
              />
              <Input label="E-mail" value={config.email} onChange={(v) => set("email", v)} />
            </Panel>

            <Panel title="Visual">
              <div className="grid grid-cols-2 gap-3">
                <ColorInput
                  label="Cor principal"
                  value={config.primaryColor}
                  onChange={(v) => set("primaryColor", v)}
                />
                <ColorInput
                  label="Cor de destaque"
                  value={config.accentColor}
                  onChange={(v) => set("accentColor", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["light", "dark"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => set("theme", theme)}
                    className={`border py-2.5 text-xs font-bold uppercase ${config.theme === theme ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                  >
                    {theme === "light" ? "Tema claro" : "Tema escuro"}
                  </button>
                ))}
              </div>
              <Input
                label="Link da logo (imagem)"
                value={config.logoUrl}
                onChange={(v) => set("logoUrl", v)}
                placeholder="https://..."
              />
              <Input
                label="Link da foto de capa"
                value={config.heroImageUrl}
                onChange={(v) => set("heroImageUrl", v)}
                placeholder="https://..."
              />
              <p className="text-[11px] leading-4 text-muted-foreground">
                Use links públicos de imagem (ex.: foto do Instagram ou Google). Sem imagem, o site
                usa um fundo nas cores escolhidas.
              </p>
            </Panel>

            <Panel title={`Serviços (${config.services.length})`}>
              {config.services.map((service, index) => (
                <div key={index} className="grid gap-2 border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <input
                      className="h-9 min-w-0 flex-1 border border-border bg-surface px-2 text-sm font-bold"
                      value={service.name}
                      placeholder="Nome do serviço"
                      onChange={(e) => updateService(index, { name: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "services",
                          config.services.filter((_, i) => i !== index),
                        )
                      }
                      className="grid size-9 place-items-center text-muted-foreground hover:text-destructive"
                      aria-label="Remover serviço"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <input
                    className="h-9 border border-border bg-surface px-2 text-xs"
                    value={service.description}
                    placeholder="Descrição curta"
                    onChange={(e) => updateService(index, { description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="h-9 border border-border bg-surface px-2 text-xs"
                      value={service.price}
                      placeholder="Preço (ex.: R$ 50)"
                      onChange={(e) => updateService(index, { price: e.target.value })}
                    />
                    <label className="flex items-center gap-1 border border-border bg-surface px-2 text-xs">
                      <input
                        type="number"
                        min={5}
                        step={5}
                        className="h-9 w-full min-w-0 bg-transparent"
                        value={service.duration}
                        onChange={(e) =>
                          updateService(index, { duration: Number(e.target.value) || 0 })
                        }
                      />
                      min
                    </label>
                  </div>
                </div>
              ))}
              {config.services.length < 12 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    set("services", [
                      ...config.services,
                      { name: "", description: "", duration: 30, price: "" },
                    ])
                  }
                >
                  <Plus size={14} aria-hidden="true" /> Adicionar serviço
                </Button>
              )}
            </Panel>

            <Panel title="Agenda">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase">Dias de atendimento</p>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((label, day) => {
                    const active = config.openDays.includes(day);
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          set(
                            "openDays",
                            active
                              ? config.openDays.filter((d) => d !== day)
                              : [...config.openDays, day].sort(),
                          )
                        }
                        className={`border py-2 text-[11px] font-bold ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="time"
                  label="Abre às"
                  value={config.openTime}
                  onChange={(v) => set("openTime", v)}
                />
                <Input
                  type="time"
                  label="Fecha às"
                  value={config.closeTime}
                  onChange={(v) => set("closeTime", v)}
                />
                <Input
                  type="time"
                  label="Intervalo de"
                  value={config.lunchStart}
                  onChange={(v) => set("lunchStart", v)}
                />
                <Input
                  type="time"
                  label="Intervalo até"
                  value={config.lunchEnd}
                  onChange={(v) => set("lunchEnd", v)}
                />
              </div>
              <label className="grid gap-1.5 text-[11px] font-bold uppercase">
                Horários a cada
                <select
                  className="h-10 border border-border bg-background px-2 text-sm font-medium normal-case"
                  value={config.slotMinutes}
                  onChange={(e) => set("slotMinutes", Number(e.target.value))}
                >
                  {[15, 20, 30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} minutos
                    </option>
                  ))}
                </select>
              </label>
            </Panel>

            <Panel title="Destaques" defaultOpen={false}>
              {config.highlights.map((item, index) => (
                <ListRow
                  key={index}
                  value={item}
                  onChange={(v) =>
                    set(
                      "highlights",
                      config.highlights.map((h, i) => (i === index ? v : h)),
                    )
                  }
                  onRemove={() =>
                    set(
                      "highlights",
                      config.highlights.filter((_, i) => i !== index),
                    )
                  }
                />
              ))}
              {config.highlights.length < 6 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => set("highlights", [...config.highlights, ""])}
                >
                  <Plus size={14} aria-hidden="true" /> Adicionar destaque
                </Button>
              )}
            </Panel>

            <Panel title="Depoimentos" defaultOpen={false}>
              {config.testimonials.map((item, index) => (
                <div key={index} className="grid gap-2 border border-border bg-background p-3">
                  <ListRow
                    value={item.name}
                    placeholder="Nome do cliente"
                    onChange={(v) =>
                      set(
                        "testimonials",
                        config.testimonials.map((t, i) => (i === index ? { ...t, name: v } : t)),
                      )
                    }
                    onRemove={() =>
                      set(
                        "testimonials",
                        config.testimonials.filter((_, i) => i !== index),
                      )
                    }
                  />
                  <textarea
                    rows={2}
                    className="border border-border bg-surface px-2 py-1.5 text-xs"
                    value={item.text}
                    placeholder="O que o cliente disse"
                    onChange={(e) =>
                      set(
                        "testimonials",
                        config.testimonials.map((t, i) =>
                          i === index ? { ...t, text: e.target.value } : t,
                        ),
                      )
                    }
                  />
                </div>
              ))}
              {config.testimonials.length < 6 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    set("testimonials", [...config.testimonials, { name: "", text: "" }])
                  }
                >
                  <Plus size={14} aria-hidden="true" /> Adicionar depoimento
                </Button>
              )}
            </Panel>
          </div>
        </aside>

        <section
          className={`min-h-0 flex-col bg-muted ${mobileView === "preview" ? "flex" : "hidden"} lg:flex`}
          aria-label="Pré-visualização"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2">
            <div
              className="hidden items-center gap-1 sm:flex"
              role="group"
              aria-label="Dispositivo"
            >
              {(
                [
                  ["desktop", Monitor, "Computador"],
                  ["mobile", Smartphone, "Celular"],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={device === id}
                  onClick={() => setDevice(id)}
                  className={`flex h-9 items-center gap-1.5 px-3 text-xs font-bold uppercase ${device === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon size={15} aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openPreview}
                disabled={linkLoading}
                className="flex h-9 items-center gap-1.5 px-3 text-xs font-bold uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ExternalLink size={15} aria-hidden="true" /> Abrir
              </button>
              <button
                type="button"
                onClick={sendToClient}
                disabled={linkLoading}
                className="flex h-9 items-center gap-1.5 bg-contact px-3 text-xs font-bold uppercase text-contact-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Send size={14} aria-hidden="true" /> Enviar ao cliente
              </button>
            </div>
          </div>
          <div className="flex min-h-[70vh] flex-1 justify-center overflow-auto p-0 sm:p-4 lg:min-h-0">
            <iframe
              ref={iframeRef}
              title="Pré-visualização do site do cliente"
              src="/site?embed=1"
              className={`h-[80vh] border-0 bg-white shadow-panel transition-[width] duration-300 lg:h-full ${device === "mobile" ? "w-full sm:w-[390px] sm:rounded-[1.5rem] sm:border-[10px] sm:border-neutral-900" : "w-full"}`}
            />
          </div>
        </section>
      </div>
    </main>
  );

  function updateService(index: number, patch: Partial<DemoConfig["services"][number]>) {
    setConfig((current) => ({
      ...current,
      services: current.services.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }
}

function Panel({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-border py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-display text-sm font-bold uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <span
          className="text-muted-foreground transition-transform group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <div className="grid gap-3 pb-3 pt-1">{children}</div>
    </details>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-bold uppercase">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border border-border bg-background px-3 text-sm font-medium normal-case outline-none focus:border-primary"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-bold uppercase">
      {label}
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border bg-background px-3 py-2 text-sm font-medium normal-case outline-none focus:border-primary"
      />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-bold uppercase">
      {label}
      <span className="flex h-10 items-center gap-2 border border-border bg-background px-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-7 cursor-pointer border-0 bg-transparent p-0"
        />
        <span className="font-mono text-xs font-medium normal-case">{value}</span>
      </span>
    </label>
  );
}

function ListRow({
  value,
  onChange,
  onRemove,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        className="h-9 min-w-0 flex-1 border border-border bg-surface px-2 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={onRemove}
        className="grid size-9 place-items-center text-muted-foreground hover:text-destructive"
        aria-label="Remover"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
