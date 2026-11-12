import { STAGES, type Stage } from "./data";
import { getState, initialState, setState, type Candidate, type Interview, type RecruiterJob } from "./store";
import type { Job } from "./data";

export function candidateProfile(candidate: Candidate) {
  const seed = initialState.candidates.find((c) => c.id === candidate.id);
  return {
    ...candidate,
    links: candidate.links || seed?.links,
    experience: candidate.experience || "Experiência profissional não informada.",
    skills: candidate.skills?.length ? candidate.skills : seed?.skills || [],
    bio: candidate.bio || "Resumo profissional não informado.",
  };
}

export function advanceCandidate(id: string, stage?: Stage) {
  setState((s) => {
    const candidate = s.candidates.find((c) => c.id === id);
    if (!candidate) return s;
    const next =
      stage ??
      (candidate.stage === "Recebido"
        ? "Triagem"
        : candidate.stage === "Triagem"
          ? "Entrevista"
          : candidate.stage === "Entrevista"
            ? "Aprovado"
            : candidate.stage);
    if (!STAGES.includes(next)) return s;
    const linked = candidate.studentLinked;
    return {
      ...s,
      candidates: s.candidates.map((c) => (c.id === id ? { ...c, stage: next } : c)),
      applications: s.applications.map((a) => {
        if (!linked || a.jobId !== candidate.jobId) return a;
        const { result: _oldResult, ...application } = a;
        const step =
          next === "Recebido" ? 0 : next === "Triagem" ? 1 : next === "Entrevista" ? 2 : 3;
        const stepDates = [...(application.stepDates ?? [application.appliedAt])].slice(0, step);
        while (stepDates.length < step) stepDates.push(new Date().toISOString());
        stepDates[step] = new Date().toISOString();
        return {
          ...application,
          step,
          stepDates,
          ...(next === "Aprovado"
            ? { result: "aprovado" as const }
            : next === "Recusado"
              ? { result: "recusado" as const }
              : {}),
        };
      }),
      notifications: linked
        ? [
            {
              id: crypto.randomUUID(),
              text: `Sua candidatura foi atualizada para ${next}.`,
              at: new Date().toISOString(),
              read: false,
              kind: (next === "Aprovado" || next === "Recusado" ? "retorno" : "etapa") as "retorno" | "etapa",
            },
            ...s.notifications,
          ]
        : s.notifications,
    };
  });
}

export function sendCandidateMessage(id: string, text: string) {
  const value = text.trim().slice(0, 2000);
  if (!value) return;
  setState((s) => {
    const candidate = s.candidates.find((c) => c.id === id);
    if (!candidate) return s;
    const message = { from: "me" as const, text: value, at: new Date().toISOString() };
    const incoming = { ...message, from: "them" as const };
    const thread = s.threads.find((t) => t.jobId === candidate.jobId);
    return {
      ...s,
      candidates: s.candidates.map((c) => (c.id === id ? { ...c, chat: [...c.chat, message] } : c)),
      threads: candidate.studentLinked
        ? thread
          ? s.threads.map((t) =>
              t.id === thread.id ? { ...t, messages: [...t.messages, incoming] } : t,
            )
          : [
              {
                id: `candidate-${id}`,
                jobId: candidate.jobId,
                with: `Recrutador · ${s.company.name}`,
                messages: [incoming],
              },
              ...s.threads,
            ]
        : s.threads,
      notifications: candidate.studentLinked
        ? [
            {
              id: crypto.randomUUID(),
              text: `Nova mensagem de ${s.company.name}.`,
              at: message.at,
              read: false,
              kind: "mensagem" as const,
            },
            ...s.notifications,
          ]
        : s.notifications,
    };
  });
}

export function setJobStatus(id: string, status: "filled" | "deleted") {
  setState((s) => {
    const job = s.recruiterJobs.find((j) => j.id === id);
    if (!job) return s;
    const feedback =
      status === "filled"
        ? `A vaga ${job.title} foi preenchida. Obrigado pelo seu interesse.`
        : `A vaga ${job.title} foi encerrada pela empresa.`;
    return {
      ...s,
      recruiterJobs: s.recruiterJobs.map((j) =>
        j.id === id ? { ...j, published: false, status } : j,
      ),
      candidates: s.candidates.map((c) =>
        c.jobId === id
          ? {
              ...c,
              feedback,
              chat: [...c.chat, { from: "me", text: feedback, at: new Date().toISOString() }],
            }
          : c,
      ),
      applications: s.applications.map((a) => (a.jobId === id ? { ...a, feedback } : a)),
      notifications: s.applications.some((a) => a.jobId === id)
        ? [
            { id: crypto.randomUUID(), text: feedback, at: new Date().toISOString(), read: false, kind: "retorno" as const },
            ...s.notifications,
          ]
        : s.notifications,
    };
  });
}

