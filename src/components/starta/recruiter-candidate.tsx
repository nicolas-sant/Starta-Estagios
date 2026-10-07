import { useState } from "react";
import { ArrowRight, Send, MapPin, GraduationCap, Briefcase, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StageTag, SkillTag } from "./ui";
import { InterviewPanel } from "./interview-panel";
import { advanceCandidate, candidateProfile, sendCandidateMessage } from "@/lib/recruiter";
import { useStore, type Candidate } from "@/lib/store";
import { STAGES, type Job, type Stage } from "@/lib/data";
import { toast } from "sonner";

export function CandidateDetails({
  candidate,
  job,
  onClose,
}: {
  candidate: Candidate | undefined;
  job: Job | undefined;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("perfil");
  const [message, setMessage] = useState("");
  const candidates = useStore((s) => s.candidates);
  const current = candidates.find((c) => c.id === candidate?.id);
  if (!current) return null;
  const c = candidateProfile(current);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto bg-card p-0">
        <header className="border-b border-border p-6 pr-12">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-essential text-xl font-bold text-primary">
              {c.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </span>
            <div>
              <DialogTitle className="text-2xl">{c.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {job?.title || "Vaga não disponível"}
              </DialogDescription>
              <div className="mt-2 flex flex-wrap gap-2">
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
        <div className="flex gap-2 border-b border-border px-6 py-2">
          {[
            ["perfil", "Perfil"],
            ["mensagens", "Mensagens"],
            ["ia", "Entrevista com IA"],
          ].map(([id, label]) => (
            <Button
              key={id}
              variant={tab === id ? "secondary" : "ghost"}
              onClick={() => setTab(id || "perfil")}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="p-6">
          {tab === "perfil" && (
            <div className="grid gap-8 md:grid-cols-[1fr_260px]">
              <div className="space-y-6">
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
                  <h3 className="mb-3">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {c.skills.length ? (
                      c.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-essential px-3 py-1 text-sm text-primary"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Habilidades não informadas.</p>
                    )}
                  </div>
                </section>
                <section>
                  <h3 className="mb-3">Requisitos da vaga</h3>
                  <div className="flex flex-wrap gap-2">
                    {job?.skills.map((skill) => (
                      <SkillTag key={skill.name} skill={skill} />
                    ))}
                  </div>
                </section>
              </div>
              <aside className="space-y-5 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
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
                  <p className="mb-1 text-sm text-muted-foreground">Currículo anexado</p>
                  <p className="break-words text-sm">{c.docTitle}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Arquivo de exemplo, sem PDF disponível.
                  </p>
                </div>
                <label className="block text-sm">
                  Etapa da candidatura
                  <select
                    aria-label="Etapa da candidatura"
                    className="mt-2 h-10 w-full rounded-md border border-border bg-card px-2"
                    value={c.stage}
                    onChange={(e) => advanceCandidate(c.id, e.target.value as Stage)}
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
                c.chat.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.from === "me"
                        ? "ml-auto max-w-[85%] rounded-md bg-essential p-3"
                        : "max-w-[85%] rounded-md bg-muted p-3"
                    }
                  >
                    <p className="whitespace-pre-wrap text-sm">{m.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(m.at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
              )}
            </div>
          )}
          {tab === "ia" && (
            <InterviewPanel
              requirements={`${job?.title || ""}\n${job?.description || ""}\n${job?.skills.map((s) => `${s.name}: ${s.level}, peso ${s.weight || 1}`).join("\n") || ""}`}
              profile={`${c.name}\n${c.course}, ${c.institution}, ${c.semester}º semestre\n${c.experience}\nHabilidades: ${c.skills.join(", ")}`}
            />
          )}
        </div>
        <footer className="border-t border-border bg-background p-6">
          <label className="block text-sm font-medium">
            Mensagem ao candidato
            <Textarea
              aria-label="Mensagem ao candidato"
              className="mt-2"
              rows={2}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva seu retorno…"
            />
          </label>
          <div className="mt-3 flex flex-wrap justify-between gap-3">
            <Button
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
            <Button
              disabled={c.stage === "Aprovado" || c.stage === "Recusado"}
              onClick={() => advanceCandidate(c.id)}
            >
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
  onClose,
}: {
  candidates: Candidate[];
  onClose: () => void;
}) {
  const all = useStore((s) => s.candidates);
  const selected = candidates.map((c) => candidateProfile(all.find((x) => x.id === c.id) || c));
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto bg-card">
        <DialogTitle className="text-2xl">Comparar candidatos</DialogTitle>
        <DialogDescription>Perfis selecionados · {selected.length} candidatos</DialogDescription>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-32 border-b border-border p-4 text-muted-foreground">Critério</th>
                {selected.map((c) => (
                  <th key={c.id} className="min-w-56 border-b border-border p-4 text-lg">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["Experiência", "Curso", "Instituição", "Semestre", "Habilidades", "Etapa"].map(
                (row) => (
                  <tr key={row}>
                    <th className="border-b border-border p-4 align-top font-medium text-muted-foreground">
                      {row}
                    </th>
                    {selected.map((c) => (
                      <td key={c.id} className="border-b border-border p-4 align-top">
                        {row === "Experiência" ? (
                          c.experience
                        ) : row === "Curso" ? (
                          c.course
                        ) : row === "Instituição" ? (
                          c.institution
                        ) : row === "Semestre" ? (
                          `${c.semester}º`
                        ) : row === "Habilidades" ? (
                          c.skills.join(", ") || "Não informadas"
                        ) : (
                          <StageTag stage={c.stage} />
                        )}
                      </td>
                    ))}
                  </tr>
                ),
              )}
              <tr>
                <th className="p-4" />
                {selected.map((c) => (
                  <td key={c.id} className="p-4">
                    <Button
                      disabled={c.stage === "Aprovado" || c.stage === "Recusado"}
                      onClick={() => advanceCandidate(c.id)}
                    >
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
