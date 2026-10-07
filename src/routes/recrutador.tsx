import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, StageTag, VerifiedSeal } from "@/components/starta/ui";
import { STAGES } from "@/lib/data";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/recrutador")({
  head: () => ({
    meta: [
      { title: "Painel do recrutador — Starta" },
      { name: "description", content: "Pipeline Kanban de candidatos para recrutadores." },
      { property: "og:title", content: "Painel do recrutador — Starta" },
      { property: "og:description", content: "Gerencie candidatos com agilidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Recrutador,
});

function Recrutador() {
  const cands = useStore((s) => s.candidates);
  const company = useStore((s) => s.company);
  const move = (id: string, dir: -1 | 1) =>
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((c) => {
        if (c.id !== id) return c;
        const i = Math.min(Math.max(STAGES.indexOf(c.stage) + dir, 0), STAGES.length - 1);
        const stage = STAGES[i] ?? c.stage;
        return { ...c, stage };
      }),
    }));
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-deep-space">{company.name}</span>
          {company.verification === "aprovado" && <VerifiedSeal small />}
          <Link to="/" className="ml-2 text-sm font-semibold text-primary">Sair</Link>
        </div>
      </header>
      <main className="p-4">
        <h1 className="mb-4 text-2xl text-deep-space">Pipeline de candidatos</h1>
        <div className="grid gap-3 overflow-x-auto md:grid-cols-5">
          {STAGES.map((st) => (
            <section key={st} className="min-w-56 rounded-2xl bg-neutral-tag/60 p-3">
              <div className="mb-2 flex justify-between"><StageTag stage={st} /><span className="label-mono">{cands.filter((c) => c.stage === st).length}</span></div>
              <div className="space-y-2">
                {cands.filter((c) => c.stage === st).map((c) => (
                  <div key={c.id} className="rounded-xl bg-card p-3 shadow-[var(--shadow-card)]">
                    <p className="font-display font-bold text-deep-space">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.course} · {c.institution}</p>
                    <p className="label-mono mt-1 text-primary">{c.match}% match</p>
                    <div className="mt-2 flex gap-2">
                      <button className="h-9 flex-1 rounded-lg border border-border text-sm" onClick={() => move(c.id, -1)}>←</button>
                      <button className="h-9 flex-1 rounded-lg bg-primary text-sm text-primary-foreground" onClick={() => move(c.id, 1)}>Avançar</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
