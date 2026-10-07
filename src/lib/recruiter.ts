import { STAGES, type Stage } from "./data";
import { getState, setState, type Candidate, type RecruiterJob } from "./store";

export function candidateProfile(candidate: Candidate) {
  return {
    ...candidate,
    experience: candidate.experience || "Experiência profissional não informada.",
    skills: candidate.skills || [],
    bio: candidate.bio || "Resumo profissional não informado.",
  };
}

export function advanceCandidate(id: string, stage?: Stage) {
  setState((s) => {
    const candidate = s.candidates.find((c) => c.id === id);
    if (!candidate) return s;
    const next = stage ?? (candidate.stage === "Recebido" ? "Triagem" : candidate.stage === "Triagem" ? "Entrevista" : candidate.stage === "Entrevista" ? "Aprovado" : candidate.stage);
    if (!STAGES.includes(next)) return s;
    const linked = candidate.studentLinked;
    return { ...s, candidates: s.candidates.map((c) => c.id === id ? { ...c, stage: next } : c),
      applications: s.applications.map((a) => linked && a.jobId === candidate.jobId ? { ...a, step: next === "Recebido" ? 0 : next === "Triagem" ? 1 : next === "Entrevista" ? 2 : 3, result: next === "Aprovado" ? "aprovado" : next === "Recusado" ? "recusado" : undefined } : a),
      notifications: linked ? [{ id: crypto.randomUUID(), text: `Sua candidatura foi atualizada para ${next}.`, at: new Date().toISOString(), read: false }, ...s.notifications] : s.notifications };
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
    return { ...s, candidates: s.candidates.map((c) => c.id === id ? { ...c, chat: [...c.chat, message] } : c),
      threads: candidate.studentLinked ? thread ? s.threads.map((t) => t.id === thread.id ? { ...t, messages: [...t.messages, incoming] } : t) : [{ id: `candidate-${id}`, jobId: candidate.jobId, with: `Recrutador · ${s.company.name}`, messages: [incoming] }, ...s.threads] : s.threads,
      notifications: candidate.studentLinked ? [{ id: crypto.randomUUID(), text: `Nova mensagem de ${s.company.name}.`, at: message.at, read: false }, ...s.notifications] : s.notifications };
  });
}

export function setJobStatus(id: string, status: "filled" | "deleted") {
  setState((s) => {
    const job = s.recruiterJobs.find((j) => j.id === id);
    if (!job) return s;
    const feedback = status === "filled" ? `A vaga ${job.title} foi preenchida. Obrigado pelo seu interesse.` : `A vaga ${job.title} foi encerrada pela empresa.`;
    return { ...s, recruiterJobs: s.recruiterJobs.map((j) => j.id === id ? { ...j, published: false, status } : j),
      candidates: s.candidates.map((c) => c.jobId === id ? { ...c, feedback, chat: [...c.chat, { from: "me", text: feedback, at: new Date().toISOString() }] } : c),
      applications: s.applications.map((a) => a.jobId === id ? { ...a, feedback } : a),
      notifications: s.applications.some((a) => a.jobId === id) ? [{ id: crypto.randomUUID(), text: feedback, at: new Date().toISOString(), read: false }, ...s.notifications] : s.notifications };
  });
}

export function saveJob(job: RecruiterJob) {
  setState((s) => ({ ...s, recruiterJobs: s.recruiterJobs.some((j) => j.id === job.id) ? s.recruiterJobs.map((j) => j.id === job.id ? job : j) : [job, ...s.recruiterJobs] }));
}

export function findManagedJob(id: string) { return getState().recruiterJobs.find((j) => j.id === id); }