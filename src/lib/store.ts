import { useSyncExternalStore } from "react";
import { JOBS, type Job, type Stage } from "./data";

export type VerificationStatus = "vazio" | "enviado" | "analise" | "aprovado" | "recusado";

export type Doc = { id: string; title: string; area: string };
export type Application = {
  candidateId?: string;
  jobId: string;
  step: number; // 0 Inscrição, 1 Triagem, 2 Entrevista, 3 Resultado
  result?: "aprovado" | "recusado";
  appliedAt: string;
  message: string;
  docId?: string;
  feedback?: string;
  strengths: string[];
  toDevelop: string[];
  /** data em que cada etapa (índice = step) foi concluída/alcançada */
  stepDates?: string[];
  interview?: Interview;
};
export type Interview = { date: string; time: string; place: string; link?: string };
export type StudentLinks = { github: string; portfolio: string; linkedin: string };
export type NotificationKind = "etapa" | "retorno" | "vaga" | "mensagem" | "candidatura";
export type AppNotification = { id: string; text: string; at: string; read: boolean; kind?: NotificationKind };
export type ChatMessage = { from: "me" | "them"; text: string; at: string };
export type Thread = { id: string; jobId: string; with: string; messages: ChatMessage[]; readAt?: string };

export type Candidate = {
  strengths?: string[];
  toDevelop?: string[];
  interview?: Interview;
  experience?: string;
  skills?: string[];
  bio?: string;
  email?: string;
  studentLinked?: boolean;
  id: string;
  name: string;
  course: string;
  institution: string;
  semester: number;
  city: string;
  jobId: string;
  stage: Stage;
  verified: boolean;
  match: number;
  docTitle: string;
  feedback?: string;
  chat: ChatMessage[];
  links?: StudentLinks;
};

export type RecruiterJob = Job & { published: boolean; status?: "published" | "filled" | "deleted"; courses?: string; semesterMin?: number; semesterMax?: number; deadline?: string; openings?: number };

export type State = {
  role: "estudante" | "recrutador" | null;
  email: string;
  student: {
    interests: string[];
    city: string;
    verification: VerificationStatus;
    fileName: string;
    refuseReason: string;
    validUntil: string; // ISO
    name: string;
    photo: string;
    institution: string;
    course: string;
    semester: string;
    onboardingDone: boolean;
    profileDone: boolean;
    cvViews7d: number;
    links: StudentLinks;
    skills: string[];
  };
  docs: Doc[];
  applications: Application[];
  threads: Thread[];
  notifications: AppNotification[];
  company: { verification: VerificationStatus; cnpj: string; fileName: string; name: string };
  recruiterJobs: RecruiterJob[];
  candidates: Candidate[];
  settings: { notifications: boolean; highContrast: boolean; largeText: boolean; profilePublic: boolean };
};

const day = 864e5;
const ago = (d: number) => new Date(Date.now() - d * day).toISOString();
function nextThursday() {
  const d = new Date();
  d.setDate(d.getDate() + (((4 - d.getDay() + 7) % 7) || 7));
  return d.toISOString().slice(0, 10);
}

function defaultValidUntil() {
  const now = new Date();
  // fim do semestre letivo + janela de rematrícula (~15 dias)
  const end = now.getMonth() < 6 ? new Date(now.getFullYear(), 6, 15) : new Date(now.getFullYear() + 1, 0, 31);
  return end.toISOString();
}

