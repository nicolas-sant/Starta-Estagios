import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Briefcase, ShieldCheck, Eye, MessageSquareText } from "lucide-react";
import { Field, Logo, PrimaryButton } from "@/components/starta/ui";
import { getState, setState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Starta — Entrar ou criar conta" },
      { name: "description", content: "Entre na Starta: estágios com bolsa visível, progresso do processo seletivo e retorno garantido." },
      { property: "og:title", content: "Starta — Entrar ou criar conta" },
      { property: "og:description", content: "Estágios com transparência e retorno para estudantes e recrutadores." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "cadastro">("cadastro");
  const [role, setRole] = useState<"estudante" | "recrutador">("estudante");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Informe um e-mail válido.");
    if (pwd.length < 6) return setErr("A senha precisa ter ao menos 6 caracteres.");
    setErr("");
    setState((s) => ({ ...s, role, email }));
    const s = getState();
    if (role === "recrutador") {
      nav({ to: s.company.verification === "aprovado" && mode === "login" ? "/recrutador" : "/empresa-cadastro" });
      return;
    }
    if (!s.student.onboardingDone) nav({ to: "/onboarding" });
    else if (s.student.verification !== "aprovado") nav({ to: "/verificacao" });
    else if (!s.student.profileDone) nav({ to: "/perfil-setup" });
    else nav({ to: "/estudante" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-deep-space p-12 lg:flex">
        <Logo light />
        <div>
          <p className="label-mono text-moss">5,5% dos estudantes conseguem estágio</p>
          <h1 className="mt-3 max-w-md text-4xl leading-tight text-primary-foreground">Nada desaparece. Toda candidatura tem resposta.</h1>
          <ul className="mt-8 space-y-4 text-primary-foreground/80">
            {[
              [ShieldCheck, "Vagas com bolsa e requisitos sempre visíveis"],
              [Eye, "Acompanhe cada etapa do processo seletivo"],
              [MessageSquareText, "Retorno do recrutador, mesmo que negativo"],
            ].map(([Icon, t], i) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lemon text-deep-space">
                    <I className="h-5 w-5" />
                  </span>
                  {t as string}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/50">© Starta 2026</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-3xl text-deep-space">{mode === "cadastro" ? "Crie sua conta" : "Bem-vindo de volta"}</h2>
          <p className="mt-1 text-muted-foreground">{mode === "cadastro" ? "Comece em menos de 3 minutos." : "Entre para acompanhar seus processos."}</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-neutral-tag p-1">
            {(["login", "cadastro"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn("h-11 rounded-lg text-sm font-semibold", mode === m ? "bg-card text-deep-space shadow-sm" : "text-muted-foreground")}>
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-deep-space">Eu sou</span>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["estudante", "Estudante", GraduationCap],
                    ["recrutador", "Empresa", Briefcase],
                  ] as const
                ).map(([k, l, I]) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setRole(k)}
                    className={cn("flex h-14 items-center gap-2 rounded-xl border-2 px-4 font-semibold", role === k ? "border-primary bg-essential text-essential-foreground" : "border-border bg-card text-deep-space")}
                  >
                    <I className="h-5 w-5" /> {l}
                  </button>
                ))}
              </div>
            </div>
            <Field label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" maxLength={255} />
            <Field label="Senha" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••" maxLength={72} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <PrimaryButton type="submit" className="w-full">
              {mode === "cadastro" ? "Criar conta" : "Entrar"}
            </PrimaryButton>
            <p className="text-center text-xs text-muted-foreground">Protótipo: os dados ficam salvos apenas neste navegador.</p>
          </form>
        </div>
      </main>
    </div>
  );
}
