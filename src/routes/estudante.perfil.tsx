import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Accessibility, Lock, Settings, User, FileText } from "lucide-react";
import { Card, DocChip, PrimaryButton, ValiditySeal, VerifiedSeal, UploadArea } from "@/components/starta/ui";
import { AREAS } from "@/lib/data";
import { daysUntil, resetState, setState, useStore } from "@/lib/store";
import { submitStudentDoc } from "../routes/verificacao";

export const Route = createFileRoute("/estudante/perfil")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Meu perfil — Starta" },
      { name: "description", content: "Dados da conta, currículos por tipo de vaga, verificação e configurações." },
      { property: "og:title", content: "Meu perfil — Starta" },
      { property: "og:description", content: "Gerencie seu perfil de estudante." },
    ],
  }),
  component: Perfil,
});

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 text-sm text-deep-space">
      {label}
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-primary" : "bg-neutral-tag"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-card transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

function Perfil() {
  const st = useStore((s) => s.student);
  const docs = useStore((s) => s.docs);
  const email = useStore((s) => s.email);
  const settings = useStore((s) => s.settings);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("Geral");
  const d = daysUntil(st.validUntil);
  const needsRenewal = st.verification !== "aprovado" || d <= 15;
  const setSetting = (k: keyof typeof settings, v: boolean) => setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-tag">
            {st.photo ? <img src={st.photo} alt="" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl text-deep-space">{st.name || "Seu nome"}</h1>
            <p className="text-sm text-muted-foreground">{st.course || "Curso"} · {st.semester ? `${st.semester}º sem.` : "—"} · {st.institution || "Instituição"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {st.verification === "aprovado" && d >= 0 && <VerifiedSeal small label="Estudante verificado" />}
              <ValiditySeal validUntil={st.validUntil} status={st.verification} />
            </div>
          </div>
        </div>
      </Card>

      {needsRenewal && (
        <Card className="border-destructive/30">
          <p className="font-display font-bold text-deep-space">Renovação da verificação</p>
          <p className="mb-3 text-sm text-muted-foreground">Envie o comprovante do semestre atual para manter o selo nas candidaturas.</p>
          <UploadArea status={st.verification === "aprovado" ? "vazio" : st.verification} fileName={st.fileName} refuseReason={st.refuseReason} onFile={submitStudentDoc} />
        </Card>
      )}

      <Card>
        <p className="flex items-center gap-2 font-display font-bold text-deep-space"><User className="h-5 w-5" /> Dados da conta</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="label-mono text-muted-foreground">E-mail</dt><dd className="text-deep-space">{email || "—"}</dd></div>
          <div><dt className="label-mono text-muted-foreground">Cidade</dt><dd className="text-deep-space">{st.city || "—"}</dd></div>
          <div className="col-span-2"><dt className="label-mono text-muted-foreground">Interesses</dt><dd className="text-deep-space">{st.interests.join(", ") || "—"}</dd></div>
        </dl>
      </Card>

      <Card>
        <p className="flex items-center gap-2 font-display font-bold text-deep-space"><FileText className="h-5 w-5" /> Currículos e projetos</p>
        <p className="text-sm text-muted-foreground">Um anexo por tipo de vaga. Visível só para recrutadores.</p>
        <div className="mt-3 space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-2">
              <DocChip title={doc.title} onRemove={() => setState((s) => ({ ...s, docs: s.docs.filter((x) => x.id !== doc.id) }))} />
              <span className="label-mono text-muted-foreground">{doc.area}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder='Título, ex.: "Dev Front-end"' className="h-12 rounded-[10px] border border-border px-4 outline-none focus:border-primary" />
          <select value={area} onChange={(e) => setArea(e.target.value)} className="h-12 rounded-[10px] border border-border bg-card px-3">
            {["Geral", ...AREAS].map((a) => <option key={a}>{a}</option>)}
          </select>
          <label className="flex h-12 cursor-pointer items-center justify-center rounded-[10px] bg-primary px-4 font-semibold text-primary-foreground">
            Anexar PDF
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const t = (title.trim() || f.name.replace(/\.pdf$/i, "")) + ".pdf";
                setState((s) => ({ ...s, docs: [...s.docs, { id: crypto.randomUUID(), title: t, area }] }));
                setTitle("");
                toast.success("Anexo adicionado");
              }}
            />
          </label>
        </div>
      </Card>

      <Card>
        <p id="configuracoes" className="flex scroll-mt-20 items-center gap-2 font-display font-bold text-deep-space"><Settings className="h-5 w-5" /> Configurações</p>
        <Toggle label="Notificações de vagas e etapas" checked={settings.notifications} onChange={(v) => setSetting("notifications", v)} />
        <p className="mt-3 flex items-center gap-2 font-display font-bold text-deep-space"><Accessibility className="h-5 w-5" /> Acessibilidade</p>
        <Toggle label="Texto ampliado" checked={settings.largeText} onChange={(v) => setSetting("largeText", v)} />
        <p className="mt-3 flex items-center gap-2 font-display font-bold text-deep-space"><Lock className="h-5 w-5" /> Privacidade e Segurança</p>
        <Toggle label="Perfil visível para recrutadores" checked={settings.profilePublic} onChange={(v) => setSetting("profilePublic", v)} />
      </Card>

      <Card className="bg-mint">
        <p className="label-mono text-muted-foreground">Demonstração</p>
        <p className="mb-3 text-sm text-deep-space">Simule estados do selo de validade.</p>
        <div className="flex flex-wrap gap-2">
          {[["Válido", 120], ["Vence em 10 dias", 10], ["Vencido", -2]].map(([l, days]) => (
            <button key={l as string} className="h-11 rounded-[10px] border border-border bg-card px-3 text-sm font-semibold" onClick={() => setState((s) => ({ ...s, student: { ...s.student, verification: "aprovado", validUntil: new Date(Date.now() + (days as number) * 864e5).toISOString() } }))}>
              {l}
            </button>
          ))}
        </div>
        <PrimaryButton className="mt-3 h-11 bg-deep-space" onClick={() => { resetState(); location.href = "/"; }}>Reiniciar protótipo</PrimaryButton>
      </Card>
    </div>
  );
}
