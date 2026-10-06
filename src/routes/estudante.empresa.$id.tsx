import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, MapPin, Building2 } from "lucide-react";
import { CompanyAvatar, JobCard, NeutralTag, VerifiedSeal } from "@/components/starta/ui";
import { COMPANIES, JOBS, hasReachPenalty } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/estudante/empresa/$id")({
  head: ({ params }) => {
    const c = COMPANIES.find((x) => x.id === params.id);
    const t = c ? `${c.name} — vagas na Starta` : "Empresa — Starta";
    const d = c?.about ?? "Perfil da empresa.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: EmpresaPage,
  notFoundComponent: () => <p className="p-6 text-center">Empresa não encontrada.</p>,
});

function EmpresaPage() {
  const { id } = Route.useParams();
  const apps = useStore((s) => s.applications);
  const extra = useStore((s) => s.recruiterJobs);
  const c = COMPANIES.find((x) => x.id === id);
  if (!c) throw notFound();
  const jobs = [...JOBS, ...extra.filter((j) => j.published && !JOBS.some((b) => b.id === j.id))].filter((j) => j.companyId === c.id);

  return (
    <div className="space-y-4">
      <button onClick={() => history.back()} className="flex h-11 items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-5 w-5" /> Voltar</button>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="h-28 bg-deep-space" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, var(--dusk), transparent 60%), radial-gradient(circle at 10% 90%, var(--moss), transparent 45%)" }} />
        <div className="p-4">
          <div className="-mt-12 rounded-2xl border-4 border-card inline-block"><CompanyAvatar initials={c.initials} size={72} /></div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl text-deep-space">{c.name}</h1>
            {c.verified ? <VerifiedSeal label="Empresa verificada" /> : <NeutralTag>Não verificada</NeutralTag>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <NeutralTag icon={<Building2 className="h-3.5 w-3.5" />}>{c.sector} · {c.size}</NeutralTag>
            <NeutralTag icon={<MapPin className="h-3.5 w-3.5" />}>{c.city}</NeutralTag>
          </div>
          <p className="mt-3 text-[15px] text-deep-space/80">{c.about}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-mint p-3"><p className="font-display text-xl font-extrabold text-deep-space">{jobs.length}</p><p className="label-mono text-muted-foreground">vagas</p></div>
            <div className="rounded-xl bg-mint p-3"><p className="font-display text-xl font-extrabold text-deep-space">{c.responseRate}%</p><p className="label-mono text-muted-foreground">retorno</p></div>
            <div className="rounded-xl bg-mint p-3"><p className="font-display text-xl font-extrabold text-deep-space">{c.avgResponseDays}d</p><p className="label-mono text-muted-foreground">resposta</p></div>
          </div>
          {hasReachPenalty(c.id) && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Penalidade de alcance: baixa taxa de retorno aos candidatos.</p>
          )}
        </div>
      </div>
      <h2 className="text-lg text-deep-space">Vagas publicadas</h2>
      <div className="space-y-3">{jobs.map((j) => <JobCard key={j.id} job={j} applied={apps.some((a) => a.jobId === j.id)} />)}</div>
    </div>
  );
}
