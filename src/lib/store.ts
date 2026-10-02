import { useSyncExternalStore } from "react";
import { JOBS, type Job, type Stage } from "./data";

export type VerificationStatus = "vazio" | "enviado" | "analise" | "aprovado" | "recusado";

export type Doc = { id: string; title: string; area: string };
export type Application = {
  jobId: string;
  step: number; // 0 Inscrição, 1 Triagem, 2 Entrevista, 3 Resultado
  result?: "aprovado" | "recusado";
  appliedAt: string;
  message: string;
  docId?: string;
  feedback?: string;
  strengths: string[];
  toDevelop: string[];
};
export type ChatMessage = { from: "me" | "them"; text: string; at: string };
export type Thread = { id: string; jobId: string; with: string; messages: ChatMessage[] };

export type Candidate = {
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
};

export type RecruiterJob = Job & { published: boolean };

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
  };
  docs: Doc[];
  applications: Application[];
  threads: Thread[];
  notifications: { id: string; text: string; at: string; read: boolean }[];
  company: { verification: VerificationStatus; cnpj: string; fileName: string; name: string };
  recruiterJobs: RecruiterJob[];
  candidates: Candidate[];
  settings: { notifications: boolean; highContrast: boolean; largeText: boolean; profilePublic: boolean };
};

function defaultValidUntil() {
  const now = new Date();
  // fim do semestre letivo + janela de rematrícula (~15 dias)
  const end = now.getMonth() < 6 ? new Date(now.getFullYear(), 6, 15) : new Date(now.getFullYear() + 1, 0, 31);
  return end.toISOString();
}

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
    name: "",
    photo: "",
    institution: "",
    course: "",
    semester: "",
    onboardingDone: false,
    profileDone: false,
    cvViews7d: 12,
  },
  docs: [
    { id: "d1", title: "Currículo Geral.pdf", area: "Geral" },
    { id: "d2", title: "Administração Financeira.pdf", area: "Administração" },
  ],
  applications: [
    {
      jobId: "rh-ml",
      step: 2,
      appliedAt: new Date(Date.now() - 9 * 864e5).toISOString(),
      message: "Tenho muito interesse em People.",
      docId: "d1",
      strengths: ["Comunicação", "Organização"],
      toDevelop: ["Pacote Office"],
    },
    {
      jobId: "mkt-frevo",
      step: 3,
      result: "recusado",
      appliedAt: new Date(Date.now() - 20 * 864e5).toISOString(),
      message: "",
      docId: "d1",
      feedback: "Recomendamos desenvolver as habilidades recomendadas e se candidatar novamente.",
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
    { id: "n1", text: "Mangue Labs moveu sua candidatura para Entrevista.", at: new Date(Date.now() - 2 * 864e5).toISOString(), read: false },
    { id: "n2", text: "Nova vaga em Administração em Recife: Banco Sertão.", at: new Date(Date.now() - 864e5).toISOString(), read: false },
    { id: "n3", text: "Frevo Comunicação enviou o retorno da sua candidatura.", at: new Date(Date.now() - 5 * 864e5).toISOString(), read: true },
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
    if (raw) state = { ...initialState, ...JSON.parse(raw) };
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
  const extra = s.recruiterJobs.filter((j) => j.published && !JOBS.some((b) => b.id === j.id));
  return [...JOBS, ...extra];
}

export { defaultValidUntil };

/** dias até o vencimento da verificação */
export function daysUntil(iso: string) {
  if (!iso) return 0;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
