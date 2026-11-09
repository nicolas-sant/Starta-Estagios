import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight } from "lucide-react";
import { Card, CompanyAvatar, SectionTitle, Stepper } from "@/components/starta/ui";
import { JOBS, STUDENT_STEPS, getCompany } from "@/lib/data";
import { NOTIFICATION_LABEL, notificationKind, setState, sortNotifications, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante/painel")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Minhas candidaturas — Starta" },
      { name: "description", content: "Acompanhe todos os seus processos seletivos em um só lugar." },
      { property: "og:title", content: "Minhas candidaturas — Starta" },
      { property: "og:description", content: "Progresso visível de cada candidatura." },
    ],
  }),
  component: Painel,
});

function Painel() {
  const rawApps = useStore((s) => s.applications);
  const rawNotifs = useStore((s) => s.notifications);
  const rawExtra = useStore((s) => s.recruiterJobs);
  const apps = (Array.isArray(rawApps) ? rawApps : []).filter((a) => a && typeof a.jobId === "string").map((a) => ({ ...a, step: Math.min(Math.max(Number(a.step) || 0, 0), STUDENT_STEPS.length - 1) }));
  const notifs = sortNotifications(Array.isArray(rawNotifs) ? rawNotifs : []);
  const unread = notifs.filter((n) => !n.read).length;
  const extra = Array.isArray(rawExtra) ? rawExtra : [];
  const findJob = (id: string) => extra.find((j) => j?.id === id) ?? JOBS.find((j) => j.id === id);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-deep-space lg:text-3xl">Painel</h1>

      <section>
        <SectionTitle action={<span className="label-mono text-muted-foreground">{apps.length} total</span>}>Vagas candidatadas</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                      <p className="truncate font-display text-lg font-extrabold text-deep-space">{j.title}</p>
                      <p className="text-sm text-muted-foreground">{c?.name}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-3">
                    <Stepper steps={STUDENT_STEPS} current={a.step} failed={a.result === "recusado"} />
                  </div>
                  <p className={cn("mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold", a.result === "recusado" ? "bg-destructive/10 text-destructive" : a.result === "aprovado" ? "bg-recommended text-recommended-foreground" : a.step === 2 ? "bg-lemon text-lemon-ink ring-1 ring-lemon-ink/20" : "bg-essential text-essential-foreground")}>
                    {a.result === "recusado" ? "Não selecionado · retorno disponível" : a.result === "aprovado" ? "Candidatura aprovada!" : `Etapa atual: ${STUDENT_STEPS[a.step]}`}
                  </p>
                </Card>
              </Link>
            );
          })}
          {!apps.length && <p className="lg:col-span-2 rounded-2xl bg-card p-6 text-center text-muted-foreground">Você ainda não se candidatou. Explore o feed!</p>}
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
          <span className="flex items-center gap-2">
            Notificações
            {unread > 0 && <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">{unread} {unread === 1 ? "nova" : "novas"}</span>}
          </span>
        </SectionTitle>
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li key={n.id} className={cn("relative flex items-start gap-3 overflow-hidden rounded-2xl border p-5", n.read ? "border-border bg-card" : "border-primary/40 bg-essential shadow-[var(--shadow-card)]")}>
              {!n.read && <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-primary" />}
              <Bell className={cn("mt-0.5 h-5 w-5 shrink-0", n.read ? "text-muted-foreground" : "text-primary")} />
              <div className="flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", n.read ? "bg-neutral-tag text-muted-foreground" : notificationKind(n) === "retorno" ? "bg-lemon text-lemon-ink ring-1 ring-lemon-ink/20" : "bg-primary text-primary-foreground")}>{NOTIFICATION_LABEL[notificationKind(n)]}</span>
                  {!n.read && <span className="text-[11px] font-bold text-primary">● Não lida</span>}
                </p>
                <p className={cn("mt-1 text-sm text-deep-space", !n.read && "font-semibold")}>{n.text}</p>
                <p className="label-mono text-muted-foreground">{new Date(n.at).toLocaleDateString("pt-BR")}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
