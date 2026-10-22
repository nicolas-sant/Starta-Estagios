import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Eye, Home, LayoutList, LogOut, Menu, MessageCircle, Search, Settings, User, X } from "lucide-react";
import { Logo } from "@/components/starta/ui";
import { setState, threadUnread, useStore, type RecruiterJob } from "@/lib/store";
import { listPublicJobs } from "@/lib/public-jobs.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante")({
  loader: () => listPublicJobs(),
  errorComponent: () => <p className="p-6">Não foi possível carregar as vagas. Atualize a página para tentar novamente.</p>,
  notFoundComponent: () => <p className="p-6">Página não encontrada.</p>,
  component: StudentLayout,
});

const NAV = [
  { to: "/estudante", label: "Feed", icon: Home, exact: true },
  { to: "/estudante/buscar", label: "Buscar", icon: Search },
  { to: "/estudante/painel", label: "Painel", icon: LayoutList },
  { to: "/estudante/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/estudante/perfil", label: "Perfil", icon: User },
] as const;

function StudentLayout() {
  const publicJobs = Route.useLoaderData();
  useEffect(() => {
    if (!publicJobs.length) return;
    const loaded = publicJobs.flatMap((row) => {
      if (!row.job || typeof row.job !== "object" || Array.isArray(row.job)) return [];
      const job = row.job as unknown as RecruiterJob;
      const status = row.status === "filled" ? "filled" as const : row.status === "deleted" ? "deleted" as const : "published" as const;
      return typeof job.id === "string" && Array.isArray(job.skills) ? [{ ...job, status, published: status === "published" }] : [];
    });
    setState((s) => ({ ...s, recruiterJobs: [...s.recruiterJobs.filter((j) => !loaded.some((r) => r.id === j.id)), ...loaded] }));
  }, [publicJobs]);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const views = useStore((s) => s.student.cvViews7d);
  const notifs = useStore((s) => s.notifications);
  const settings = useStore((s) => s.settings);
  const unread = notifs.filter((n) => !n.read).length;
  const threads = useStore((s) => s.threads);
  const unreadMsgs = threads.filter(threadUnread).length;
  const badge = (to: string) => (to === "/estudante/painel" ? unread : to === "/estudante/mensagens" ? unreadMsgs : 0);

  return (
    <div className={cn("min-h-screen bg-background pb-20 lg:grid lg:grid-cols-[240px_1fr] lg:pb-0", settings.largeText && "text-[17px]")}>
      <header className="sticky top-0 z-30 flex h-16 lg:hidden items-center justify-between border-b border-border bg-card/95 px-2 backdrop-blur">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-mint">
          <Menu className="h-6 w-6 text-deep-space" />
        </button>
        <Logo />
        <Link to="/estudante/painel" aria-label="Notificações" className="relative flex h-12 w-12 items-center justify-center rounded-xl hover:bg-mint">
          <Bell className="h-6 w-6 text-deep-space" />
          {unread > 0 && <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
        </Link>
      </header>

      {/* Drawer */}
      <div className={cn("fixed inset-0 z-40 bg-deep-space/40 transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setOpen(false)} />
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-sidebar p-4 text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:border-r lg:border-border lg:transition-none", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-12 items-center justify-between">
          <Logo light />
          <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="lg:hidden flex h-12 w-12 items-center justify-center rounded-xl hover:bg-sidebar-accent">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex h-12 items-center gap-3 rounded-xl px-3 hover:bg-sidebar-accent">
              <n.icon className="h-5 w-5" /> {n.label}
              {badge(n.to) > 0 && <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-lemon px-1.5 text-xs font-bold text-deep-space" aria-label={`${badge(n.to)} novidades`}>{badge(n.to)}</span>}
            </Link>
          ))}
          <div className="mt-auto" />
          <Link to="/estudante/perfil" hash="configuracoes" onClick={() => setOpen(false)} className="flex h-12 items-center gap-3 rounded-xl px-3 hover:bg-sidebar-accent">
            <Settings className="h-5 w-5" /> Configurações
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-3">
            <Eye className="h-5 w-5 shrink-0 text-moss" />
            <span className="text-sm">
              Currículo visualizado <strong className="text-lemon">{views} vezes</strong> nos últimos 7 dias
            </span>
          </div>
          <button
            onClick={() => {
              setState((s) => ({ ...s, role: null }));
              nav({ to: "/" });
            }}
            className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" /> Logoff
          </button>
        </nav>
      </aside>

      <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-6 lg:max-w-none lg:px-8 lg:py-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 h-16 lg:hidden border-t border-border bg-card">
        <ul className="mx-auto flex h-full max-w-2xl justify-around">
          {NAV.map((n) => (
            <li key={n.to} className="flex-1">
              <Link
                to={n.to}
                activeOptions={{ exact: "exact" in n }}
                className="relative flex h-full min-w-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground"
                activeProps={{ className: "text-primary" }}
              >
                <n.icon className="h-6 w-6" strokeWidth={1.8} />
                {badge(n.to) > 0 && <span className="absolute left-1/2 top-1.5 ml-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" aria-hidden />}
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
