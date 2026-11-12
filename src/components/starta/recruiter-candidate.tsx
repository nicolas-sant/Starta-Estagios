import { useState } from "react";
import {
  ArrowRight,
  Send,
  MapPin,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Check,
  X,
  CalendarDays,
  ListChecks,
  FileText,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StageTag } from "./ui";
import { InterviewPanel } from "./interview-panel";
import {
  advanceCandidate,
  candidateProfile,
  matchRequirements,
  messageTemplate,
  nextStage,
  scheduleInterview,
  sendCandidateMessage,
  setCandidateNotes,
  TEMPLATE_LABELS,
  type TemplateId,
} from "@/lib/recruiter";
import { useStore, type Candidate } from "@/lib/store";
import { STAGES, type Job, type Stage } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type OnMoved = (id: string, name: string, stage: Stage) => void;

function move(c: { id: string; name: string; stage: Stage }, onMoved?: OnMoved, to?: Stage) {
  const target = to ?? nextStage(c.stage);
  if (target === c.stage) return;
  advanceCandidate(c.id, target);
  toast.success(`${c.name} mudou para ${target}.`);
  onMoved?.(c.id, c.name, target);
}

function LevelTag({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        level === "essencial"
          ? "bg-essential text-essential-foreground"
          : "bg-recommended text-recommended-foreground",
      )}
    >
      {level === "essencial" ? "Essencial" : "Recomendado"}
    </span>
  );
}

