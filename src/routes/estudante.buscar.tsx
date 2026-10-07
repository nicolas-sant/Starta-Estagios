import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { JobCard } from "@/components/starta/ui";
import { AREAS, JOBS, hasTrustSeal, rankScore, type Modality } from "@/lib/data";
import { allJobs, getState, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante/buscar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Buscar estágios — Starta" },
      { name: "description", content: "Filtre estágios por área, modalidade, bolsa mínima e selo de confiança." },
      { property: "og:title", content: "Buscar estágios — Starta" },
      { property: "og:description", content: "Encontre o estágio certo com filtros transparentes." },
    ],
  }),
  component: Buscar,
});

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("h-11 shrink-0 rounded-full border px-4 text-sm font-semibold", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-deep-space")}>
      {children}
    </button>
  );
}

function Buscar() {
  const apps = useStore((s) => s.applications);
  const extra = useStore((s) => s.recruiterJobs);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [mod, setMod] = useState<Modality | "">("");
  const [minStipend, setMin] = useState(0);
  const [onlySeal, setOnlySeal] = useState(false);
  const [showFilters, setShow] = useState(true);

  const jobs = allJobs({ ...getState(), recruiterJobs: extra })
    .filter((j) => (q ? (j.title + j.summary + j.skills.map((s) => s.name).join(" ")).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((j) => (area ? j.area === area : true))
    .filter((j) => (mod ? j.modality === mod : true))
    .filter((j) => j.stipend >= minStipend)
    .filter((j) => (onlySeal ? hasTrustSeal(j) : true))
    .sort((a, b) => rankScore(b) - rankScore(a));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-deep-space">Buscar</h1>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cargo, habilidade…" className="h-12 w-full rounded-[10px] border border-border bg-card pl-12 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <button onClick={() => setShow(!showFilters)} aria-label="Filtros" className={cn("flex h-12 w-12 items-center justify-center rounded-[10px] border", showFilters ? "border-primary bg-essential text-primary" : "border-border bg-card")}>
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="label-mono mb-2 text-muted-foreground">Área</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Chip on={!area} onClick={() => setArea("")}>Todas</Chip>
              {AREAS.map((a) => (
                <Chip key={a} on={area === a} onClick={() => setArea(a)}>{a}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono mb-2 text-muted-foreground">Modalidade</p>
            <div className="flex flex-wrap gap-2">
              {(["", "Presencial", "Híbrido", "Remoto"] as const).map((m) => (
                <Chip key={m} on={mod === m} onClick={() => setMod(m)}>{m || "Todas"}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono mb-2 text-muted-foreground">Bolsa mínima: R$ {minStipend.toLocaleString("pt-BR")}</p>
            <input type="range" min={0} max={2500} step={100} value={minStipend} onChange={(e) => setMin(+e.target.value)} className="w-full accent-[var(--dusk)]" />
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-deep-space">
            <input type="checkbox" checked={onlySeal} onChange={(e) => setOnlySeal(e.target.checked)} className="h-5 w-5 accent-[var(--dusk)]" />
            Somente vagas com selo de confiança
          </label>
        </div>
      )}

      <p className="label-mono text-muted-foreground">{jobs.length} resultados</p>
      <div className="space-y-3">
        {jobs.map((j) => (
          <JobCard key={j.id} job={j} applied={apps.some((a) => a.jobId === j.id)} />
        ))}
        {!jobs.length && <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground">Nenhuma vaga com esses filtros. Tente ampliar a busca.</p>}
      </div>
    </div>
  );
}
