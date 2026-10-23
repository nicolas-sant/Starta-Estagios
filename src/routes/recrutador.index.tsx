import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Users,
  Search,
  Columns2,
  ArrowRight,
  Briefcase,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CandidateDetails, CandidateComparison } from "@/components/starta/recruiter-candidate";
import { StageTag } from "@/components/starta/ui";
import { STAGES, brl, type Stage } from "@/lib/data";
import { useStore } from "@/lib/store";
import { advanceCandidate, nextStage, setJobStatus } from "@/lib/recruiter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/recrutador/")({
  head: () => ({
    meta: [
      { title: "CRM de recrutamento — Starta" },
      {
        name: "description",
        content: "Gerencie vagas, candidatos, entrevistas e comparações na Starta.",
      },
      { property: "og:title", content: "CRM de recrutamento — Starta" },
      { property: "og:description", content: "Todas as suas seleções em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecruiterCRM,
});

function RecruiterCRM() {
  const jobs = useStore((s) => s.recruiterJobs);
  const candidates = useStore((s) => s.candidates);
  const [jobId, setJobId] = useState("");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage | "">("");
  const [selected, setSelected] = useState<string[]>([]);
  const [candidateId, setCandidateId] = useState("");
  const [compare, setCompare] = useState(false);
  const [confirm, setConfirm] = useState<"filled" | "deleted" | null>(null);
  const [highlight, setHighlight] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onMoved = (id: string) => {
    setHighlight(id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHighlight(""), 4000);
  };
  const visibleJobs = jobs.filter((j) => j.status !== "deleted");
  const job =
    visibleJobs.find((j) => j.id === jobId) ||
    visibleJobs.find((j) => j.published) ||
    visibleJobs[0];
  const pool = candidates.filter((c) => c.jobId === job?.id);
  const filtered = [...pool]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .filter(
    (c) =>
      (!stage || c.stage === stage) &&
      `${c.name} ${c.course} ${c.institution}`.toLowerCase().includes(query.toLowerCase()),
  );
  const count = (s: Stage) => pool.filter((c) => c.stage === s).length;
  const stats = [
    { title: "Em triagem", value: count("Triagem"), color: "text-primary", bg: "bg-essential" },
    {
      title: "Para entrevista",
      value: count("Entrevista"),
      color: "text-foreground",
      bg: "bg-lemon",
    },
    {
      title: "Aprovados",
      value: count("Aprovado"),
      color: "text-recommended-foreground",
      bg: "bg-recommended",
    },
    {
      title: "Recusados",
      value: count("Recusado"),
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Seus processos seletivos
          </p>
          <h1 className="text-3xl">Recrutamento</h1>
        </div>
        <Button asChild>
          <Link to="/recrutador/vagas/nova">
            <Plus />
            Publicar vaga
          </Link>
        </Button>
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Vagas da empresa</h2>
          <span className="text-xs text-muted-foreground">
            {visibleJobs.filter((j) => j.published).length} publicadas
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 xl:flex-wrap xl:overflow-visible">
          {visibleJobs.map((j) => (
            <Button
              key={j.id}
              variant="outline"
              onClick={() => {
                setJobId(j.id);
                setSelected([]);
                setStage("");
              }}
              className={cn(
                "h-auto min-w-64 max-w-80 flex-col items-start whitespace-normal px-4 py-4 text-left shadow-none",
                j.id === job?.id && "border-primary bg-essential/50",
              )}
            >
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {j.status === "filled" ? "Preenchida" : "Publicada"} · {j.modality}
              </span>
              <span className="line-clamp-2 font-semibold leading-5">{j.title}</span>
              <span className="mt-2 flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <Users className="size-3.5" />
                {candidates.filter((c) => c.jobId === j.id).length} candidatos · {brl(j.stipend)}
              </span>
            </Button>
          ))}
          {!visibleJobs.length && (
            <p className="py-8 text-muted-foreground">Nenhuma vaga publicada.</p>
          )}
        </div>
      </section>
      {job && (
        <>
          <section className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-recommended-foreground">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    job.published ? "bg-moss" : "bg-muted-foreground",
                  )}
                />
                {job.published ? "Seleção em andamento" : "Vaga preenchida"}
              </div>
              <h2 className="text-xl">{job.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {job.city} · {job.hours} · {brl(job.stipend)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" aria-label="Mais ações da vaga">
                  <MoreHorizontal />
                  Mais ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="h-11 text-sm">
                  <Link to="/recrutador/vagas/$id" params={{ id: job.id }}>
                    <Pencil />
                    Editar vaga
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="h-11 text-sm"
                  disabled={!job.published}
                  onSelect={() => setConfirm("filled")}
                >
                  <CheckCircle2 />
                  Marcar como preenchida
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="h-11 text-sm text-destructive"
                  onSelect={() => setConfirm("deleted")}
                >
                  <Trash2 />
                  Excluir vaga
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </section>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-5"
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-lg",
                    stat.bg,
                    stat.color,
                  )}
                >
                  <Users className="size-5" />
                </span>
                <div>
                  <p className={cn("text-3xl font-semibold tabular-nums", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            ))}
          </section>
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg">Candidatos</h2>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                  {pool.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  disabled={selected.length < 2}
                  onClick={() => setCompare(true)}
                >
                  <Columns2 />
                  Comparar{selected.length ? ` (${selected.length})` : ""}
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    aria-label="Buscar candidatos"
                    placeholder="Buscar candidato…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-52 pl-9"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-md border border-border bg-card px-3">
                  <ListFilter className="size-4 text-muted-foreground" />
                  <select
                    aria-label="Filtrar etapa"
                    className="h-9 max-w-32 bg-transparent text-sm"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as Stage | "")}
                  >
                    <option value="">Todas as etapas</option>
                    {STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[950px] grid-cols-5 gap-4">
                {STAGES.map((st) => (
                  <section key={st} className="min-w-0">
                    <header className="mb-3 flex items-center justify-between border-b-2 border-border pb-3">
                      <StageTag stage={st} />
                      <span className="text-xs text-muted-foreground">{count(st)}</span>
                    </header>
                    <div className="min-h-64 space-y-3 rounded-lg bg-muted/35 p-2">
                      {filtered
                        .filter((c) => c.stage === st)
                        .map((c) => (
                          <article
                            key={c.id}
                            className={cn(
                              "rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-all",
                              highlight === c.id && "border-primary ring-4 ring-lemon",
                            )}
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="flex size-9 items-center justify-center rounded-full bg-essential text-xs font-bold text-primary">
                                {c.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                              <input
                                type="checkbox"
                                aria-label={`Comparar ${c.name}`}
                                checked={selected.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked && selected.length >= 3) {
                                    toast.error("Compare até 3 candidatos por vez.");
                                    return;
                                  }
                                  setSelected(
                                    e.target.checked
                                      ? [...selected, c.id]
                                      : selected.filter((id) => id !== c.id),
                                  );
                                }}
                                className="size-4 accent-primary"
                              />
                            </div>
                            <Button
                              variant="link"
                              className="h-auto w-full justify-start whitespace-normal p-0 text-left text-sm font-semibold text-foreground"
                              onClick={() => setCandidateId(c.id)}
                            >
                              {c.name}
                            </Button>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {c.course}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {c.institution} · {c.semester}º semestre
                            </p>
                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                              <span className="text-[10px] text-muted-foreground">
                                {c.verified ? "Verificado" : "Não verificado"}
                              </span>
                              {c.stage !== "Aprovado" && c.stage !== "Recusado" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9"
                                  aria-label={`Avançar ${c.name}`}
                                  onClick={() => {
                                    const to = nextStage(c.stage);
                                    advanceCandidate(c.id);
                                    toast.success(`${c.name} foi movida para ${to}.`);
                                    onMoved(c.id);
                                  }}
                                >
                                  Avançar
                                  <ArrowRight />
                                </Button>
                              )}
                            </div>
                          </article>
                        ))}
                      {!filtered.some((c) => c.stage === st) && (
                        <p className="py-10 text-center text-xs text-muted-foreground">
                          Nenhum candidato
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      <CandidateDetails
        key={candidateId}
        candidate={candidates.find((c) => c.id === candidateId)}
        job={job}
        onClose={() => setCandidateId("")}
        onMoved={onMoved}
      />
      {compare && (
        <CandidateComparison
          candidates={pool.filter((c) => selected.includes(c.id))}
          job={job}
          onClose={() => setCompare(false)}
          onMoved={onMoved}
        />
      )}
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            {confirm === "deleted" ? "Excluir vaga?" : "Marcar vaga como preenchida?"}
          </DialogTitle>
          <DialogDescription>
            {job?.title}. A vaga sairá das buscas e do perfil da empresa. Os candidatos receberão o
            aviso de encerramento.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant={confirm === "deleted" ? "destructive" : "default"}
              onClick={() => {
                if (job && confirm) setJobStatus(job.id, confirm);
                setConfirm(null);
                toast.success("Vaga encerrada e candidatos avisados.");
              }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
