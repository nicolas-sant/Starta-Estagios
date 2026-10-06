import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Field, PrimaryButton } from "@/components/starta/ui";
import { setState, useStore } from "@/lib/store";
import { SetupShell } from "./onboarding";

export const Route = createFileRoute("/perfil-setup")({
  head: () => ({
    meta: [
      { title: "Configuração de perfil — Starta" },
      { name: "description", content: "Complete seu perfil com nome, foto, instituição, curso e semestre." },
      { property: "og:title", content: "Configuração de perfil — Starta" },
      { property: "og:description", content: "Último passo para começar a se candidatar." },
    ],
  }),
  component: PerfilSetup,
});

function PerfilSetup() {
  const nav = useNavigate();
  const st = useStore((s) => s.student);
  const [f, setF] = useState({ name: st.name, photo: st.photo, institution: st.institution, course: st.course, semester: st.semester });
  const ref = useRef<HTMLInputElement>(null);
  const ok = f.name.trim() && f.institution.trim() && f.course.trim() && f.semester;

  if (st.verification !== "aprovado")
    return (
      <SetupShell step={3} total={4} label="Verificação">
        <p className="text-deep-space">Você precisa ter o comprovante aprovado antes de configurar o perfil.</p>
        <PrimaryButton className="mt-4" onClick={() => nav({ to: "/verificacao" })}>Ir para verificação</PrimaryButton>
      </SetupShell>
    );

  return (
    <SetupShell step={4} total={4} label="Perfil">
      <h1 className="text-2xl text-deep-space">Configure seu perfil</h1>
      <div className="mt-6 flex items-center gap-4">
        <button onClick={() => ref.current?.click()} className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-tag text-muted-foreground" aria-label="Foto de perfil">
          {f.photo ? <img src={f.photo} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" />}
        </button>
        <span className="text-sm text-muted-foreground">Foto de perfil (opcional)</span>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const r = new FileReader();
            r.onload = () => setF((p) => ({ ...p, photo: String(r.result) }));
            r.readAsDataURL(file);
          }}
        />
      </div>
      <div className="mt-6 space-y-4">
        <Field label="Nome completo" value={f.name} maxLength={100} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Beatriz Ramos" />
        <Field label="Instituição de ensino" value={f.institution} maxLength={100} onChange={(e) => setF({ ...f, institution: e.target.value })} placeholder="UFPE" />
        <Field label="Curso" value={f.course} maxLength={100} onChange={(e) => setF({ ...f, course: e.target.value })} placeholder="Administração" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-deep-space">Semestre em andamento</span>
          <select value={f.semester} onChange={(e) => setF({ ...f, semester: e.target.value })} className="h-12 w-full rounded-[10px] border border-border bg-card px-4 outline-none focus:border-primary">
            <option value="">Selecione</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1)}>{i + 1}º semestre</option>
            ))}
          </select>
        </label>
      </div>
      <PrimaryButton
        className="mt-8 w-full"
        disabled={!ok}
        onClick={() => {
          setState((s) => ({ ...s, student: { ...s.student, ...f, name: f.name.trim(), profileDone: true } }));
          nav({ to: "/estudante" });
        }}
      >
        Concluir cadastro
      </PrimaryButton>
    </SetupShell>
  );
}
