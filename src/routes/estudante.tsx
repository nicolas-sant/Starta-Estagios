import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Home, LayoutList, LogOut, Menu, MessageCircle, Search, Settings, User, X } from "lucide-react";
import { Logo } from "@/components/starta/ui";
import { setState, threadUnread, useStore, type RecruiterJob } from "@/lib/store";
import { listPublicJobs } from "@/lib/public-jobs.functions";
import { cn } from "@/lib/utils";
import { readNavMode, writeNavMode, type NavMode } from "@/lib/nav-mode";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const ACTIVE = "border-primary font-semibold";

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
  const [isDesktop, setIsDesktop] = useState(true);
  const [navMode, setNavMode] = useState<NavMode>("top");
  useEffect(() => {
    setNavMode(readNavMode());
  }, []);
  const toggleMode = () => {
    const next: NavMode = navMode === "top" ? "side" : "top";
    setNavMode(next);
    writeNavMode(next);
  };
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const nav = useNavigate();
  const name = useStore((s) => s.student.name);
  const notifs = useStore((s) => s.notifications);
  const settings = useStore((s) => s.settings);
  const unread = notifs.filter((n) => !n.read).length;
  const threads = useStore((s) => s.threads);
  const unreadMsgs = threads.filter(threadUnread).length;
  const badge = (to: string) => (to === "/estudante/painel" ? unread : to === "/estudante/mensagens" ? unreadMsgs : 0);
  const logoff = () => {
    setState((s) => ({ ...s, role: null }));
    nav({ to: "/" });
  };
  const initials = (name || "Estudante").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  const side = navMode === "side";
  const toggleLabel = side ? "Mover navegação para o topo" : "Mover navegação para a lateral";
  const ToggleButton = (
    <button type="button" onClick={toggleMode} aria-label={toggleLabel} title={toggleLabel} aria-pressed={side} className={cn("hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-muted lg:flex", FOCUS)}>
      <Menu className="h-6 w-6" />
    </button>
  );
  const Bell_ = (
    <Link to="/estudante/painel" aria-label="Notificações" className={cn("relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-deep-space hover:bg-muted", FOCUS)}>
      <Bell className="h-6 w-6" />
      {unread > 0 && <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
    </Link>
  );
  const Chip = ({ n }: { n: number }) => n > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground" aria-label={`${n} novidades`}>{n}</span> : null;

  return (
    <div className={cn("min-h-screen bg-background pb-20 lg:pb-0", side && "lg:grid lg:grid-cols-[240px_1fr]", settings.largeText && "text-[17px]")}>
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-2 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-primary hover:bg-muted", FOCUS)}>
          <Menu className="h-6 w-6" />
        </button>
        <Logo />
        {Bell_}
      </header>

      {/* Desktop top bar */}
      {!side && (
        <header className="sticky top-0 z-30 hidden h-16 border-b border-border bg-card lg:block">
          <div key="top" className="nav-fade mx-auto flex h-full w-full max-w-[1200px] items-center gap-3 px-4">
            {ToggleButton}
            <Logo />
            <nav aria-label="Principal" className="mx-auto flex items-center gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} activeProps={{ className: ACTIVE, "aria-current": "page" }} inactiveProps={{ className: "border-transparent font-medium" }} className={cn("flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-3 text-primary hover:bg-muted", FOCUS)}>
                  <n.icon className="h-5 w-5" /> {n.label}
                  <Chip n={badge(n.to)} />
                </Link>
              ))}
            </nav>
            {Bell_}
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Menu da conta" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground", FOCUS)}>
                {initials}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="h-11 rounded-lg">
                  <Link to="/estudante/perfil" hash="configuracoes"><Settings className="h-4 w-4" /> Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logoff} className="h-11 rounded-lg">
                  <LogOut className="h-4 w-4" /> Logoff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      {/* Drawer (mobile) / side column (desktop side mode) */}
      {open && <div className="fixed inset-0 z-40 bg-deep-space/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside inert={(!open && !isDesktop) || (isDesktop && !side) ? true : undefined} className={cn("fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-border bg-card p-4 text-deep-space transition-transform", side ? "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:transition-none" : "lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        <div key={side ? "side" : "drawer"} className="nav-fade flex flex-1 flex-col">
          <div className="flex h-12 items-center gap-2">
            {side && ToggleButton}
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className={cn("ml-auto flex h-12 w-12 items-center justify-center rounded-xl text-primary hover:bg-muted lg:hidden", FOCUS)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label="Principal" className="mt-8 flex flex-1 flex-col gap-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: "exact" in n }} activeProps={{ className: ACTIVE, "aria-current": "page" }} inactiveProps={{ className: "border-transparent font-medium" }} className={cn("flex h-12 items-center gap-3 rounded-lg border px-3 text-primary hover:bg-muted", FOCUS)}>
                <n.icon className="h-5 w-5" /> {n.label}
                <span className="ml-auto"><Chip n={badge(n.to)} /></span>
              </Link>
            ))}
            <div className="mt-auto" />
            <Link to="/estudante/perfil" hash="configuracoes" onClick={() => setOpen(false)} className={cn("flex h-12 items-center gap-3 rounded-lg border border-transparent px-3 font-medium text-primary hover:bg-muted", FOCUS)}>
              <Settings className="h-5 w-5" /> Configurações
            </Link>
            <button onClick={logoff} className={cn("flex h-12 w-full items-center gap-3 rounded-lg border border-transparent px-3 text-left font-medium text-primary hover:bg-muted", FOCUS)}>
              <LogOut className="h-5 w-5" /> Logoff
            </button>
          </nav>
        </div>
      </aside>

      <main className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-6 lg:py-8">
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