export function saveJob(job: RecruiterJob) {
  setState((s) => ({
    ...s,
    recruiterJobs: s.recruiterJobs.some((j) => j.id === job.id)
      ? s.recruiterJobs.map((j) => (j.id === job.id ? job : j))
      : [job, ...s.recruiterJobs],
  }));
}

export function findManagedJob(id: string) {
  return getState().recruiterJobs.find((j) => j.id === id);
}

export function backOrRecruiter(historyLength: number, back: () => void, home: () => void) {
  if (historyLength > 1) back();
  else home();
}

/** Compara as habilidades do candidato com cada requisito da vaga. */
export function matchRequirements(skills: string[], job: Job | undefined) {
  const own = new Set(skills.map((s) => s.trim().toLowerCase()));
  const items = (job?.skills || []).map((r) => ({ ...r, met: own.has(r.name.trim().toLowerCase()) }));
  const essentials = items.filter((i) => i.level === "essencial");
  return {
    items,
    met: items.filter((i) => i.met).length,
    total: items.length,
    essentialMet: essentials.filter((i) => i.met).length,
    essentialTotal: essentials.length,
  };
}

export function nextStage(stage: Stage): Stage {
  return stage === "Recebido" ? "Triagem" : stage === "Triagem" ? "Entrevista" : stage === "Entrevista" ? "Aprovado" : stage;
}

export function setCandidateNotes(id: string, notes: { strengths?: string[]; toDevelop?: string[] }) {
  setState((s) => ({ ...s, candidates: s.candidates.map((c) => (c.id === id ? { ...c, ...notes } : c)) }));
}

/** Agenda, remarca (interview) ou cancela (undefined) a entrevista; reflete na candidatura do estudante. */
export function scheduleInterview(id: string, interview: Interview | undefined) {
  setState((s) => {
    const candidate = s.candidates.find((c) => c.id === id);
    if (!candidate) return s;
    const linked = candidate.studentLinked;
    const text = interview
      ? `Entrevista marcada para ${interview.date.split("-").reverse().join("/")} às ${interview.time} · ${interview.place}`
      : "A entrevista agendada foi cancelada.";
    return {
      ...s,
      candidates: s.candidates.map((c) => {
        if (c.id !== id) return c;
        const { interview: _old, ...rest } = c;
        return interview ? { ...rest, interview } : rest;
      }),
      applications: s.applications.map((a) => {
        if (!linked || a.jobId !== candidate.jobId || a.candidateId) return a;
        const { interview: _old, ...rest } = a;
        return interview ? { ...rest, interview } : rest;
      }),
      notifications: linked
        ? [{ id: crypto.randomUUID(), text, at: new Date().toISOString(), read: false, kind: "etapa" as const }, ...s.notifications]
        : s.notifications,
    };
  });
}

export type TemplateId = "convite" | "aprovado" | "nao" | "documento";
export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  convite: "Convite para entrevista",
  aprovado: "Aprovado para a próxima etapa",
  nao: "Não selecionado desta vez",
  documento: "Pedido de documento/portfólio",
};

export function messageTemplate(
  id: TemplateId,
  v: { name: string; job: string; company: string; strengths?: string[]; toDevelop?: string[] },
) {
  const first = v.name.split(" ")[0];
  switch (id) {
    case "convite":
      return `Olá, ${first}! Gostamos do seu perfil para a vaga ${v.job} na ${v.company} e queremos convidar você para uma entrevista. Qual o melhor dia e horário para você esta semana?`;
    case "aprovado":
      return `Olá, ${first}! Boa notícia: você foi aprovado(a) para a próxima etapa da vaga ${v.job} na ${v.company}. Em breve enviaremos os próximos passos.`;
    case "nao": {
      const fortes = v.strengths?.length ? v.strengths.join(", ") : "seu interesse e dedicação";
      const dev = v.toDevelop?.length ? ` Para as próximas oportunidades, recomendamos desenvolver: ${v.toDevelop.join(", ")}.` : "";
      return `Olá, ${first}. Agradecemos sua candidatura para a vaga ${v.job} na ${v.company}. Desta vez seguimos com outro perfil, mas destacamos seus pontos fortes: ${fortes}.${dev} Esperamos ver você em novos processos!`;
    }
    case "documento":
      return `Olá, ${first}! Para continuarmos sua candidatura à vaga ${v.job} na ${v.company}, poderia nos enviar seu portfólio ou o documento solicitado? Obrigado!`;
  }
}
