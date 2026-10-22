import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { JobCard, SectionTitle } from "@/components/starta/ui";
import { JOBS, rankScore } from "@/lib/data";
import { allJobs, getState, daysUntil, useStore } from "@/lib/store";

export const Route = createFileRoute("/estudante/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Feed de vagas — Starta" },
      { name: "description", content: "Vagas de estágio com bolsa, requisitos e selo de confiança, ranqueadas para você." },
      { property: "og:title", content: "Feed de vagas — Starta" },
      { property: "og:description", content: "Estágios transparentes perto de você." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const st = useStore((s) => s.student);
  const apps = useStore((s) => s.applications);
  const extra = useStore((s) => s.recruiterJobs);
  const jobs = allJobs({ ...getState(), recruiterJobs: extra });
  const mySkills = (st.skills ?? []).map((x) => x.toLowerCase());
  const matchOf = (j: (typeof jobs)[number]) => {
    const reasons: string[] = [];
    if (st.city && j.city === st.city) reasons.push("Na sua cidade");
    const hits = j.skills.filter((k) => mySkills.includes(k.name.toLowerCase())).map((k) => k.name);
    if (hits.length) reasons.push(`Você tem: ${hits.join(", ")}`);
    return hits.length ? reasons : [];
  };
  const sorted = [...jobs].sort((a, b) => {
    const ia = (st.interests.includes(a.area) ? 30 : 0) + (matchOf(a).length ? 50 : 0);
    const ib = (st.interests.includes(b.area) ? 30 : 0) + (matchOf(b).length ? 50 : 0);
    return rankScore(b) + ib - (rankScore(a) + ia);
  });
  const d = daysUntil(st.validUntil);
  const expiring = st.verification === "aprovado" && d <= 15;

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono text-muted-foreground">{st.city || "Brasil"}</p>
        <h1 className="text-2xl text-deep-space lg:text-3xl">Olá{st.name ? `, ${st.name.split(" ")[0]}` : ""}!</h1>
      </div>

      {(!st.profileDone || st.verification !== "aprovado") && (
        <Link to={st.onboardingDone ? "/verificacao" : "/onboarding"} className="flex items-center gap-3 rounded-2xl bg-lemon p-4 text-deep-space">
          <ShieldCheck className="h-6 w-6 shrink-0" />
          <span className="text-sm"><strong>Conclua seu cadastro</strong> para se candidatar com selo de estudante verificado.</span>
        </Link>
      )}
      {expiring && (
        <Link to="/estudante/perfil" className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-neutral-tag p-4 text-deep-space">
          <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
          <span className="text-sm">{d < 0 ? "Sua verificação venceu. Reenvie o comprovante." : `Sua verificação vence em ${d} dias. Reenvie o comprovante.`}</span>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {[
          [apps.length, "candidaturas"],
          [apps.filter((a) => !a.result).length, "em andamento"],
          [apps.filter((a) => a.feedback || a.step > 0).length, "com retorno"],
        ].map(([n, l]) => (
          <div key={l as string} className="rounded-2xl bg-card p-3 text-center lg:p-5 shadow-[var(--shadow-card)]">
            <p className="font-display text-2xl font-extrabold text-primary">{n}</p>
            <p className="label-mono text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <section>
        <SectionTitle action={<span className="label-mono text-muted-foreground">{sorted.length} vagas</span>}>Para você</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {sorted.map((j) => (
            <JobCard key={j.id} job={j} match={matchOf(j)} applied={apps.some((a) => a.jobId === j.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
