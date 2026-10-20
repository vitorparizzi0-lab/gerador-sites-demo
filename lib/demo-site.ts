/**
 * Gerador de sites demonstrativos.
 *
 * A configuração do cliente fica toda no próprio link (JSON em base64url no
 * parâmetro `d`), então a pré-visualização não grava nada no banco e o link
 * pode ser enviado direto para o cliente.
 */

export type DemoSegment =
  "oficina" | "barbearia" | "salao" | "clinica" | "estetica" | "petshop" | "academia";

export type DemoService = {
  name: string;
  description: string;
  /** Duração em minutos. */
  duration: number;
  /** Texto livre, ex.: "R$ 45" ou "A partir de R$ 120". */
  price: string;
};

export type DemoTestimonial = { name: string; text: string };

export type DemoConfig = {
  v: 1;
  segment: DemoSegment;
  businessName: string;
  tagline: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  logoUrl: string;
  heroImageUrl: string;
  primaryColor: string;
  accentColor: string;
  theme: "light" | "dark";
  services: DemoService[];
  /** Dias de atendimento, 0 = domingo. */
  openDays: number[];
  openTime: string;
  closeTime: string;
  lunchStart: string;
  lunchEnd: string;
  slotMinutes: number;
  highlights: string[];
  testimonials: DemoTestimonial[];
};

export type DemoSegmentPreset = {
  label: string;
  bookingLabel: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  theme: "light" | "dark";
  services: DemoService[];
  highlights: string[];
  testimonials: DemoTestimonial[];
};

