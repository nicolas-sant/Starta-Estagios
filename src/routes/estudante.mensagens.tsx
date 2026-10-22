import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { z } from "zod";
import { CompanyAvatar } from "@/components/starta/ui";
import { JOBS, getCompany } from "@/lib/data";
import { setState, threadUnread, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudante/mensagens")({
  validateSearch: z.object({ t: z.string().optional() }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Mensagens — Starta" },
      { name: "description", content: "Converse com recrutadores sobre suas candidaturas." },
      { property: "og:title", content: "Mensagens — Starta" },
      { property: "og:description", content: "Chat direto com recrutadores." },
    ],
  }),
  component: Mensagens,
});

function Mensagens() {
  const { t } = Route.useSearch();
  const nav = useNavigate();
  const threads = useStore((s) => s.threads);
  const managed = useStore((s) => s.recruiterJobs);
  const jobs = [...managed, ...JOBS.filter((j) => !managed.some((m) => m.id === j.id))];
  const [text, setText] = useState("");

  let active = threads.find((x) => x.id === t);
  if (!active && t?.startsWith("new-")) {
    const jobId = t.slice(4);
    const j = jobs.find((x) => x.id === jobId);
    active = { id: t, jobId, with: `Recrutador · ${getCompany(j?.companyId ?? "")?.name ?? ""}`, messages: [] };
  }

  const activeId = active?.id;
  const activeLast = active?.messages[active.messages.length - 1]?.at;
  useEffect(() => {
    if (!activeId) return;
    setState((s) => (s.threads.some((x) => x.id === activeId && threadUnread(x)) ? { ...s, threads: s.threads.map((x) => (x.id === activeId ? { ...x, readAt: new Date().toISOString() } : x)) } : s));
  }, [activeId, activeLast]);
  const lastAt = (th: (typeof threads)[number]) => th.messages[th.messages.length - 1]?.at ?? "";
  const ordered = [...threads].sort((a, b) => lastAt(b).localeCompare(lastAt(a)));
  const fmtWhen = (iso: string) => {
    const d = new Date(iso);
    const today = new Date().toDateString() === d.toDateString();
    return today ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const send = () => {
    const v = text.trim().slice(0, 1000);
    if (!v || !active) return;
    const th = active;
    setState((s) => {
      const exists = s.threads.some((x) => x.id === th.id);
      const msg = { from: "me" as const, text: v, at: new Date().toISOString() };
      return { ...s, candidates: s.candidates.map((c) => c.studentLinked && c.jobId === th.jobId ? { ...c, chat: [...c.chat, { ...msg, from: "them" as const }] } : c), threads: exists ? s.threads.map((x) => (x.id === th.id ? { ...x, messages: [...x.messages, msg] } : x)) : [{ ...th, messages: [msg] }, ...s.threads] };
    });
    setText("");
  };

  if (active) {
    const j = jobs.find((x) => x.id === active.jobId);
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button onClick={() => nav({ to: "/estudante/mensagens", search: {} })} aria-label="Voltar" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-mint"><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <p className="font-display font-bold text-deep-space">{active.with}</p>
            <p className="text-xs text-muted-foreground">{j?.title}</p>
          </div>
        </div>
        <div className="flex-1 space-y-2 py-4">
          {active.messages.length === 0 && <p className="text-center text-sm text-muted-foreground">Envie a primeira mensagem.</p>}
          {active.messages.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] px-4 py-2.5 text-[15px]", m.from === "me" ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground" : "rounded-2xl rounded-bl-md bg-neutral-tag text-deep-space")}>
                {m.text}
                <p className="mt-1 text-[10px] opacity-60">{new Date(m.at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="sticky bottom-20 flex gap-2 bg-background pt-2">
          <input value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem" className="h-12 flex-1 rounded-[10px] border border-border bg-card px-4 outline-none focus:border-primary" />
          <button aria-label="Enviar" className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-deep-space lg:text-3xl">Mensagens</h1>
      <ul className="space-y-2">
        {ordered.map((th) => {
          const j = jobs.find((x) => x.id === th.jobId);
          const c = getCompany(j?.companyId ?? "");
          const last = th.messages[th.messages.length - 1];
          const unread = threadUnread(th);
          return (
            <li key={th.id}>
              <Link to="/estudante/mensagens" search={{ t: th.id }} className={cn("relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 shadow-[var(--shadow-card)]", unread ? "border-primary/40 bg-essential" : "border-border bg-card")}>
                {unread && <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-primary" />}
                <CompanyAvatar initials={c?.initials ?? "?"} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn("truncate font-display text-deep-space", unread ? "font-extrabold" : "font-bold")}>{th.with}</p>
                    {last && <span className={cn("shrink-0 text-xs", unread ? "font-bold text-primary" : "text-muted-foreground")}>{fmtWhen(last.at)}</span>}
                  </div>
                  {j && <p className="truncate text-xs text-muted-foreground">{j.title}</p>}
                  <div className="flex items-center gap-2">
                    <p className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-semibold text-deep-space" : "text-muted-foreground")}>{last ? `${last.from === "me" ? "Você: " : ""}${last.text}` : ""}</p>
                    {unread && <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">Nova</span>}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {!threads.length && <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground">Nenhuma conversa ainda.</p>}
      </ul>
    </div>
  );
}
