import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Clock, Laptop, MapPin, Wallet, X, Users, AlertTriangle } from "lucide-react";
import { Card, CompanyAvatar, DocChip, NeutralTag, PrimaryButton, SkillTag, VerifiedSeal } from "@/components/starta/ui";
import { JOBS, brl, getCompany, hasReachPenalty, hasTrustSeal, type Job } from "@/lib/data";
import { getState, setState, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante/vaga/$id")({
  head: ({ params }) => {
    const j = JOBS.find((x) => x.id === params.id);
    const t = j ? `${j.title} — Starta` : "Vaga — Starta";
    const d = j?.summary ?? "Detalhes da vaga de estágio.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: VagaPage,
  notFoundComponent: () => <p className="p-6 text-center">Vaga não encontrada.</p>,
});

function VagaPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const recruiterJobs = useStore((s) => s.recruiterJobs);
  const apps = useStore((s) => s.applications);
  const docs = useStore((s) => s.docs);
  const student = useStore((s) => s.student);
  const job: Job | undefined = JOBS.find((j) => j.id === id) ?? recruiterJobs.find((j) => j.id === id);
  const [sheet, setSheet] = useState(false);
  const [docId, setDocId] = useState("");
  const [msg, setMsg] = useState("");
  if (!job) throw notFound();
  const c = getCompany(job.companyId);
  const applied = apps.some((a) => a.jobId === job.id);
  const seal = hasTrustSeal(job);
  const sorted = [...job.skills].sort((a) => (a.level === "essencial" ? -1 : 1));

  const send = () => {
    if (!docId) return toast.error("Anexe um currículo.");
    const myStrengths = job.skills.filter((s) => s.level === "essencial").map((s) => s.name);
    setState((s) => ({
      ...s,
      applications: [
        { jobId: job.id, step: 0, appliedAt: new Date().toISOString(), message: msg.trim().slice(0, 500), docId, strengths: myStrengths.slice(0, 2), toDevelop: job.skills.filter((x) => x.level === "recomendado").map((x) => x.name) },
        ...s.applications,
      ],
      notifications: [{ id: crypto.randomUUID(), text: `Candidatura enviada: ${job.title}. Você verá cada etapa aqui.`, at: new Date().toISOString(), read: false }, ...s.notifications],
    }));
    setSheet(false);
    toast.success("Candidatura enviada!");
    nav({ to: "/estudante/candidatura/$id", params: { id: job.id } });
  };

  return (
    <div className="space-y-4 pb-24">
      <button onClick={() => history.back()} className="flex h-11 items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-5 w-5" /> Voltar</button>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <CompanyAvatar initials={c?.initials ?? "?"} size={56} />
          {seal ? <VerifiedSeal label="Vaga confiável" /> : <NeutralTag>Sem selo de confiança</NeutralTag>}
        </div>
        <h1 className="mt-4 text-2xl text-deep-space">{job.title}</h1>
        {c && (
          <Link to="/estudante/empresa/$id" params={{ id: c.id }} className="mt-1 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
            {c.name} {c.verified && <VerifiedSeal small />}
          </Link>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            [Wallet, "Bolsa", brl(job.stipend)],
            [Laptop, "Modalidade", job.modality],
            [MapPin, "Local", job.city],
            [Clock, "Carga", job.hours],
          ].map(([I, l, v]) => {
            const Icon = I as typeof Wallet;
            return (
              <div key={l as string} className="rounded-xl bg-mint p-3">
                <p className="label-mono flex items-center gap-1 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{l as string}</p>
                <p className="mt-1 font-semibold text-deep-space">{v as string}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 label-mono text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.applicants} candidatos</span>
          <span>Retorno médio: {c?.avgResponseDays} dias</span>
          <span>{c?.responseRate}% recebem resposta</span>
        </div>
        {hasReachPenalty(job.companyId) && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Esta empresa responde poucos candidatos. Alcance reduzido no feed.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg text-deep-space">Habilidades</h2>
        <p className="text-sm text-muted-foreground">Essenciais pesam mais na triagem.</p>
        <div className="mt-3 flex flex-wrap gap-2">{sorted.map((s) => <SkillTag key={s.name} skill={s} />)}</div>
      </Card>

      <Card>
        <h2 className="text-lg text-deep-space">Sobre a vaga</h2>
        <p className="mt-2 text-[15px] text-deep-space/80">{job.description}</p>
        <h3 className="mt-4 font-display font-bold text-deep-space">Responsabilidades</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-deep-space/80">{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
        {job.benefits.length > 0 && (
          <>
            <h3 className="mt-4 font-display font-bold text-deep-space">Benefícios</h3>
            <div className="mt-2 flex flex-wrap gap-2">{job.benefits.map((b) => <NeutralTag key={b}>{b}</NeutralTag>)}</div>
          </>
        )}
      </Card>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-card p-3">
        <div className="mx-auto max-w-2xl">
          {applied ? (
            <Link to="/estudante/candidatura/$id" params={{ id: job.id }} className="flex h-12 items-center justify-center rounded-[10px] bg-recommended font-semibold text-recommended-foreground">
              ✓ Candidatado · ver progresso
            </Link>
          ) : (
            <PrimaryButton className="w-full" onClick={() => (student.verification === "aprovado" || getState().student.verification === "aprovado" ? setSheet(true) : toast.error("Verifique sua matrícula antes de se candidatar."))}>
              Candidatar-se
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Bottom sheet de inscrição */}
      <div className={cn("fixed inset-0 z-40 bg-deep-space/40 transition-opacity", sheet ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setSheet(false)} />
      <div className={cn("fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-[24px] bg-card p-5 transition-transform", sheet ? "translate-y-0" : "translate-y-full")}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-tag" />
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-deep-space">Inscrição</h2>
          <button onClick={() => setSheet(false)} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-mint"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-sm font-medium text-deep-space">Anexe um currículo</p>
        <p className="text-xs text-muted-foreground">Visível só para recrutadores.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {docs.map((d) => (
            <button key={d.id} onClick={() => setDocId(d.id)} className={cn("rounded-xl ring-2", docId === d.id ? "ring-primary" : "ring-transparent")}>
              <DocChip title={d.title} />
            </button>
          ))}
          <Link to="/estudante/perfil" className="flex h-10 items-center rounded-xl border border-dashed border-border px-3 text-sm font-medium text-primary">+ Novo</Link>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-deep-space">Mensagem ao recrutador (opcional)</span>
          <textarea value={msg} maxLength={500} onChange={(e) => setMsg(e.target.value)} rows={3} className="mt-1.5 w-full rounded-[10px] border border-border p-3 outline-none focus:border-primary" placeholder="Por que você se interessa por essa vaga?" />
          <span className="label-mono text-muted-foreground">{msg.length}/500</span>
        </label>
        <PrimaryButton className="mt-3 w-full" onClick={send}>Enviar candidatura</PrimaryButton>
      </div>
    </div>
  );
}
