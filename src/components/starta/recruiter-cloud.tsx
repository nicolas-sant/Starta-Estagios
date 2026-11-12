import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Cloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { loadWorkspace, persistWorkspace } from "@/lib/recruiter.functions";
import { getState, setState, useStore, type State } from "@/lib/store";

export function RecruiterCloud() {
  const jobs = useStore((s) => s.recruiterJobs);
  const candidates = useStore((s) => s.candidates);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [label, setLabel] = useState("Salvar na nuvem");
  const owner = useRef<string | null>(null);
  const load = useServerFn(loadWorkspace);
  const save = useServerFn(persistWorkspace);
  const persist = async () => {
    const s = getState();
    await save({
      data: {
        state: { recruiterJobs: s.recruiterJobs, candidates: s.candidates, company: s.company },
        jobs: s.recruiterJobs.map((j) => ({
          id: j.id,
          companyId: j.companyId,
          status: j.status || (j.published ? "published" : "filled"),
          job: { ...j },
        })),
      },
    });
  };
  const initialize = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session || owner.current === data.session.user.id) return;
    owner.current = data.session.user.id;
    try {
      setLabel("Conectando…");
      const snapshot = await load();
      if (snapshot && typeof snapshot === "object") {
        const stored = snapshot as unknown as Partial<State>;
        setState((s) => ({
          ...s,
          recruiterJobs: stored.recruiterJobs || s.recruiterJobs,
          candidates: stored.candidates || s.candidates,
          company: stored.company || s.company,
        }));
      }
      await persist();
      setReady(true);
      setLabel("Salvo na nuvem");
    } catch (e) {
      setLabel("Falha ao salvar");
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
      owner.current = null;
    }
  };
  useEffect(() => {
    void initialize();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setTimeout(() => void initialize(), 0);
      if (event === "SIGNED_OUT") {
        owner.current = null;
        setReady(false);
        setLabel("Salvar na nuvem");
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!ready) return;
    setLabel("Salvando…");
    const timer = setTimeout(() => {
      void persist()
        .then(() => setLabel("Salvo na nuvem"))
        .catch(() => setLabel("Falha ao salvar"));
    }, 700);
    return () => clearTimeout(timer);
  }, [jobs, candidates, ready]);
  const authenticate = async (signup: boolean) => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/recrutador` },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.session) {
        setInfo("Confirme seu e-mail para ativar sua conta e salvar na nuvem.");
        return;
      }
      await initialize();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Cloud />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl p-5">
          <DialogTitle>{ready ? "Sua área está conectada" : "Conta do recrutador"}</DialogTitle>
          <DialogDescription>
            {ready
              ? "Vagas e candidatos são salvos na sua conta."
              : "Entre para salvar suas vagas e usar as perguntas de entrevista por IA."}
          </DialogDescription>
          {ready ? (
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                setOpen(false);
              }}
            >
              Desconectar conta
            </Button>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void authenticate(false);
              }}
            >
              <label className="block text-sm">
                E-mail
                <Input
                  type="email"
                  required
                  value={email}
                  className="mt-3 h-11 rounded-lg"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Senha
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  className="mt-3 h-11 rounded-lg"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <Button disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}Entrar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void authenticate(true)}
                >
                  Criar conta
                </Button>
              </div>
            </form>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {info && <p className="text-sm text-primary">{info}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
