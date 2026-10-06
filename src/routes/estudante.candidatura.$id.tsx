import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, TrendingUp, Sparkles } from "lucide-react";
import { Card, CompanyAvatar, DocChip, Stepper } from "@/components/starta/ui";
import { JOBS, STUDENT_STEPS, getCompany } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/estudante/candidatura/$id")({
  head: () => ({
    meta: [
      { title: "Progresso da candidatura — Starta" },
      { name: "description", content: "Detalhes, etapas do processo seletivo e retorno do recrutador." },
      { property: "og:title", content: "Progresso da candidatura — Starta" },
      { property: "og:description", content: "Acompanhe cada etapa do processo seletivo." },
    ],
  }),
  component: Candidatura,
});

function Candidatura() {
  const { id } = Route.useParams();
  const apps = useStore((s) => s.applications);
  const docs = useStore((s) => s.docs);
  const threads = useStore((s) => s.threads);
  const extra = useStore((s) => s.recruiterJobs);
  const a = apps.find((x) => x.jobId === id);
  const j = JOBS.find((x) => x.id === id) ?? extra.find((x) => x.id === id);
  if (!a || !j) return <p className="p-6 text-center text-muted-foreground">Candidatura não encontrada.</p>;
  const c = getCompany(j.companyId);
  const doc = docs.find((d) => d.id === a.docId);
  const thread = threads.find((t) => t.jobId === id);

  const timeline = [
    { t: "Candidatura enviada", d: a.appliedAt, done: true },
    { t: "Currículo em triagem", done: a.step >= 1 },
    { t: "Entrevista", done: a.step >= 2 },
    { t: a.result === "recusado" ? "Não selecionado" : a.result === "aprovado" ? "Aprovado" : "Resultado", done: a.step >= 3 },
  ];

  return (
    <div className="space-y-4">
      <Link to="/estudante/painel" className="flex h-11 items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-5 w-5" /> Painel</Link>
      <Card>
        <div className="flex items-center gap-3">
          <CompanyAvatar initials={c?.initials ?? "?"} size={48} />
          <div>
            <Link to="/estudante/vaga/$id" params={{ id: j.id }} className="font-display text-lg font-bold text-deep-space hover:underline">{j.title}</Link>
            <p className="text-sm text-muted-foreground">{c?.name} · enviada em {new Date(a.appliedAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
        <div className="mt-5"><Stepper steps={STUDENT_STEPS} current={a.step} failed={a.result === "recusado"} /></div>
      </Card>

      {a.feedback && (
        <Card className={a.result === "recusado" ? "border-destructive/30" : "border-moss"}>
          <p className="label-mono text-muted-foreground">Retorno do recrutador</p>
          <p className="mt-2 text-deep-space">"{a.feedback}"</p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="flex items-center gap-2 font-display font-bold text-deep-space"><Sparkles className="h-5 w-5 text-recommended-foreground" /> Pontos fortes</p>
          <div className="mt-2 flex flex-wrap gap-2">{a.strengths.map((s) => <span key={s} className="rounded-full bg-recommended px-3 py-1 text-xs font-semibold text-recommended-foreground">{s}</span>)}</div>
        </Card>
        <Card>
          <p className="flex items-center gap-2 font-display font-bold text-deep-space"><TrendingUp className="h-5 w-5 text-primary" /> A desenvolver</p>
          <div className="mt-2 flex flex-wrap gap-2">{a.toDevelop.map((s) => <span key={s} className="rounded-full bg-essential px-3 py-1 text-xs font-semibold text-essential-foreground">{s}</span>)}</div>
        </Card>
      </div>

      <Card>
        <p className="font-display font-bold text-deep-space">Linha do tempo</p>
        <ol className="mt-3 space-y-3 border-l-2 border-neutral-tag pl-4">
          {timeline.map((t) => (
            <li key={t.t} className="relative">
              <span className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full ${t.done ? "bg-moss" : "bg-neutral-tag"}`} />
              <p className={t.done ? "font-medium text-deep-space" : "text-muted-foreground"}>{t.t}</p>
              {t.d && <p className="label-mono text-muted-foreground">{new Date(t.d).toLocaleDateString("pt-BR")}</p>}
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <p className="font-display font-bold text-deep-space">Detalhes enviados</p>
        {doc && <div className="mt-2"><DocChip title={doc.title} /></div>}
        {a.message && <p className="mt-2 text-sm text-muted-foreground">"{a.message}"</p>}
      </Card>

      <Link to="/estudante/mensagens" search={{ t: thread?.id ?? `new-${j.id}` }} className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-primary font-semibold text-primary-foreground">
        <MessageCircle className="h-5 w-5" /> Chat com recrutador
      </Link>
    </div>
  );
}
