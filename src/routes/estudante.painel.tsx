import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight } from "lucide-react";
import { Card, CompanyAvatar, SectionTitle, Stepper } from "@/components/starta/ui";
import { JOBS, STUDENT_STEPS, getCompany } from "@/lib/data";
import { setState, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante/painel")({
  head: () => ({
    meta: [
      { title: "Minhas candidaturas — Starta" },
      { name: "description", content: "Acompanhe todos os seus processos seletivos em um só lugar." },
      { property: "og:title", content: "Minhas candidaturas — Starta" },
      { property: "og:description", content: "Progresso visível de cada candidatura." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const apps = useStore((s) => s.applications);
  const notifs = useStore((s) => s.notifications);
  const extra = useStore((s) => s.recruiterJobs);
  const findJob = (id: string) => JOBS.find((j) => j.id === id) ?? extra.find((j) => j.id === id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-deep-space">Painel</h1>

      <section>
        <SectionTitle action={<span className="label-mono text-muted-foreground">{apps.length} total</span>}>Vagas candidatadas</SectionTitle>
        <div className="space-y-3">
          {apps.map((a) => {
            const j = findJob(a.jobId);
            if (!j) return null;
            const c = getCompany(j.companyId);
            return (
              <Link key={a.jobId} to="/estudante/candidatura/$id" params={{ id: a.jobId }} className="block">
                <Card className="transition hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <CompanyAvatar initials={c?.initials ?? "?"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold text-deep-space">{j.title}</p>
                      <p className="text-sm text-muted-foreground">{c?.name}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <Stepper steps={STUDENT_STEPS} current={a.step} failed={a.result === "recusado"} />
                  </div>
                  <p className={cn("mt-3 text-sm font-medium", a.result === "recusado" ? "text-destructive" : a.result === "aprovado" ? "text-recommended-foreground" : "text-primary")}>
                    {a.result === "recusado" ? "Não selecionado · retorno disponível" : a.result === "aprovado" ? "Aprovado!" : `Etapa atual: ${STUDENT_STEPS[a.step]}`}
                  </p>
                </Card>
              </Link>
            );
          })}
          {!apps.length && <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground">Você ainda não se candidatou. Explore o feed!</p>}
        </div>
      </section>

      <section>
        <SectionTitle
          action={
            <button className="h-11 text-sm font-semibold text-primary" onClick={() => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))}>
              Marcar como lidas
            </button>
          }
        >
          Notificações
        </SectionTitle>
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li key={n.id} className={cn("flex items-start gap-3 rounded-2xl p-3", n.read ? "bg-card" : "bg-essential")}>
              <Bell className={cn("mt-0.5 h-5 w-5 shrink-0", n.read ? "text-muted-foreground" : "text-primary")} />
              <div className="flex-1">
                <p className="text-sm text-deep-space">{n.text}</p>
                <p className="label-mono text-muted-foreground">{new Date(n.at).toLocaleDateString("pt-BR")}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
