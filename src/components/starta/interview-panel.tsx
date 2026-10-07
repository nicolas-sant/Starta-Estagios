import { useEffect, useRef, useState } from "react";
import { Sparkles, Square, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function InterviewPanel({ requirements: initialRequirements, profile: initialProfile }: { requirements: string; profile: string }) {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [profile, setProfile] = useState(initialProfile);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const generate = async () => {
    setError(""); setOutput(""); setLoading(true);
    const controller = new AbortController(); abort.current = controller;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Entre na sua conta pelo botão ‘Salvar na nuvem’ para usar a IA.");
      const response = await fetch("/api/interview", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ requirements, profile }), signal: controller.signal });
      if (!response.ok) { const payload = await response.json(); throw new Error(payload.message || "Não foi possível gerar perguntas."); }
      if (!response.body) throw new Error("A IA não retornou uma resposta.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let text = "";
      while (true) { const part = await reader.read(); if (part.done) break; text += decoder.decode(part.value, { stream: true }); setOutput(text.split("[STARTA_ERROR]")[0] || ""); }
      if (text.includes("[STARTA_ERROR]")) setError(text.split("[STARTA_ERROR]")[1] || "A geração foi interrompida.");
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Não foi possível gerar as perguntas."); }
    finally { setLoading(false); abort.current = null; }
  };
  return <section className="space-y-4">
    <div className="flex items-center gap-2"><Sparkles className="size-5 text-primary" /><h3>Perguntas de entrevista</h3></div>
    <div className="grid gap-4 md:grid-cols-2"><label className="space-y-2 text-sm font-medium">Requisitos da vaga<Textarea aria-label="Requisitos da vaga" value={requirements} onChange={(e) => setRequirements(e.target.value)} maxLength={16000} rows={5} /></label><label className="space-y-2 text-sm font-medium">Perfil do candidato<Textarea aria-label="Perfil do candidato" value={profile} onChange={(e) => setProfile(e.target.value)} maxLength={16000} rows={5} /></label></div>
    <div className="flex gap-2"><Button onClick={generate} disabled={loading || !requirements.trim() || !profile.trim()}>{loading ? <Loader2 className="animate-spin" /> : <Sparkles />} {loading ? "Gerando perguntas…" : "Gerar perguntas com IA"}</Button>{loading && <Button variant="outline" onClick={() => abort.current?.abort()}><Square />Parar</Button>}</div>
    {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {output && <div className="border-t border-border pt-4"><div className="mb-3 flex justify-between"><h4>Roteiro personalizado</h4><Button size="sm" variant="ghost" onClick={async () => { await navigator.clipboard.writeText(output); toast.success("Perguntas copiadas."); }}><Copy />Copiar</Button></div><div className="whitespace-pre-wrap text-sm leading-7">{output}</div></div>}
  </section>;
}