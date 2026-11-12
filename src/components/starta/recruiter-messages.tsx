import { useState } from "react";
import { Send, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { sendCandidateMessage } from "@/lib/recruiter";
import { cn } from "@/lib/utils";

export function RecruiterMessages() {
  const candidates = useStore((s) => s.candidates);
  const jobs = useStore((s) => s.recruiterJobs);
  const [activeId, setActive] = useState(candidates[0]?.id || "");
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const active = candidates.find((c) => c.id === activeId);
  return (
    <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[300px_1fr]">
      <aside className="border-b border-border md:border-b-0 md:border-r">
        <div className="relative p-5">
          <Search className="absolute left-8 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar conversa"
            className="h-11 rounded-lg pl-9"
            placeholder="Buscar candidato…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto md:max-h-[600px]">
          {candidates
            .filter((c) =>
              `${c.name} ${jobs.find((j) => j.id === c.jobId)?.title}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((c) => (
              <Button
                key={c.id}
                variant="ghost"
                className={cn(
                  "h-auto w-full justify-start rounded-lg border-b border-border px-4 py-4 text-left",
                  activeId === c.id && "bg-essential",
                )}
                onClick={() => setActive(c.id)}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {c.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                    {jobs.find((j) => j.id === c.jobId)?.title || "Vaga encerrada"}
                  </span>
                  <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                    {c.chat.at(-1)?.text || "Nenhuma mensagem"}
                  </span>
                </span>
              </Button>
            ))}
        </div>
      </aside>
      <section className="flex min-w-0 flex-col">
        {active ? (
          <>
            <header className="border-b border-border p-5">
              <h2 className="text-lg">{active.name}</h2>
              <p className="mt-3 text-xs text-muted-foreground">
                {jobs.find((j) => j.id === active.jobId)?.title}
              </p>
            </header>
            <div className="flex max-h-[500px] min-h-72 flex-1 flex-col gap-3 overflow-y-auto p-5">
              {!active.chat.length && (
                <div className="m-auto text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-3 size-8" />
                  <p className="text-sm">Nenhuma mensagem ainda.</p>
                </div>
              )}
              {active.chat.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-xl p-3 text-sm",
                    m.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(m.at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
            <form
              className="flex items-end gap-3 border-t border-border p-5"
              onSubmit={(e) => {
                e.preventDefault();
                sendCandidateMessage(active.id, text);
                setText("");
              }}
            >
              <Textarea
                aria-label="Escreva uma mensagem"
                className="rounded-lg"
                rows={2}
                maxLength={2000}
                placeholder="Escreva uma mensagem…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button
                aria-label="Enviar mensagem"
                title="Enviar mensagem"
                size="icon"
                disabled={!text.trim()}
              >
                <Send />
              </Button>
            </form>
          </>
        ) : (
          <p className="p-8 text-muted-foreground">Selecione um candidato.</p>
        )}
      </section>
    </div>
  );
}
