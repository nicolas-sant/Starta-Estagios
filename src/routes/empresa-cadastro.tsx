import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Field, PrimaryButton, UploadArea } from "@/components/starta/ui";
import { setState, useStore } from "@/lib/store";
import { SetupShell } from "./onboarding";

export const Route = createFileRoute("/empresa-cadastro")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Cadastro da empresa — Starta" },
      { name: "description", content: "Cadastre e verifique sua empresa para publicar vagas de estágio." },
      { property: "og:title", content: "Cadastro da empresa — Starta" },
      { property: "og:description", content: "Verificação de empresa com selo de confiança." },
    ],
  }),
  component: EmpresaCadastro,
});

function EmpresaCadastro() {
  const nav = useNavigate();
  const c = useStore((s) => s.company);
  const [name, setName] = useState(c.name);
  const [cnpj, setCnpj] = useState(c.cnpj);
  const validCnpj = cnpj.replace(/\D/g, "").length === 14;

  const onFile = (f: File) => {
    setState((s) => ({ ...s, company: { ...s.company, verification: "enviado", fileName: f.name } }));
    setTimeout(() => setState((s) => ({ ...s, company: { ...s.company, verification: "analise" } })), 900);
    setTimeout(() => {
      const ok = f.name.toLowerCase().endsWith(".pdf");
      setState((s) => ({ ...s, company: { ...s.company, verification: ok ? "aprovado" : "recusado" } }));
      ok ? toast.success("Empresa verificada!") : toast.error("Documento recusado: envie o cartão CNPJ em PDF.");
    }, 2800);
  };

  return (
    <SetupShell step={2} total={2} label="Verificação da empresa">
      <span className="label-mono text-primary">Etapa obrigatória</span>
      <h1 className="mt-1 text-2xl text-deep-space">Cadastre sua empresa</h1>
      <div className="mt-6 space-y-4">
        <Field label="Nome da empresa" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        <Field label="CNPJ" value={cnpj} maxLength={18} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
      </div>
      <p className="mb-2 mt-6 text-sm font-medium text-deep-space">Cartão CNPJ (PDF)</p>
      <UploadArea status={c.verification} fileName={c.fileName} refuseReason={c.verification === "recusado" ? "Envie o cartão CNPJ em PDF." : ""} onFile={onFile} />
      <PrimaryButton
        className="mt-8 w-full"
        disabled={c.verification !== "aprovado" || !validCnpj || !name.trim()}
        onClick={() => {
          setState((s) => ({ ...s, company: { ...s.company, name: name.trim(), cnpj } }));
          nav({ to: "/recrutador" });
        }}
      >
        Ir para o painel
      </PrimaryButton>
    </SetupShell>
  );
}
