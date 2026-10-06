import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PrimaryButton, UploadArea } from "@/components/starta/ui";
import { defaultValidUntil, setState, useStore } from "@/lib/store";
import { SetupShell } from "./onboarding";

export const Route = createFileRoute("/verificacao")({
  head: () => ({
    meta: [
      { title: "Verificação do estudante — Starta" },
      { name: "description", content: "Envie seu comprovante de matrícula em PDF para verificar seu perfil de estudante." },
      { property: "og:title", content: "Verificação do estudante — Starta" },
      { property: "og:description", content: "Comprovante de matrícula para o selo de estudante verificado." },
    ],
  }),
  component: Verificacao,
});

export function submitStudentDoc(f: File) {
  const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
  setState((s) => ({ ...s, student: { ...s.student, verification: "enviado", fileName: f.name, refuseReason: "" } }));
  setTimeout(() => setState((s) => ({ ...s, student: { ...s.student, verification: "analise" } })), 900);
  setTimeout(() => {
    const refuse = !isPdf || f.size > 5 * 1024 * 1024 || /recus/i.test(f.name);
    setState((s) => ({
      ...s,
      student: {
        ...s.student,
        verification: refuse ? "recusado" : "aprovado",
        refuseReason: refuse ? (!isPdf ? "O arquivo precisa estar em PDF." : f.size > 5 * 1024 * 1024 ? "O arquivo excede 5 MB." : "Documento ilegível ou sem data do semestre atual.") : "",
        validUntil: refuse ? s.student.validUntil : defaultValidUntil(),
      },
    }));
    if (refuse) toast.error("Comprovante recusado — veja o motivo.");
    else toast.success("Matrícula verificada!");
  }, 3000);
}

function Verificacao() {
  const nav = useNavigate();
  const st = useStore((s) => s.student);
  return (
    <SetupShell step={3} total={4} label="Verificação">
      <span className="label-mono text-primary">Etapa obrigatória</span>
      <h1 className="mt-1 text-2xl text-deep-space">Verifique sua matrícula</h1>
      <p className="mt-1 text-muted-foreground">Envie o comprovante de matrícula do semestre atual. Recrutadores veem o selo de estudante verificado nas suas candidaturas.</p>
      <div className="mt-6">
        <UploadArea status={st.verification} fileName={st.fileName} refuseReason={st.refuseReason} onFile={submitStudentDoc} />
      </div>
      <PrimaryButton className="mt-8 w-full" disabled={st.verification !== "aprovado"} onClick={() => nav({ to: "/perfil-setup" })}>
        {st.verification === "aprovado" ? "Continuar" : "Aguardando aprovação do documento"}
      </PrimaryButton>
      <p className="mt-3 text-center text-xs text-muted-foreground">O cadastro só é concluído com o documento aprovado.</p>
    </SetupShell>
  );
}
