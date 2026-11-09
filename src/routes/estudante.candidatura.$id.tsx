import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, TrendingUp, Sparkles, CalendarDays, Clock, MapPin, Video, Megaphone } from "lucide-react";
import { Card, CompanyAvatar, DocChip, Stepper } from "@/components/starta/ui";
import { JOBS, STUDENT_STEPS, getCompany } from "@/lib/data";
import { stepDatesFor, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante/candidatura/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const j = extra.find((x) => x.id === id) ?? JOBS.find((x) => x.id === id);
  if (!a || !j) return <p className="p-6 text-center text-muted-foreground">Candidatura não encontrada.</p>;
  const c = getCompany(j.companyId);
  const doc = docs.find((d) => d.id === a.docId);
  const thread = threads.find((t) => t.jobId === id);

  const dates = stepDatesFor(a);
  const timeline = [
    { t: "Candidatura enviada", d: dates[0], done: true },
    { t: "Currículo em triagem", d: dates[1], done: a.step >= 1 },
    { t: "Entrevista", d: dates[2], done: a.step >= 2 },
    { t: a.result === "recusado" ? "Não selecionado" : a.result === "aprovado" ? "Aprovado" : "Resultado", d: dates[3], done: a.step >= 3 },
  ];
  const levelOf = (name: string) => j.skills.find((k) => k.name.toLowerCase() === name.toLowerCase())?.level;
  const devEssential = a.toDevelop.filter((n) => levelOf(n) === "essencial");
  // texto do retorno nunca pode chamar de "recomendadas" habilidades que são essenciais na vaga
  const feedback = a.feedback && devEssential.length && /habilidades recomendadas/i.test(a.feedback)
    ? a.feedback.replace(/as habilidades recomendadas/i, "as habilidades listadas em \"A desenvolver\" (incluindo as essenciais)")
    : a.feedback;
  const resultOut = a.step >= 3 && !!a.result;
  const interview = a.step === 2 && !a.result ? a.interview : undefined;
  const SkillChip = ({ name }: { name: string }) => {
    const lv = levelOf(name);
    return lv ? <SkillTag skill={{ name, level: lv }} /> : <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-deep-space">{name}</span>;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link to="/estudante/painel" className="flex h-11 items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-5 w-5" /> Painel</Link>
      <Card>
        <div className="flex items-center gap-3">
          <CompanyAvatar initials={c?.initials ?? "?"} size={48} />
          <div>
            <Link to="/estudante/vaga/$id" params={{ id: j.id }} className="font-display text-lg font-bold text-deep-space hover:underline">{j.title}</Link>
            <p className="text-sm text-muted-foreground">{c?.name} · enviada em {new Date(a.appliedAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
        <div className="mt-3"><Stepper steps={STUDENT_STEPS} current={a.step} failed={a.result === "recusado"} /></div>
      </Card>

      {feedback && (
        <section className={cn("rounded-2xl border-2 p-5 shadow-[var(--shadow-card)]", a.result === "recusado" ? "border-destructive bg-card" : a.result === "aprovado" ? "border-moss bg-recommended" : "border-primary bg-essential")}>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold text-deep-space">
            <Megaphone className={cn("h-6 w-6", a.result === "recusado" ? "text-destructive" : "text-primary")} />
            {resultOut ? (a.result === "aprovado" ? "Candidatura aprovada! Retorno do recrutador" : "Resultado: retorno do recrutador") : "Retorno do recrutador"}
          </p>
          <p className="mt-3 text-[17px] leading-relaxed text-deep-space">"{feedback}"</p>
        </section>
      )}

      {a.step === 2 && !a.result && (
        <section className="rounded-2xl bg-lemon p-5 text-lemon-ink ring-1 ring-lemon-ink/20 shadow-[var(--shadow-card)]">
          <p className="label-mono">Sua entrevista</p>
          {interview ? (
            <>
              <p className="mt-1 font-display text-xl font-extrabold">{new Date(interview.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
              <ul className="mt-3 space-y-2 text-[15px] font-medium">
                <li className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> {new Date(interview.date + "T12:00:00").toLocaleDateString("pt-BR")}</li>
                <li className="flex items-center gap-2"><Clock className="h-5 w-5" /> {interview.time}</li>
                <li className="flex items-center gap-2">{interview.link ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />} {interview.place}</li>
              </ul>
              {interview.link && (
                <a href={interview.link} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-12 items-center justify-center rounded-lg bg-deep-space font-semibold text-primary-foreground">Abrir link da entrevista</a>
              )}
            </>
          ) : (
            <p className="mt-1 text-[15px]">A empresa ainda não informou dia, horário e local. Você será avisado aqui assim que for marcado.</p>
          )}
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="flex items-center gap-2 font-display font-bold text-deep-space"><Sparkles className="h-5 w-5 text-recommended-foreground" /> Pontos fortes</p>
          <div className="mt-3 flex flex-wrap gap-2">{a.strengths.map((s) => <SkillChip key={s} name={s} />)}</div>
        </Card>
        <Card>
          <p className="flex items-center gap-2 font-display font-bold text-deep-space"><TrendingUp className="h-5 w-5 text-primary" /> A desenvolver</p>
          <div className="mt-3 flex flex-wrap gap-2">{a.toDevelop.map((s) => <SkillChip key={s} name={s} />)}</div>
        </Card>
      </div>

      <Card>
        <p className="font-display font-bold text-deep-space">Linha do tempo</p>
        <ol className="mt-3 space-y-3 border-l-2 border-neutral-tag pl-4">
          {timeline.map((t) => (
            <li key={t.t} className="relative">
              <span className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full ${t.done ? "bg-moss" : "bg-neutral-tag"}`} />
              <p className={t.done ? "font-medium text-deep-space" : "text-muted-foreground"}>{t.t}</p>
              {t.done && t.d && <p className="label-mono text-muted-foreground">{new Date(t.d).toLocaleDateString("pt-BR")}</p>}
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <p className="font-display font-bold text-deep-space">Detalhes enviados</p>
        {doc && <div className="mt-2"><DocChip title={doc.title} /></div>}
        {a.message && <p className="mt-2 text-sm text-muted-foreground">"{a.message}"</p>}
      </Card>

      <Link to="/estudante/mensagens" search={{ t: thread?.id ?? `new-${j.id}` }} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground">
        <MessageCircle className="h-5 w-5" /> Chat com recrutador
      </Link>
    </div>
  );
}
