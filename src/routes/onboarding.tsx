import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { GhostButton, Logo, OnboardingProgress, PrimaryButton } from "@/components/starta/ui";
import { AREAS, CITIES } from "@/lib/data";
import { setState, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Onboarding — Starta" },
      { name: "description", content: "Conte que tipo de vaga te interessa e em qual cidade você está." },
      { property: "og:title", content: "Onboarding — Starta" },
      { property: "og:description", content: "Personalize seu feed de estágios." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const nav = useNavigate();
  const student = useStore((s) => s.student);
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>(student.interests);
  const [city, setCity] = useState(student.city);
  const [q, setQ] = useState(student.city);
  const results = CITIES.filter((c) => c.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

  const finish = () => {
    setState((s) => ({ ...s, student: { ...s.student, interests, city, onboardingDone: true } }));
    nav({ to: "/verificacao" });
  };

  return (
    <SetupShell step={step} total={4} label={step === 1 ? "Tipo de vaga" : "Cidade"}>
      {step === 1 ? (
        <>
          <h1 className="min-h-[2lh] text-2xl text-deep-space">Que tipo de vaga te interessa?</h1>
          <p className="mt-1 text-muted-foreground">Escolha uma ou mais áreas.</p>
          <div className="mt-6 grid min-h-[372px] grid-cols-2 content-start gap-2">
            {AREAS.map((a) => {
              const on = interests.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => setInterests(on ? interests.filter((x) => x !== a) : [...interests, a])}
                  className={cn("flex min-h-12 items-center justify-between rounded-xl border-2 px-4 text-left text-sm font-semibold", on ? "border-primary bg-essential text-essential-foreground" : "border-border bg-card text-deep-space")}
                >
                  {a}
                  {on && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex gap-3">
            <GhostButton className="invisible" aria-hidden tabIndex={-1}>Voltar</GhostButton>
            <PrimaryButton className="flex-1" disabled={!interests.length} onClick={() => setStep(2)}>
              Continuar
            </PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <h1 className="min-h-[2lh] text-2xl text-deep-space">Qual sua cidade?</h1>
          <p className="mt-1 text-muted-foreground">Mostramos primeiro as vagas perto de você.</p>
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCity("");
              }}
              placeholder="Buscar cidade"
              className="h-12 w-full rounded-lg border border-border bg-card pl-12 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <p className="mt-3 h-5 text-sm font-semibold text-primary">{city ? `Selecionada: ${city}` : ""}</p>
          <ul className="mt-1 h-[288px] space-y-1 overflow-y-auto">
            {!results.length && <li className="p-3 text-sm text-muted-foreground">Nenhuma cidade encontrada.</li>}
            {results.map((c) => (
              <li key={c}>
                <button
                  onClick={() => {
                    setCity(c);
                    setQ(c);
                  }}
                  className={cn("flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left", city === c ? "bg-essential font-semibold text-essential-foreground" : "hover:bg-mint")}
                >
                  <MapPin className="h-5 w-5" /> {c}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <GhostButton onClick={() => setStep(1)}>Voltar</GhostButton>
            <PrimaryButton className="flex-1" disabled={!city} onClick={finish}>
              Continuar
            </PrimaryButton>
          </div>
        </>
      )}
    </SetupShell>
  );
}

export function SetupShell({ step, total, label, children }: { step: number; total: number; label: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center border-b border-border bg-card px-4">
        <Logo />
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <OnboardingProgress label={label} step={step} total={total} />
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
