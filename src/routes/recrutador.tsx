import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Logo, VerifiedSeal } from "@/components/starta/ui";
import { useStore } from "@/lib/store";
import { LayoutDashboard, MessageSquare, LogOut, ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecruiterCloud } from "@/components/starta/recruiter-cloud";
import { backOrRecruiter } from "@/lib/recruiter";
import { cn } from "@/lib/utils";

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

const ACTIVE = "rounded-lg bg-primary text-primary-foreground font-semibold";
const IDLE = "rounded-lg text-muted-foreground hover:bg-muted";

function Recrutador() {
  const company = useStore((s) => s.company);
  const path = useLocation().pathname;
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col border-b border-border bg-card p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <Logo />
        <p className="mt-1 text-xs text-muted-foreground">Área do recrutador</p>
        <div className="mt-8 flex items-center gap-3 border-y border-border py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-deep-space font-bold text-primary-foreground">
            ML
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{company.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Porto Digital · Recife</p>
          </div>
        </div>
        <nav className="mt-8 flex gap-2 lg:flex-col">
          <Link
            to="/recrutador"
            className={cn(
              "flex min-h-12 items-center gap-3 px-3 py-3 text-sm",
              !path.includes("mensagens") ? ACTIVE : IDLE,
            )}
          >
            <LayoutDashboard className="size-4" />
            Recrutamento
          </Link>
          <Link
            to="/recrutador/mensagens"
            className={cn(
              "flex min-h-12 items-center gap-3 px-3 py-3 text-sm",
              path.includes("mensagens") ? ACTIVE : IDLE,
            )}
          >
            <MessageSquare className="size-4" />
            Mensagens
          </Link>
        </nav>
        <div className="mt-auto hidden border-t border-border pt-5 lg:block">
          <p className="text-sm font-semibold">Rafael Nogueira</p>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">Analista de R&S</p>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <LogOut className="size-4" />
            Sair
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button asChild variant="outline" size="lg">
              <Link to="/recrutador">
                <Home />
                Início
              </Link>
            </Button>
            {path.replace(/\/$/, "") !== "/recrutador" && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() =>
                  backOrRecruiter(
                    window.history.length,
                    () => window.history.back(),
                    () => void navigate({ to: "/recrutador" }),
                  )
                }
              >
                <ArrowLeft />
                Voltar
              </Button>
            )}
            <ChevronRight className="size-4 text-muted-foreground" />
            <span className="font-semibold">
              {path.includes("mensagens")
                ? "Mensagens"
                : path.includes("nova")
                  ? "Publicar vaga"
                  : path.includes("vagas")
                    ? "Editar vaga"
                    : "Recrutamento"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {company.verification === "aprovado" && <VerifiedSeal small />}
            <RecruiterCloud />
          </div>
        </header>
        <main className="p-5 lg:p-8">
          <div className="xl:mx-auto xl:max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