const slug = (n: string) => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
const SEED_SKILLS: string[][] = [
  ["HTML e CSS", "Comunicação", "Excel intermediário"],
  ["HTML e CSS", "JavaScript", "React", "Git"],
  ["Comunicação", "Organização"],
  ["JavaScript", "Git", "HTML e CSS"],
  ["HTML e CSS", "React"],
  ["Comunicação", "Pacote Office", "Organização"],
  ["JavaScript"],
  ["HTML e CSS", "JavaScript", "Git"],
];
const seedCandidates: Candidate[] = [
  ["Beatriz Ramos", "Administração", "UFPE", 6, "Recife, PE", "Recebido", 92],
  ["João Victor Lima", "Ciência da Computação", "UFPE", 5, "Recife, PE", "Triagem", 88],
  ["Ana Clara Souza", "Sistemas de Informação", "UPE", 4, "Olinda, PE", "Entrevista", 85],
  ["Kauã Ferreira", "Engenharia da Computação", "UNICAP", 7, "Recife, PE", "Recebido", 79],
  ["Maria Eduarda Silva", "Análise de Sistemas", "IFPE", 3, "Jaboatão, PE", "Triagem", 74],
  ["Thiago Oliveira", "Design", "UFPE", 6, "Recife, PE", "Aprovado", 90],
  ["Larissa Nascimento", "Ciência da Computação", "UFRPE", 2, "Paulista, PE", "Recusado", 58],
  ["Pedro Henrique Costa", "Sistemas de Informação", "UNINASSAU", 5, "Recife, PE", "Recebido", 81],
].map(([name, course, institution, semester, city, stage, match], i) => ({
  id: `c${i + 1}`,
  name: name as string,
  course: course as string,
  institution: institution as string,
  semester: semester as number,
  city: city as string,
  jobId: i % 3 === 2 ? "rh-ml" : "front-ml",
  stage: stage as Stage,
  verified: i !== 4,
  match: match as number,
  docTitle: i % 2 ? "Dev Front-end.pdf" : "Currículo Geral.pdf",
  chat: [],
  skills: SEED_SKILLS[i],
  links: {
    github: `https://github.com/${slug(name as string)}`,
    portfolio: i % 2 ? `https://${slug(name as string)}.dev` : "",
    linkedin: `https://www.linkedin.com/in/${slug(name as string)}`,
  },
}));

export const initialState: State = {
  role: null,
  email: "",
  student: {
    interests: [],
    city: "",
    verification: "vazio",
    fileName: "",
    refuseReason: "",
    validUntil: "",
    name: "Beatriz Ramos",
    photo: "",
    institution: "UFPE",
    course: "Administração",
    semester: "6",
    onboardingDone: false,
    profileDone: false,
    cvViews7d: 12,
    links: { github: "", portfolio: "", linkedin: "" },
    skills: ["Excel intermediário", "Comunicação", "Organização", "Pacote Office"],
  },
  docs: [
    { id: "d1", title: "Currículo Geral.pdf", area: "Geral" },
    { id: "d2", title: "Administração Financeira.pdf", area: "Administração" },
  ],
  applications: [
    {
      jobId: "rh-ml",
      step: 2,
      appliedAt: ago(9),
      message: "Tenho muito interesse em People.",
      docId: "d1",
      strengths: ["Comunicação", "Organização"],
      toDevelop: ["Pacote Office"],
      stepDates: [ago(9), ago(6), ago(2)],
      interview: { date: nextThursday(), time: "14:00", place: "Online · Google Meet", link: "https://meet.google.com/" },
    },
    {
      jobId: "mkt-frevo",
      step: 3,
      result: "recusado",
      appliedAt: ago(20),
      message: "",
      docId: "d1",
      feedback: "Gostamos da sua redação. Para uma próxima vaga, recomendamos desenvolver Redes sociais (habilidade essencial nesta vaga) e Canva (recomendada) e se candidatar novamente.",
      stepDates: [ago(20), ago(16), ago(11), ago(5)],
      strengths: ["Redação"],
      toDevelop: ["Redes sociais", "Canva"],
    },
  ],
  threads: [
    {
      id: "t1",
      jobId: "rh-ml",
      with: "Rafael Nogueira · Mangue Labs",
      messages: [
        { from: "them", text: "Oi, Beatriz! Gostamos do seu perfil. Podemos marcar a entrevista para quinta, às 14h?", at: new Date(Date.now() - 2 * 864e5).toISOString() },
        { from: "me", text: "Oi, Rafael! Quinta às 14h funciona perfeitamente.", at: new Date(Date.now() - 2 * 864e5 + 36e5).toISOString() },
        { from: "them", text: "Ótimo, enviei o convite por e-mail. Até lá!", at: new Date(Date.now() - 1 * 864e5).toISOString() },
      ],
    },
  ],
  notifications: [
    { id: "n1", text: "Mangue Labs moveu sua candidatura para Entrevista.", at: new Date(Date.now() - 2 * 864e5).toISOString(), read: false, kind: "etapa" },
    { id: "n2", text: "Nova vaga em Administração em Recife: Banco Sertão.", at: new Date(Date.now() - 864e5).toISOString(), read: false, kind: "vaga" },
    { id: "n3", text: "Frevo Comunicação enviou o retorno da sua candidatura.", at: new Date(Date.now() - 5 * 864e5).toISOString(), read: true, kind: "retorno" },
  ],
  company: { verification: "aprovado", cnpj: "12.345.678/0001-90", fileName: "cartao-cnpj.pdf", name: "Mangue Labs" },
  recruiterJobs: JOBS.filter((j) => j.companyId === "porto-digital").map((j) => ({ ...j, published: true })),
  candidates: seedCandidates,
  settings: { notifications: true, highContrast: false, largeText: false, profilePublic: true },
};

