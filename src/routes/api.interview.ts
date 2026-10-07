import { createFileRoute } from "@tanstack/react-router";
import { handleInterview } from "@/lib/ai/interview.server";
export const Route = createFileRoute("/api/interview")({
  server: { handlers: { POST: ({ request }) => handleInterview(request) } },
});
