import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Accessibility, Lock, Settings, User, FileText, Link2, Pencil, ShieldCheck } from "lucide-react";
import { Card, DocChip, Field, GhostButton, PrimaryButton, VerificationProgress, ValiditySeal, VerifiedSeal, UploadArea } from "@/components/starta/ui";
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
  const isApproved = st.verification === "aprovado";
  const needsRenewal = isApproved && d <= 15;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: st.name, course: st.course, institution: st.institution, semester: st.semester });
  const links = st.links ?? { github: "", portfolio: "", linkedin: "" };
  const [linkForm, setLinkForm] = useState(links);
  const [skillsText, setSkillsText] = useState((st.skills ?? []).join(", "));
  const startEdit = () => { setForm({ name: st.name, course: st.course, institution: st.institution, semester: st.semester }); setEditing(true); };
  const saveProfile = () => {
    if (!form.name.trim()) { toast.error("Informe seu nome."); return; }
    setState((s) => ({ ...s, student: { ...s.student, name: form.name.trim().slice(0, 80), course: form.course.trim().slice(0, 80), institution: form.institution.trim().slice(0, 80), semester: form.semester } }));
    setEditing(false);
    toast.success("Perfil atualizado");
  };
  const cleanUrl = (v: string) => {
    const t = v.trim().slice(0, 200);
    if (!t) return "";
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
  };
  const saveLinks = () => {
    const next = { github: cleanUrl(linkForm.github), portfolio: cleanUrl(linkForm.portfolio), linkedin: cleanUrl(linkForm.linkedin) };
    setState((s) => ({ ...s, student: { ...s.student, links: next }, candidates: s.candidates.map((c) => (c.studentLinked ? { ...c, links: next } : c)) }));
    setLinkForm(next);
    toast.success("Links salvos");
  };
  const saveSkills = () => {
    const list = skillsText.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20);
    setState((s) => ({ ...s, student: { ...s.student, skills: list } }));
    toast.success("Habilidades salvas");
  };
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
            <p className="text-sm text-muted-foreground">{[st.course, st.semester && `${st.semester}º semestre`, st.institution].filter(Boolean).join(" · ") || "Complete seus dados"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {st.verification === "aprovado" && d >= 0 && <VerifiedSeal small label="Estudante verificado" />}
              <ValiditySeal validUntil={st.validUntil} status={st.verification} />
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="ml-auto flex h-11 shrink-0 items-center gap-1.5 rounded-[10px] border border-border px-3 text-sm font-semibold text-primary hover:bg-mint">
              <Pencil className="h-4 w-4" /> Editar
            </button>
          )}
        </div>
        {editing && (
          <form className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
            <Field label="Nome" value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field label="Curso" value={form.course} maxLength={80} onChange={(e) => setForm({ ...form, course: e.target.value })} />
            <Field label="Instituição" value={form.institution} maxLength={80} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-deep-space">Semestre</span>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="h-12 w-full rounded-[10px] border border-border bg-card px-3">
                <option value="">Selecione</option>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>{n}º semestre</option>)}
              </select>
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <GhostButton type="button" onClick={() => setEditing(false)}>Cancelar</GhostButton>
              <PrimaryButton type="submit" className="flex-1">Salvar</PrimaryButton>
            </div>
          </form>
        )}
      </Card>

      {!isApproved && (
        <Card className={st.verification === "recusado" ? "border-destructive/40" : "border-primary/30"}>
          <p className="flex items-center gap-2 font-display font-bold text-deep-space"><ShieldCheck className="h-5 w-5 text-primary" /> Verificação de matrícula</p>
          <p className="text-sm text-muted-foreground">
            {st.verification === "vazio" ? "Você ainda não enviou o comprovante. Sem ele não é possível se candidatar." : st.verification === "recusado" ? `Documento recusado${st.refuseReason ? `: ${st.refuseReason}` : "."} Você pode reenviar.` : "Seu comprovante está em análise (até 2 dias úteis)."}
          </p>
          {st.verification !== "vazio" && <VerificationProgress status={st.verification} />}
          <Link to="/verificacao" className="mt-3 flex h-12 items-center justify-center rounded-[10px] bg-primary font-semibold text-primary-foreground">
            {st.verification === "recusado" ? "Reenviar comprovante" : st.verification === "vazio" ? "Verificar matrícula" : "Ver verificação"}
          </Link>
        </Card>
      )}

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
        <p className="flex items-center gap-2 font-display font-bold text-deep-space"><Link2 className="h-5 w-5" /> Links e habilidades</p>
        <p className="text-sm text-muted-foreground">Recrutadores veem seus links junto com o currículo.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["github", "portfolio", "linkedin"] as const).filter((k) => links[k]).map((k) => (
            <a key={k} href={links[k]} target="_blank" rel="noopener noreferrer" className="rounded-full bg-essential px-3 py-1.5 text-xs font-semibold text-essential-foreground hover:underline">
              {k === "github" ? "GitHub" : k === "portfolio" ? "Portfólio" : "LinkedIn"} ↗
            </a>
          ))}
          {!links.github && !links.portfolio && !links.linkedin && <span className="text-sm text-muted-foreground">Nenhum link adicionado.</span>}
        </div>
        <form className="mt-3 grid gap-3 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); saveLinks(); }}>
          <Field label="GitHub" placeholder="github.com/seu-usuario" value={linkForm.github} maxLength={200} onChange={(e) => setLinkForm({ ...linkForm, github: e.target.value })} />
          <Field label="Portfólio" placeholder="seusite.com" value={linkForm.portfolio} maxLength={200} onChange={(e) => setLinkForm({ ...linkForm, portfolio: e.target.value })} />
          <Field label="LinkedIn" placeholder="linkedin.com/in/voce" value={linkForm.linkedin} maxLength={200} onChange={(e) => setLinkForm({ ...linkForm, linkedin: e.target.value })} />
          <PrimaryButton type="submit" className="sm:col-span-3">Salvar links</PrimaryButton>
        </form>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); saveSkills(); }}>
          <div className="flex-1"><Field label="Suas habilidades (separe por vírgula)" value={skillsText} maxLength={400} onChange={(e) => setSkillsText(e.target.value)} /></div>
          <GhostButton type="submit">Salvar</GhostButton>
        </form>
        <p className="mt-1 text-xs text-muted-foreground">Usadas para destacar no feed as vagas que combinam com você.</p>
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