export const DEMO_SEGMENTS: Record<DemoSegment, DemoSegmentPreset> = {
  oficina: {
    label: "Oficina mecânica",
    bookingLabel: "Agendar revisão",
    tagline: "Seu veículo em boas mãos, sem surpresa no orçamento.",
    description:
      "Mecânica geral, elétrica e diagnóstico com scanner. Orçamento aprovado por você antes de qualquer reparo.",
    primaryColor: "#d62828",
    accentColor: "#fcbf49",
    theme: "dark",
    services: [
      {
        name: "Revisão completa",
        description: "Check-up de itens de segurança e fluidos.",
        duration: 90,
        price: "A partir de R$ 250",
      },
      {
        name: "Troca de óleo e filtros",
        description: "Óleo e filtros conforme o fabricante.",
        duration: 45,
        price: "A partir de R$ 180",
      },
      {
        name: "Diagnóstico com scanner",
        description: "Leitura e análise de falhas eletrônicas.",
        duration: 60,
        price: "R$ 120",
      },
      {
        name: "Freios e suspensão",
        description: "Pastilhas, discos, amortecedores e alinhamento.",
        duration: 120,
        price: "Sob orçamento",
      },
    ],
    highlights: ["Orçamento antes do reparo", "Garantia nos serviços", "Equipe especializada"],
    testimonials: [
      {
        name: "Carlos M.",
        text: "Atendimento rápido e preço justo. Explicaram tudo antes de mexer no carro.",
      },
      { name: "Fernanda S.", text: "Agendei pelo site e fui atendida no horário. Recomendo!" },
    ],
  },
  barbearia: {
    label: "Barbearia",
    bookingLabel: "Agendar horário",
    tagline: "Corte, barba e aquele cuidado que você merece.",
    description:
      "Ambiente confortável, profissionais experientes e horário marcado para você não perder tempo na fila.",
    primaryColor: "#c8a24a",
    accentColor: "#e9d8a6",
    theme: "dark",
    services: [
      {
        name: "Corte masculino",
        description: "Corte na tesoura ou máquina, com finalização.",
        duration: 40,
        price: "R$ 45",
      },
      {
        name: "Barba",
        description: "Toalha quente, navalha e hidratação.",
        duration: 30,
        price: "R$ 35",
      },
      {
        name: "Corte + barba",
        description: "O combo completo com desconto.",
        duration: 60,
        price: "R$ 70",
      },
      {
        name: "Sobrancelha",
        description: "Design e acabamento na navalha.",
        duration: 15,
        price: "R$ 15",
      },
    ],
    highlights: ["Horário marcado, sem fila", "Profissionais experientes", "Ambiente climatizado"],
    testimonials: [
      { name: "Rafael T.", text: "Melhor barbearia da região. Marco pelo site em segundos." },
      { name: "João P.", text: "Corte impecável e atendimento nota 10." },
    ],
  },
  salao: {
    label: "Salão de beleza",
    bookingLabel: "Agendar horário",
    tagline: "Realce sua beleza com quem entende do assunto.",
    description:
      "Cabelo, unhas e maquiagem com profissionais qualificadas e produtos de qualidade.",
    primaryColor: "#c2185b",
    accentColor: "#f8bbd0",
    theme: "light",
    services: [
      {
        name: "Corte feminino",
        description: "Corte personalizado com escova.",
        duration: 60,
        price: "A partir de R$ 90",
      },
      { name: "Escova", description: "Escova modelada ou lisa.", duration: 45, price: "R$ 60" },
      {
        name: "Coloração",
        description: "Cor, mechas ou retoque de raiz.",
        duration: 120,
        price: "Sob avaliação",
      },
      {
        name: "Manicure e pedicure",
        description: "Cutilagem e esmaltação.",
        duration: 60,
        price: "R$ 55",
      },
    ],
    highlights: ["Produtos profissionais", "Atendimento com hora marcada", "Equipe especializada"],
    testimonials: [
      { name: "Juliana R.", text: "Saí de lá me sentindo outra pessoa. Amei o resultado!" },
      { name: "Patrícia L.", text: "Ambiente lindo e atendimento super carinhoso." },
    ],
  },
  clinica: {
    label: "Clínica / consultório",
    bookingLabel: "Agendar consulta",
    tagline: "Cuidado com a sua saúde, do jeito que você merece.",
    description:
      "Atendimento humanizado, com profissionais qualificados e agendamento simples pela internet.",
    primaryColor: "#0f766e",
    accentColor: "#99f6e4",
    theme: "light",
    services: [
      {
        name: "Consulta",
        description: "Avaliação completa e orientação.",
        duration: 30,
        price: "R$ 200",
      },
      {
        name: "Retorno",
        description: "Acompanhamento após a primeira consulta.",
        duration: 20,
        price: "R$ 100",
      },
      {
        name: "Avaliação inicial",
        description: "Primeira conversa para entender o seu caso.",
        duration: 45,
        price: "Gratuita",
      },
    ],
    highlights: ["Atendimento humanizado", "Pontualidade", "Ambiente acolhedor"],
    testimonials: [
      { name: "Marcos A.", text: "Profissionais atenciosos e atendimento pontual." },
      { name: "Luciana F.", text: "Marcar a consulta pelo site foi muito prático." },
    ],
  },
  estetica: {
    label: "Estética",
    bookingLabel: "Agendar sessão",
    tagline: "Tratamentos que valorizam a sua autoestima.",
    description:
      "Procedimentos faciais e corporais com tecnologia, segurança e profissionais habilitadas.",
    primaryColor: "#9d4edd",
    accentColor: "#e0aaff",
    theme: "light",
    services: [
      {
        name: "Limpeza de pele",
        description: "Extração, máscara e hidratação.",
        duration: 60,
        price: "R$ 150",
      },
      {
        name: "Drenagem linfática",
        description: "Massagem para reduzir o inchaço.",
        duration: 60,
        price: "R$ 120",
      },
      {
        name: "Design de sobrancelhas",
        description: "Mapeamento e modelagem.",
        duration: 30,
        price: "R$ 50",
      },
      {
        name: "Massagem relaxante",
        description: "Alívio de tensões e estresse.",
        duration: 50,
        price: "R$ 130",
      },
    ],
    highlights: ["Profissionais habilitadas", "Equipamentos modernos", "Ambiente relaxante"],
    testimonials: [
      { name: "Camila B.", text: "Minha pele nunca esteve tão bonita. Atendimento impecável." },
      { name: "Renata V.", text: "Lugar tranquilo e equipe muito profissional." },
    ],
  },
  petshop: {
    label: "Pet shop",
    bookingLabel: "Agendar banho e tosa",
    tagline: "Carinho e cuidado para quem é da família.",
    description: "Banho, tosa e cuidados com segurança e muito amor. Seu pet sai cheiroso e feliz.",
    primaryColor: "#f77f00",
    accentColor: "#ffd166",
    theme: "light",
    services: [
      {
        name: "Banho",
        description: "Banho com produtos hipoalergênicos.",
        duration: 60,
        price: "A partir de R$ 50",
      },
      {
        name: "Banho e tosa",
        description: "Tosa higiênica ou na tesoura.",
        duration: 90,
        price: "A partir de R$ 80",
      },
      {
        name: "Hidratação",
        description: "Pelos macios e brilhantes.",
        duration: 30,
        price: "R$ 35",
      },
      {
        name: "Corte de unhas",
        description: "Rápido e sem estresse.",
        duration: 15,
        price: "R$ 20",
      },
    ],
    highlights: ["Produtos hipoalergênicos", "Equipe treinada", "Ambiente seguro"],
    testimonials: [
      { name: "Ana C.", text: "Meu cachorro volta sempre feliz e cheiroso!" },
      { name: "Bruno K.", text: "Cuidam do meu gato com muito carinho. Super indico." },
    ],
  },
  academia: {
    label: "Academia / personal",
    bookingLabel: "Agendar aula experimental",
    tagline: "Treine com orientação e alcance seus objetivos.",
    description:
      "Treinos personalizados, acompanhamento profissional e horários flexíveis para a sua rotina.",
    primaryColor: "#2563eb",
    accentColor: "#a3e635",
    theme: "dark",
    services: [
      {
        name: "Aula experimental",
        description: "Conheça a estrutura e treine com a gente.",
        duration: 60,
        price: "Gratuita",
      },
      {
        name: "Avaliação física",
        description: "Medidas, bioimpedância e metas.",
        duration: 45,
        price: "R$ 80",
      },
      {
        name: "Personal trainer",
        description: "Treino individual e acompanhado.",
        duration: 60,
        price: "R$ 120",
      },
    ],
    highlights: ["Equipamentos modernos", "Professores qualificados", "Horários flexíveis"],
    testimonials: [
      { name: "Diego S.", text: "Em 3 meses já vi muita diferença. Professores excelentes." },
      { name: "Larissa M.", text: "A aula experimental me convenceu na hora!" },
    ],
  },
};

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function demoConfigFromSegment(
  segment: DemoSegment,
  base?: Partial<DemoConfig>,
): DemoConfig {
  const preset = DEMO_SEGMENTS[segment];
  return {
    v: 1,
    segment,
    businessName: "",
    tagline: preset.tagline,
    description: preset.description,
    city: "",
    address: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    email: "",
    logoUrl: "",
    heroImageUrl: "",
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    theme: preset.theme,
    services: preset.services.map((service) => ({ ...service })),
    openDays: [1, 2, 3, 4, 5, 6],
    openTime: "09:00",
    closeTime: "18:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    slotMinutes: 30,
    highlights: [...preset.highlights],
    testimonials: preset.testimonials.map((item) => ({ ...item })),
    ...base,
  };
}