const KEY = "starta-state-v1";
let state: State = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const student = { ...initialState.student, ...saved.student };
      // dados de exemplo para perfis salvos antes de existirem esses campos
      for (const k of ["name", "course", "institution", "semester"] as const) if (!student[k]) student[k] = initialState.student[k];
      if (!student.links || typeof student.links !== "object") student.links = { ...initialState.student.links };
      if (!Array.isArray(student.skills)) student.skills = [...initialState.student.skills];
      const seedApps = initialState.applications;
      const applications = Array.isArray(saved.applications)
        ? saved.applications.map((a: Application) => {
            const seed = seedApps.find((x) => x.jobId === a?.jobId && !a.candidateId);
            if (!seed) return a;
            return {
              ...a,
              stepDates: a.stepDates ?? seed.stepDates,
              interview: a.interview ?? seed.interview,
              feedback: a.feedback && /habilidades recomendadas/i.test(a.feedback) ? seed.feedback : a.feedback,
            };
          })
        : initialState.applications;
      state = { ...initialState, ...saved, applications, student, company: { ...initialState.company, ...saved.company } };
    }
  } catch {
    /* ignore */
  }
}

export function setState(updater: (s: State) => State) {
  load();
  state = updater(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function resetState() {
  setState(() => ({ ...initialState, student: { ...initialState.student } }));
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getState() {
  load();
  return state;
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(initialState),
  );
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function allJobs(s: State): Job[] {
  const managedIds = new Set(s.recruiterJobs.map((j) => j.id));
  return [...JOBS.filter((j) => !managedIds.has(j.id)), ...s.recruiterJobs.filter((j) => j.published && (!j.status || j.status === "published"))];
}

export { defaultValidUntil };

/** dias até o vencimento da verificação */
export function daysUntil(iso: string) {
  if (!iso) return 0;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
}

/** Notificações sempre da mais recente para a mais antiga */
export function sortNotifications<T extends { at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function notificationKind(n: AppNotification): NotificationKind {
  if (n.kind) return n.kind;
  if (/retorno|preenchida|encerrada/i.test(n.text)) return "retorno";
  if (/nova vaga/i.test(n.text)) return "vaga";
  if (/mensagem/i.test(n.text)) return "mensagem";
  if (/enviada/i.test(n.text)) return "candidatura";
  return "etapa";
}

export const NOTIFICATION_LABEL: Record<NotificationKind, string> = {
  etapa: "Mudança de etapa",
  retorno: "Retorno recebido",
  vaga: "Nova vaga",
  mensagem: "Nova mensagem",
  candidatura: "Candidatura enviada",
};

export function threadUnread(t: Thread) {
  const last = t.messages[t.messages.length - 1];
  return !!last && last.from === "them" && (!t.readAt || new Date(last.at) > new Date(t.readAt));
}

/** Datas de cada etapa concluída (até `step`), usando as registradas ou estimando a partir da inscrição */
export function stepDatesFor(a: Application): string[] {
  const out: string[] = [];
  for (let i = 0; i <= a.step; i++) out.push(a.stepDates?.[i] ?? out[i - 1] ?? a.appliedAt);
  return out;
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
