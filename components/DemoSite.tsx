"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Dumbbell,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PawPrint,
  Phone,
  Quote,
  Scissors,
  Sparkles,
  Star,
  Stethoscope,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  buildDemoSchedule,
  DEMO_SEGMENTS,
  readableTextColor,
  WEEKDAYS,
  whatsappDigits,
  type DemoConfig,
  type DemoSegment,
  type DemoService,
} from "@/lib/demo-site";

const segmentIcons: Record<DemoSegment, LucideIcon> = {
  oficina: Wrench,
  barbearia: Scissors,
  salao: Sparkles,
  clinica: Stethoscope,
  estetica: Sparkles,
  petshop: PawPrint,
  academia: Dumbbell,
};

const palettes = {
  light: { bg: "#ffffff", surface: "#f5f5f6", fg: "#141416", muted: "#5f6168", border: "#e4e4e7" },
  dark: { bg: "#0e0e10", surface: "#18181b", fg: "#f4f4f5", muted: "#a1a1aa", border: "#2a2a2f" },
};

const formatDuration = (minutes: number) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;

const formatDay = (date: string): [string, string] => {
  const d = new Date(`${date}T12:00:00`);
  return [
    d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  ];
};

const formatDayLong = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

function openingHoursText(config: DemoConfig) {
  if (config.openDays.length === 0) return "Horários a combinar";
  const days = [...config.openDays].sort();
  const contiguous = days.every((day, i) => i === 0 || day === (days[i - 1] ?? 0) + 1);
  const dayText =
    contiguous && days.length > 2
      ? `${WEEKDAYS[days[0] ?? 0]} a ${WEEKDAYS[days[days.length - 1] ?? 0]}`
      : days.map((d) => WEEKDAYS[d]).join(", ");
  return `${dayText} · ${config.openTime} às ${config.closeTime}`;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type BookingState = {
  service: DemoService | null;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
};
const emptyBooking: BookingState = {
  service: null,
  date: "",
  time: "",
  name: "",
  phone: "",
  notes: "",
};

export function DemoSite({ config }: { config: DemoConfig }) {
  const preset = DEMO_SEGMENTS[config.segment];
  const SegmentIcon = segmentIcons[config.segment];
  const name = config.businessName.trim() || "Nome do seu negócio";
  const services = config.services.filter((s) => s.name.trim());
  const highlights = config.highlights.filter((h) => h.trim());
  const testimonials = config.testimonials.filter((t) => t.name.trim() && t.text.trim());
  const whatsapp = whatsappDigits(config.whatsapp || config.phone);
  const palette = palettes[config.theme];

  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [booking, setBooking] = useState<BookingState>(emptyBooking);
  const [taken, setTaken] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const schedule = useMemo(() => buildDemoSchedule(config), [config]);
  const selectedDay = schedule.find((day) => day.date === booking.date);

  const style = {
    "--d-primary": config.primaryColor,
    "--d-primary-fg": readableTextColor(config.primaryColor),
    "--d-accent": config.accentColor,
    "--d-bg": palette.bg,
    "--d-surface": palette.surface,
    "--d-fg": palette.fg,
    "--d-muted": palette.muted,
    "--d-border": palette.border,
  } as CSSProperties;

  const nav: Array<[string, string]> = [
    ["Início", "inicio"],
    ["Serviços", "servicos"],
    ["Sobre", "sobre"],
    ["Agendar", "agendar"],
    ["Contato", "contato"],
  ];

  const startBooking = (service?: DemoService) => {
    setMenuOpen(false);
    if (service) {
      setBooking((current) => ({ ...current, service }));
      setStep(2);
    }
    scrollToId("agendar");
  };

  const phoneDigits = booking.phone.replace(/\D/g, "");
  const detailsValid = booking.name.trim().length >= 2 && phoneDigits.length >= 10;

  const summary = booking.service
    ? [
        `Olá, ${name}! Gostaria de confirmar meu agendamento:`,
        `• Serviço: ${booking.service.name}`,
        `• Data: ${booking.date ? formatDayLong(booking.date) : ""} às ${booking.time}`,
        `• Nome: ${booking.name}`,
        `• Telefone: ${booking.phone}`,
        booking.notes.trim() ? `• Observações: ${booking.notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const confirm = () => {
    if (!detailsValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setTaken((current) => [...current, `${booking.date} ${booking.time}`]);
    setStep(4);
    scrollToId("agendar");
  };

  const resetBooking = () => {
    setBooking(emptyBooking);
    setStep(1);
  };

  const Logo = ({ size = 44 }: { size?: number }) =>
    config.logoUrl ? (
      <img
        src={config.logoUrl}
        alt=""
        style={{ height: size, width: "auto", maxWidth: size * 2.5 }}
        className="object-contain"
      />
    ) : (
      <span
        className="grid shrink-0 place-items-center rounded-full bg-[var(--d-primary)] text-[var(--d-primary-fg)]"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <SegmentIcon size={size * 0.48} />
      </span>
    );

  return (
    <div
      style={style}
      className="demo-page min-h-screen bg-[var(--d-bg)] font-sans text-[var(--d-fg)] [&_::selection]:bg-[var(--d-primary)] [&_::selection]:text-[var(--d-primary-fg)]"
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0d]/90 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <button
            type="button"
            onClick={() => scrollToId("inicio")}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <Logo />
            <span className="min-w-0">
              <strong className="block truncate font-display text-base leading-tight sm:text-lg">
                {name}
              </strong>
              <span className="block truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                {preset.label}
                {config.city ? ` · ${config.city}` : ""}
              </span>
            </span>
          </button>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação">
            {nav
              .filter(([, id]) => id !== "agendar")
              .map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToId(id)}
                  className="text-xs font-bold uppercase tracking-wider text-white/70 transition hover:text-white"
                >
                  {label}
                </button>
              ))}
          </nav>
          <div className="flex items-center gap-2">
            <DemoButton onClick={() => startBooking()} className="hidden sm:inline-flex">
              <CalendarDays size={15} aria-hidden="true" /> Agendar
            </DemoButton>
            <button
              type="button"
              className="grid size-11 place-items-center lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-white/10 px-4 py-2 lg:hidden" aria-label="Menu">
            {nav.map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  scrollToId(id);
                }}
                className="block w-full border-b border-white/10 py-4 text-left text-sm font-bold uppercase last:border-0"
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <section
        id="inicio"
        className="relative isolate overflow-hidden bg-[#0b0b0d] text-white"
        style={{
          backgroundImage: config.heroImageUrl
            ? undefined
            : `radial-gradient(circle at 85% 15%, ${config.primaryColor}66, transparent 45%), radial-gradient(circle at 5% 95%, ${config.accentColor}33, transparent 40%)`,
        }}
      >
        {config.heroImageUrl && (
          <>
            <img
              src={config.heroImageUrl}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
          </>
        )}
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:py-32">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--d-accent)]">
              <span className="h-px w-8 bg-[var(--d-accent)]" aria-hidden="true" />
              {preset.label}
              {config.city ? ` · ${config.city}` : ""}
            </p>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.02] sm:text-6xl">
              {config.tagline || name}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              {config.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <DemoButton size="lg" onClick={() => startBooking()}>
                <CalendarDays size={18} aria-hidden="true" /> {preset.bookingLabel}
              </DemoButton>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-white/25 px-7 text-xs font-bold uppercase tracking-wider transition hover:border-white"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Falar no WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-6 backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--d-accent)]">
              <Clock3 size={15} aria-hidden="true" /> Horário de atendimento
            </p>
            <p className="mt-2 font-display text-lg font-bold">{openingHoursText(config)}</p>
            {config.lunchStart && config.lunchEnd && (
              <p className="mt-1 text-sm text-white/60">
                Intervalo das {config.lunchStart} às {config.lunchEnd}
              </p>
            )}
            <div className="mt-5 flex items-center gap-1 text-[var(--d-accent)]" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="mt-1 text-sm text-white/70">Clientes satisfeitos recomendam</p>
          </div>
        </div>
      </section>

      {highlights.length > 0 && (
        <section className="border-b border-[var(--d-border)] bg-[var(--d-surface)]">
          <div className="mx-auto grid max-w-6xl gap-px px-4 sm:grid-cols-3 sm:px-6">
            {highlights.slice(0, 3).map((item, index) => (
              <p key={index} className="flex items-center gap-3 py-5 text-sm font-bold sm:py-7">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--d-primary)] text-[var(--d-primary-fg)]">
                  <Check size={16} aria-hidden="true" />
                </span>
                {item}
              </p>
            ))}
          </div>
        </section>
      )}

      <section id="servicos" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Heading eyebrow="Serviços" title="O que fazemos por você" />
          {services.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--d-muted)]">Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <article
                  key={index}
                  className="group flex flex-col rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-6 transition hover:border-[var(--d-primary)]"
                >
                  <span className="grid size-11 place-items-center rounded-lg bg-[var(--d-primary)]/15 text-[var(--d-primary)]">
                    <SegmentIcon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 flex-1 text-sm leading-6 text-[var(--d-muted)]">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--d-border)] pt-4 text-sm">
                    <span className="flex items-center gap-1.5 text-[var(--d-muted)]">
                      <Clock3 size={14} aria-hidden="true" /> {formatDuration(service.duration)}
                    </span>
                    {service.price && <strong>{service.price}</strong>}
                  </div>
                  <button
                    type="button"
                    onClick={() => startBooking(service)}
                    className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--d-primary)]"
                  >
                    Agendar este serviço
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id="sobre"
        className="scroll-mt-20 border-y border-[var(--d-border)] bg-[var(--d-surface)] py-16 sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <Heading eyebrow="Sobre nós" title={name} />
            <p className="mt-5 text-base leading-7 text-[var(--d-muted)]">{config.description}</p>
            {highlights.length > 0 && (
              <ul className="mt-6 grid gap-3">
                {highlights.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-[var(--d-primary)]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              [String(services.length || "—"), "Serviços"],
              ["5,0", "Avaliação"],
              [config.openDays.length ? `${config.openDays.length}x` : "—", "Dias por semana"],
              ["Online", "Agendamento"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--d-border)] bg-[var(--d-bg)] p-6"
              >
                <p className="font-display text-3xl font-black text-[var(--d-primary)]">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--d-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agendar" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Heading eyebrow="Agendamento online" title={preset.bookingLabel} center />
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-[var(--d-muted)]">
            Escolha o serviço, o dia e o horário. Leva menos de um minuto.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--d-border)] bg-[var(--d-surface)] shadow-xl shadow-black/5">
            {step < 4 && (
              <ol className="grid grid-cols-3 border-b border-[var(--d-border)] text-center text-[0.65rem] font-bold uppercase tracking-wider sm:text-xs">
                {["Serviço", "Data e horário", "Seus dados"].map((label, index) => {
                  const n = index + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <li
                      key={label}
                      className={`flex items-center justify-center gap-2 px-2 py-4 ${active ? "text-[var(--d-primary)]" : done ? "" : "text-[var(--d-muted)]"}`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full text-[0.65rem] ${done || active ? "bg-[var(--d-primary)] text-[var(--d-primary-fg)]" : "border border-[var(--d-border)]"}`}
                      >
                        {done ? <Check size={13} aria-hidden="true" /> : n}
                      </span>
                      <span className="hidden sm:inline">{label}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="p-5 sm:p-8">
              {step === 1 && (
                <div className="grid gap-3">
                  {services.length === 0 && (
                    <p className="text-sm text-[var(--d-muted)]">Cadastre serviços no painel.</p>
                  )}
                  {services.map((service, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setBooking((current) => ({ ...current, service }));
                        setStep(2);
                      }}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--d-border)] bg-[var(--d-bg)] p-4 text-left transition hover:border-[var(--d-primary)]"
                    >
                      <span className="min-w-0">
                        <strong className="block">{service.name}</strong>
                        <span className="mt-0.5 block text-xs text-[var(--d-muted)]">
                          {formatDuration(service.duration)}
                          {service.price ? ` · ${service.price}` : ""}
                        </span>
                      </span>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-[var(--d-primary)]"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div>
                  <SelectedService service={booking.service} onChange={() => setStep(1)} />
                  {schedule.length === 0 ? (
                    <p className="mt-6 text-sm text-[var(--d-muted)]">
                      Nenhum horário disponível. Configure os dias de atendimento no painel.
                    </p>
                  ) : (
                    <>
                      <p className="mt-6 text-xs font-bold uppercase tracking-wider">Dia</p>
                      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
                        {schedule.map((day) => {
                          const [weekday, label] = formatDay(day.date);
                          const selected = booking.date === day.date;
                          return (
                            <button
                              key={day.date}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                setBooking((current) => ({ ...current, date: day.date, time: "" }))
                              }
                              className={`flex w-[4.5rem] shrink-0 flex-col items-center rounded-lg border py-3 transition ${selected ? "border-[var(--d-primary)] bg-[var(--d-primary)] text-[var(--d-primary-fg)]" : "border-[var(--d-border)] bg-[var(--d-bg)] hover:border-[var(--d-primary)]"}`}
                            >
                              <span className="text-[0.65rem] font-bold uppercase opacity-80">
                                {weekday}
                              </span>
                              <span className="mt-1 font-display text-base font-bold">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-6 text-xs font-bold uppercase tracking-wider">
                        Horário
                        {booking.date && (
                          <span className="font-medium normal-case text-[var(--d-muted)]">
                            {" "}
                            · {formatDayLong(booking.date)}
                          </span>
                        )}
                      </p>
                      {selectedDay ? (
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {selectedDay.times.map(({ time, available }) => {
                            const free =
                              available && !taken.includes(`${selectedDay.date} ${time}`);
                            const selected = booking.time === time;
                            return (
                              <button
                                key={time}
                                type="button"
                                disabled={!free}
                                aria-pressed={selected}
                                onClick={() => setBooking((current) => ({ ...current, time }))}
                                className={`h-11 rounded-lg border text-sm font-bold transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${selected ? "border-[var(--d-primary)] bg-[var(--d-primary)] text-[var(--d-primary-fg)]" : "border-[var(--d-border)] bg-[var(--d-bg)] hover:border-[var(--d-primary)]"}`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[var(--d-muted)]">
                          Escolha um dia para ver os horários livres.
                        </p>
                      )}
                    </>
                  )}
                  <StepNav
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    nextDisabled={!booking.date || !booking.time}
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <SelectedService service={booking.service} onChange={() => setStep(1)} />
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays
                      size={16}
                      className="text-[var(--d-primary)]"
                      aria-hidden="true"
                    />
                    {formatDayLong(booking.date)} às {booking.time}
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <DemoField label="Seu nome">
                      <input
                        value={booking.name}
                        onChange={(e) => setBooking((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Nome completo"
                        autoComplete="name"
                      />
                    </DemoField>
                    <DemoField label="WhatsApp">
                      <input
                        value={booking.phone}
                        onChange={(e) => setBooking((c) => ({ ...c, phone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </DemoField>
                    <div className="sm:col-span-2">
                      <DemoField label="Observações (opcional)">
                        <textarea
                          rows={3}
                          value={booking.notes}
                          onChange={(e) => setBooking((c) => ({ ...c, notes: e.target.value }))}
                          placeholder="Alguma preferência ou informação importante?"
                        />
                      </DemoField>
                    </div>
                  </div>
                  {showErrors && !detailsValid && (
                    <p
                      role="alert"
                      className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500"
                    >
                      Informe seu nome e um WhatsApp com DDD.
                    </p>
                  )}
                  <StepNav
                    onBack={() => setStep(2)}
                    onNext={confirm}
                    nextLabel="Confirmar agendamento"
                  />
                </div>
              )}

              {step === 4 && booking.service && (
                <div className="py-4 text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--d-primary)]/15 text-[var(--d-primary)]">
                    <CheckCircle2 size={36} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-black">Horário reservado!</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--d-muted)]">
                    {booking.name.split(" ")[0]}, seu horário de{" "}
                    <strong className="text-[var(--d-fg)]">{booking.service.name}</strong> ficou
                    para{" "}
                    <strong className="text-[var(--d-fg)]">
                      {formatDayLong(booking.date)} às {booking.time}
                    </strong>
                    .
                  </p>
                  <div className="mx-auto mt-6 grid max-w-sm gap-3">
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#25d366] px-5 text-xs font-bold uppercase tracking-wider text-[#0b3d1f]"
                      >
                        <MessageCircle size={17} aria-hidden="true" /> Confirmar pelo WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={resetBooking}
                      className="h-12 rounded-md border border-[var(--d-border)] text-xs font-bold uppercase tracking-wider transition hover:border-[var(--d-primary)]"
                    >
                      Fazer outro agendamento
                    </button>
                  </div>
                  <p className="mx-auto mt-6 max-w-sm text-xs text-[var(--d-muted)]">
                    Site demonstrativo: nenhuma reserva real foi registrada.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-t border-[var(--d-border)] bg-[var(--d-surface)] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Heading eyebrow="Depoimentos" title="Quem conhece, recomenda" />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item, index) => (
                <figure
                  key={index}
                  className="rounded-xl border border-[var(--d-border)] bg-[var(--d-bg)] p-6"
                >
                  <Quote size={22} className="text-[var(--d-primary)]" aria-hidden="true" />
                  <blockquote className="mt-3 text-sm leading-6">“{item.text}”</blockquote>
                  <figcaption className="mt-4 flex items-center justify-between text-sm font-bold">
                    {item.name}
                    <span className="flex text-[var(--d-accent)]" aria-label="5 estrelas">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} size={13} fill="currentColor" aria-hidden="true" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="contato"
        className="scroll-mt-20 border-t border-[var(--d-border)] py-16 sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <Heading eyebrow="Contato" title="Venha nos visitar" />
            <ul className="mt-8 grid gap-5 text-sm">
              {config.address && (
                <ContactItem icon={MapPin} label="Endereço">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--d-primary)]"
                  >
                    {config.address}
                  </a>
                </ContactItem>
              )}
              {config.phone && (
                <ContactItem icon={Phone} label="Telefone">
                  <a
                    href={`tel:${config.phone.replace(/[^\d+]/g, "")}`}
                    className="hover:text-[var(--d-primary)]"
                  >
                    {config.phone}
                  </a>
                </ContactItem>
              )}
              <ContactItem icon={Clock3} label="Horário">
                {openingHoursText(config)}
              </ContactItem>
              {config.instagram && (
                <ContactItem icon={Instagram} label="Instagram">
                  <a
                    href={`https://instagram.com/${encodeURIComponent(config.instagram)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--d-primary)]"
                  >
                    @{config.instagram}
                  </a>
                </ContactItem>
              )}
              {config.email && (
                <ContactItem icon={Mail} label="E-mail">
                  <a href={`mailto:${config.email}`} className="hover:text-[var(--d-primary)]">
                    {config.email}
                  </a>
                </ContactItem>
              )}
            </ul>
          </div>
          {config.address ? (
            <iframe
              title={`Mapa — ${name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(config.address)}&output=embed`}
              loading="lazy"
              className="min-h-72 w-full rounded-xl border border-[var(--d-border)]"
            />
          ) : (
            <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-[var(--d-border)] text-sm text-[var(--d-muted)]">
              Informe o endereço para exibir o mapa
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#0b0b0d] py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <strong className="font-display">{name}</strong>
          </div>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/25 transition hover:scale-105"
        >
          <MessageCircle size={26} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function DemoButton({
  children,
  onClick,
  size = "default",
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // Quem passa "hidden" controla a exibição por breakpoint (ex.: "hidden sm:inline-flex").
        className.includes("hidden") ? "" : "inline-flex",
        "items-center justify-center gap-2 rounded-md bg-[var(--d-primary)] font-bold uppercase tracking-wider text-[var(--d-primary-fg)] transition hover:-translate-y-0.5 hover:opacity-90",
        size === "lg" ? "h-13 px-7 text-xs" : "h-10 px-4 text-xs",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Heading({
  eyebrow,
  title,
  center = false,
}: {
  eyebrow: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--d-primary)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function SelectedService({
  service,
  onChange,
}: {
  service: DemoService | null;
  onChange: () => void;
}) {
  if (!service) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--d-primary)]/10 px-4 py-3">
      <span className="min-w-0">
        <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-[var(--d-primary)]">
          Serviço escolhido
        </span>
        <strong className="block truncate">{service.name}</strong>
      </span>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-xs font-bold uppercase text-[var(--d-primary)] hover:underline"
      >
        Trocar
      </button>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Continuar",
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--d-border)] pt-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-11 items-center gap-1 rounded-md border border-[var(--d-border)] px-4 text-xs font-bold uppercase tracking-wider transition hover:border-[var(--d-primary)]"
      >
        <ChevronLeft size={16} aria-hidden="true" /> Voltar
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex h-11 items-center gap-2 rounded-md bg-[var(--d-primary)] px-5 text-xs font-bold uppercase tracking-wider text-[var(--d-primary-fg)] transition hover:opacity-90 disabled:opacity-40"
      >
        {nextLabel} <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function DemoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-wider [&_input]:h-12 [&_input]:rounded-lg [&_input]:border [&_input]:border-[var(--d-border)] [&_input]:bg-[var(--d-bg)] [&_input]:px-4 [&_input]:text-sm [&_input]:font-medium [&_input]:normal-case [&_input]:tracking-normal [&_input]:text-[var(--d-fg)] [&_input]:outline-none [&_input:focus]:border-[var(--d-primary)] [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[var(--d-border)] [&_textarea]:bg-[var(--d-bg)] [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-medium [&_textarea]:normal-case [&_textarea]:tracking-normal [&_textarea]:text-[var(--d-fg)] [&_textarea]:outline-none [&_textarea:focus]:border-[var(--d-primary)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ContactItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--d-primary)]/15 text-[var(--d-primary)]">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wider text-[var(--d-muted)]">
          {label}
        </span>
        <span className="mt-1 block break-words font-semibold">{children}</span>
      </span>
    </li>
  );
}