export const DEFAULT_DEMO_CONFIG: DemoConfig = demoConfigFromSegment("barbearia", {
  businessName: "Barbearia Exemplo",
  city: "Curitiba - PR",
  address: "Rua das Flores, 123 — Centro, Curitiba - PR",
  phone: "(41) 99999-9999",
  whatsapp: "(41) 99999-9999",
  instagram: "barbeariaexemplo",
});

// ---------- Codificação do link ----------

/** Mensagens trocadas entre o painel e o iframe da pré-visualização. */
export const DEMO_CONFIG_MESSAGE = "demo-site:config";
export const DEMO_READY_MESSAGE = "demo-site:ready";

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeDemoConfig(config: DemoConfig) {
  return toBase64Url(JSON.stringify(config));
}

export function decodeDemoConfig(value: string | undefined | null): DemoConfig | null {
  if (!value) return null;
  try {
    return sanitizeDemoConfig(JSON.parse(fromBase64Url(value)));
  } catch {
    return null;
  }
}

const str = (value: unknown, max: number, fallback = "") =>
  typeof value === "string" ? value.slice(0, max) : fallback;
const hex = (value: unknown, fallback: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
const time = (value: unknown, fallback: string) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;
const httpUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString().slice(0, 600)
      : "";
  } catch {
    return "";
  }
};

