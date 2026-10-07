import { createFileRoute } from "@tanstack/react-router";
import { RecruiterMessages } from "@/components/starta/recruiter-messages";
export const Route = createFileRoute("/recrutador/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens do recrutador — Starta" },
      { name: "description", content: "Converse com os candidatos de cada vaga." },
      { property: "og:title", content: "Mensagens do recrutador — Starta" },
      { property: "og:description", content: "Comunicação direta com os candidatos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <h1 className="text-3xl">Mensagens</h1>
      <RecruiterMessages />
    </div>
  ),
});