export function RequirementMatch({ skills, job }: { skills: string[]; job: Job | undefined }) {
  const m = matchRequirements(skills, job);
  if (!m.total) return <p className="text-sm text-muted-foreground">A vaga não tem requisitos cadastrados.</p>;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        {m.met} de {m.total} requisitos atendidos ({m.essentialMet} de {m.essentialTotal} essenciais)
      </p>
      <ul className="space-y-1.5">
        {m.items.map((r) => (
          <li key={r.name} className="flex flex-wrap items-center gap-2 text-sm">
            {r.met ? (
              <Check className="size-4 text-recommended-foreground" aria-hidden />
            ) : (
              <X className="size-4 text-destructive" aria-hidden />
            )}
            <span>{r.name}</span>
            <LevelTag level={r.level} />
            <span className={cn("text-xs font-semibold", r.met ? "text-recommended-foreground" : "text-destructive")}>
              {r.met ? "atende" : "não atende"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Links({ links, example }: { links: Candidate["links"]; example?: boolean }) {
  const keys = (["github", "portfolio", "linkedin"] as const).filter((k) => links?.[k]);
  if (!keys.length) return <p className="mt-2 text-xs text-muted-foreground">Sem links informados.</p>;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {keys.map((k) => {
        const label = `${k === "github" ? "GitHub" : k === "portfolio" ? "Portfólio" : "LinkedIn"} ↗`;
        const cls = "rounded-full bg-essential px-3 py-1 text-xs font-semibold text-essential-foreground";
        return example ? (
          <span key={k} title="Link de exemplo — sem destino real" className={cn(cls, "cursor-default")}>
            {label}
          </span>
        ) : (
          <a key={k} href={links![k]} target="_blank" rel="noopener noreferrer" className={cn(cls, "hover:underline")}>
            {label}
          </a>
        );
      })}
      {example && (
        <span className="text-xs text-muted-foreground" title="Link de exemplo — sem destino real">
          Links de exemplo, sem destino real.
        </span>
      )}
    </div>
  );
}

const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

export function CandidateDetails({
  candidate,
  job,
  onClose,
  onMoved,
}: {
  candidate: Candidate | undefined;
  job: Job | undefined;
  onClose: () => void;
  onMoved?: OnMoved;
}) {
  const [tab, setTab] = useState("perfil");
  const [message, setMessage] = useState("");
  const candidates = useStore((s) => s.candidates);
  const company = useStore((s) => s.company.name);
  const current = candidates.find((c) => c.id === candidate?.id);
  const [date, setDate] = useState(current?.interview?.date || "");
  const [time, setTime] = useState(current?.interview?.time || "");
  const [place, setPlace] = useState(current?.interview?.place || "");
  const [link, setLink] = useState(current?.interview?.link || "");
  const [editingInterview, setEditingInterview] = useState(!current?.interview);
  if (!current) return null;
  const c = candidateProfile(current);
  const m = matchRequirements(c.skills, job);
  const strengths = c.strengths ?? m.items.filter((i) => i.met).map((i) => i.name);
  const toDevelop = c.toDevelop ?? m.items.filter((i) => !i.met).map((i) => i.name);
  const terminal = c.stage === "Aprovado" || c.stage === "Recusado";
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl bg-card p-0"
      >
        <header className="border-b border-border p-5 pr-28">
          <div className="flex items-center gap-3">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-essential text-xl font-bold text-primary">
              {c.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
            </span>
            <div>
              <DialogTitle className="text-2xl">{c.name}</DialogTitle>
              <DialogDescription className="mt-3">{job?.title || "Vaga não disponível"}</DialogDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <StageTag stage={c.stage} />
                {c.verified && (
                  <span className="flex items-center gap-1 text-xs text-recommended-foreground">
                    <ShieldCheck className="size-3.5" />
                    Estudante verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        <div role="tablist" className="flex gap-2 overflow-x-auto border-b border-border px-5 py-3">
          {[
            ["perfil", "Perfil"],
            ["mensagens", "Mensagens"],
            ["entrevista", "Entrevista"],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id!)}
              className={cn(
                "h-11 shrink-0 rounded-lg px-5 text-sm font-semibold transition-colors",
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "perfil" && (
            <div className="grid gap-8 md:grid-cols-[1fr_280px]">
              <div className="space-y-8">
                <section>
                  <h3 className="mb-2">Sobre o candidato</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{c.bio}</p>
                </section>
                <section>
                  <h3 className="mb-2 flex items-center gap-2">
                    <Briefcase className="size-4" />
                    Experiência
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-6">{c.experience}</p>
                </section>
                <section>
                  <h3 className="mb-3">Habilidades do candidato</h3>
                  <div className="flex flex-wrap gap-2">
                    {c.skills.length ? (
                      c.skills.map((skill) => (
                        <span key={skill} className="rounded-lg bg-muted px-3 py-1 text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Habilidades não informadas.</p>
                    )}
                  </div>
                </section>
                <section className="rounded-xl border border-border p-5">
                  <h3 className="mb-3">Requisitos da vaga</h3>
                  <RequirementMatch skills={c.skills} job={job} />
                </section>
                <section className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Pontos fortes (separe por vírgula)
                    <Input
                      className="mt-3 h-11 rounded-lg"
                      defaultValue={strengths.join(", ")}
                      onBlur={(e) => setCandidateNotes(c.id, { strengths: csv(e.target.value) })}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Pontos a desenvolver
                    <Input
                      className="mt-3 h-11 rounded-lg"
                      defaultValue={toDevelop.join(", ")}
                      onBlur={(e) => setCandidateNotes(c.id, { toDevelop: csv(e.target.value) })}
                    />
                  </label>
                </section>
              </div>
              <aside className="space-y-8 border-t border-border pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="size-4" />
                    Formação
                  </p>
                  <p className="font-semibold">{c.course}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.institution} · {c.semester}º semestre
                  </p>
                </div>
                <p className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4" />
                  {c.city}
                </p>
                <div>
                  <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="size-4" />
                    Currículo e links
                  </p>
                  <p className="break-words text-sm">{c.docTitle}</p>
                  <Links links={c.links} example={!c.studentLinked} />
                  <p className="mt-2 text-xs text-muted-foreground">Arquivo de exemplo, sem PDF disponível.</p>
                </div>
                <label className="block text-sm">
                  Etapa da candidatura
                  <select
                    aria-label="Etapa da candidatura"
                    className="mt-3 h-11 w-full rounded-lg border border-border bg-card px-3"
                    value={c.stage}
                    onChange={(e) => move(c, onMoved, e.target.value as Stage)}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                {c.feedback && <p className="text-sm">{c.feedback}</p>}
              </aside>
            </div>
          )}
          {tab === "mensagens" && (
            <div className="space-y-3">
              {c.chat.length ? (
                c.chat.map((msg, i) => (
                  <div
                    key={i}
                    className={
                      msg.from === "me" ? "ml-auto max-w-[85%] rounded-xl bg-essential p-3" : "max-w-[85%] rounded-xl bg-muted p-3"
                    }
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(msg.at).toLocaleString("pt-BR")}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
              )}
            </div>
          )}
          {tab === "entrevista" && (
            <div className="space-y-8">
              {c.interview && !editingInterview && (
                <section className="rounded-xl border-2 border-primary bg-essential/40 p-5">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Entrevista marcada</p>
                  <p className="mt-2 text-lg font-semibold">
                    {new Date(`${c.interview.date}T12:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às {c.interview.time}
                  </p>
                  <p className="mt-1 text-sm">{c.interview.place}</p>
                  {c.interview.link && (
                    <a href={c.interview.link} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm font-semibold text-primary underline">
                      {c.interview.link}
                    </a>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button size="lg" variant="outline" onClick={() => setEditingInterview(true)}>
                      <CalendarDays />
                      Remarcar
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        scheduleInterview(c.id, undefined);
                        setDate(""); setTime(""); setPlace(""); setLink("");
                        setEditingInterview(true);
                        toast.success("Entrevista cancelada.");
                      }}
                    >
                      Cancelar entrevista
                    </Button>
                  </div>
                </section>
              )}
              {editingInterview && (
                <section className="rounded-xl border border-border p-5">
                  <h3 className="mb-1 flex items-center gap-2">
                    <CalendarDays className="size-5 text-primary" />
                    {c.interview ? "Remarcar entrevista" : "Agendar entrevista"}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">Ao salvar, a entrevista aparece na candidatura do estudante.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium">Dia<Input type="date" className="mt-3 h-11 rounded-lg" value={date} onChange={(e) => setDate(e.target.value)} /></label>
                    <label className="text-sm font-medium">Horário<Input type="time" className="mt-3 h-11 rounded-lg" value={time} onChange={(e) => setTime(e.target.value)} /></label>
                    <label className="text-sm font-medium">Local ou formato<Input className="mt-3 h-11 rounded-lg" placeholder="Ex.: Online · Google Meet" value={place} onChange={(e) => setPlace(e.target.value)} /></label>
                    <label className="text-sm font-medium">Link (opcional)<Input className="mt-3 h-11 rounded-lg" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} /></label>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      disabled={!date || !time || !place.trim()}
                      onClick={() => {
                        scheduleInterview(c.id, { date, time, place: place.trim(), ...(link.trim() ? { link: link.trim() } : {}) });
                        setEditingInterview(false);
                        toast.success("Entrevista salva e enviada ao estudante.");
                      }}
                    >
                      Salvar entrevista
                    </Button>
                    {c.interview && (
                      <Button size="lg" variant="outline" onClick={() => setEditingInterview(false)}>
                        Voltar
                      </Button>
                    )}
                  </div>
                </section>
              )}
              <section className="rounded-xl border border-border p-5">
                <h3 className="mb-1 flex items-center gap-2">
                  <ListChecks className="size-5 text-primary" />
                  Roteiro de perguntas
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">A IA sugere perguntas com base na vaga e no perfil do candidato.</p>
                <InterviewPanel
                  requirements={`${job?.title || ""}\n${job?.description || ""}\n${job?.skills.map((s) => `${s.name}: ${s.level}, peso ${s.weight || 1}`).join("\n") || ""}`}
                  profile={`${c.name}\n${c.course}, ${c.institution}, ${c.semester}º semestre\n${c.experience}\nHabilidades: ${c.skills.join(", ")}`}
                />
              </section>
            </div>
          )}
        </div>
        <footer className="border-t border-border bg-background p-5">
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium">Usar um modelo (você pode editar antes de enviar):</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TEMPLATE_LABELS) as TemplateId[]).map((id) => (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() =>
                    setMessage(messageTemplate(id, { name: c.name, job: job?.title || "", company, strengths, toDevelop }))
                  }
                >
                  {TEMPLATE_LABELS[id]}
                </Button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium">
            Mensagem ao candidato
            <Textarea
              aria-label="Mensagem ao candidato"
              className="mt-3 rounded-lg"
              rows={3}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva seu retorno ou escolha um modelo acima…"
            />
          </label>
          <div className="mt-3 flex flex-wrap justify-between gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={!message.trim()}
              onClick={() => {
                sendCandidateMessage(c.id, message);
                setMessage("");
                toast.success("Mensagem enviada.");
              }}
            >
              <Send />
              Enviar mensagem
            </Button>
            <Button size="lg" disabled={terminal} onClick={() => move(c, onMoved)}>
              Avançar etapa
              <ArrowRight />
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

export function CandidateComparison({
  candidates,
  job,
  onClose,
  onMoved,
}: {
  candidates: Candidate[];
  job: Job | undefined;
  onClose: () => void;
  onMoved?: OnMoved;
}) {
  const all = useStore((s) => s.candidates);
  const selected = candidates.map((c) => candidateProfile(all.find((x) => x.id === c.id) || c));
  const rows = ["Experiência", "Curso", "Instituição", "Semestre", "Requisitos da vaga", "Currículo e links", "Etapa"];
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto rounded-2xl bg-card p-5"
      >
        <DialogTitle className="pr-28 text-2xl">Comparar candidatos</DialogTitle>
        <DialogDescription>Perfis selecionados · {selected.length} candidatos</DialogDescription>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-32 border-b border-border p-4 text-muted-foreground">Critério</th>
                {selected.map((c) => (
                  <th key={c.id} className="min-w-64 border-b border-border p-4 text-lg">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row}>
                  <th className="border-b border-border p-4 align-top font-medium text-muted-foreground">{row}</th>
                  {selected.map((c) => (
                    <td key={c.id} className="border-b border-border p-4 align-top">
                      {row === "Experiência" ? c.experience
                        : row === "Curso" ? c.course
                        : row === "Instituição" ? c.institution
                        : row === "Semestre" ? `${c.semester}º`
                        : row === "Requisitos da vaga" ? <RequirementMatch skills={c.skills} job={job} />
                        : row === "Currículo e links" ? (<><p>{c.docTitle}</p><Links links={c.links} example={!c.studentLinked} /></>)
                        : <StageTag stage={c.stage} />}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="p-4" />
                {selected.map((c) => (
                  <td key={c.id} className="p-4">
                    <Button size="lg" disabled={c.stage === "Aprovado" || c.stage === "Recusado"} onClick={() => move(c, onMoved)}>
                      Avançar etapa
                      <ArrowRight />
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