/** Garante que um link vindo da URL só tenha valores válidos e de tamanho razoável. */
export function sanitizeDemoConfig(raw: unknown): DemoConfig {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const segment = (
    typeof input["segment"] === "string" && input["segment"] in DEMO_SEGMENTS
      ? input["segment"]
      : "barbearia"
  ) as DemoSegment;
  const base = demoConfigFromSegment(segment);
  const services = Array.isArray(input["services"])
    ? input["services"].slice(0, 12).map((item) => {
        const s = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
        const duration = Number(s["duration"]);
        return {
          name: str(s["name"], 60),
          description: str(s["description"], 160),
          duration: Number.isFinite(duration)
            ? Math.min(480, Math.max(5, Math.round(duration)))
            : 30,
          price: str(s["price"], 40),
        };
      })
    : base.services;
  const openDays = Array.isArray(input["openDays"])
    ? Array.from(
        new Set(
          input["openDays"].filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6),
        ),
      ).sort()
    : base.openDays;
  const slotMinutes = Number(input["slotMinutes"]);
  return {
    v: 1,
    segment,
    businessName: str(input["businessName"], 80),
    tagline: str(input["tagline"], 120, base.tagline),
    description: str(input["description"], 400, base.description),
    city: str(input["city"], 80),
    address: str(input["address"], 160),
    phone: str(input["phone"], 30),
    whatsapp: str(input["whatsapp"], 30),
    instagram: str(input["instagram"], 60).replace(/^@/, ""),
    email: str(input["email"], 100),
    logoUrl: httpUrl(input["logoUrl"]),
    heroImageUrl: httpUrl(input["heroImageUrl"]),
    primaryColor: hex(input["primaryColor"], base.primaryColor),
    accentColor: hex(input["accentColor"], base.accentColor),
    theme: input["theme"] === "light" || input["theme"] === "dark" ? input["theme"] : base.theme,
    services,
    openDays,
    openTime: time(input["openTime"], base.openTime),
    closeTime: time(input["closeTime"], base.closeTime),
    lunchStart: input["lunchStart"] === "" ? "" : time(input["lunchStart"], base.lunchStart),
    lunchEnd: input["lunchEnd"] === "" ? "" : time(input["lunchEnd"], base.lunchEnd),
    slotMinutes: [15, 20, 30, 45, 60, 90, 120].includes(slotMinutes) ? slotMinutes : 30,
    highlights: Array.isArray(input["highlights"])
      ? input["highlights"].slice(0, 6).map((h) => str(h, 60))
      : base.highlights,
    testimonials: Array.isArray(input["testimonials"])
      ? input["testimonials"].slice(0, 6).map((item) => {
          const t = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
          return { name: str(t["name"], 60), text: str(t["text"], 280) };
        })
      : base.testimonials,
  };
}

// ---------- Cores ----------

/** Texto preto ou branco, o que tiver mais contraste com a cor de fundo. */
export function readableTextColor(background: string) {
  const value = background.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(value.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  return luminance > 0.4 ? "#111111" : "#ffffff";
}

// ---------- Agenda simulada ----------

const toMinutes = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const fromMinutes = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Hash simples e estável para marcar alguns horários como ocupados na demo. */
function looksBooked(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 100 < 28;
}

export type DemoDay = { date: string; times: Array<{ time: string; available: boolean }> };

/** Gera os próximos dias de atendimento com horários fictícios (alguns já "ocupados"). */
export function buildDemoSchedule(config: DemoConfig, now = new Date(), days = 10): DemoDay[] {
  const result: DemoDay[] = [];
  if (config.openDays.length === 0) return result;
  const open = toMinutes(config.openTime);
  const close = toMinutes(config.closeTime);
  const lunchStart = config.lunchStart ? toMinutes(config.lunchStart) : -1;
  const lunchEnd = config.lunchEnd ? toMinutes(config.lunchEnd) : -1;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let guard = 0; result.length < days && guard < 60; guard++) {
    if (config.openDays.includes(cursor.getDay())) {
      const key = dateKey(cursor);
      const isToday = guard === 0;
      const times: DemoDay["times"] = [];
      for (let t = open; t + config.slotMinutes <= close; t += config.slotMinutes) {
        if (
          lunchStart >= 0 &&
          lunchEnd > lunchStart &&
          t < lunchEnd &&
          t + config.slotMinutes > lunchStart
        )
          continue;
        if (isToday && t <= nowMinutes + 30) continue;
        const label = fromMinutes(t);
        times.push({
          time: label,
          available: !looksBooked(`${config.businessName}${key}${label}`),
        });
      }
      if (times.some((slot) => slot.available)) result.push({ date: key, times });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export function whatsappDigits(phone: string) {
  let digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 13 ? digits : "";
}
