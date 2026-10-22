import { describe, expect, it } from "vitest";
import { notificationKind, sortNotifications, stepDatesFor, threadUnread } from "@/lib/store";

describe("regras do estudante", () => {
  it("ordena notificações da mais recente para a mais antiga", () => {
    const list = [
      { id: "a", text: "x", at: "2026-10-20T10:00:00Z", read: false },
      { id: "b", text: "x", at: "2026-10-21T10:00:00Z", read: false },
      { id: "c", text: "x", at: "2026-10-17T10:00:00Z", read: true },
    ];
    expect(sortNotifications(list).map((n) => n.id)).toEqual(["b", "a", "c"]);
  });
  it("dá data a todas as etapas concluídas", () => {
    const d = stepDatesFor({ jobId: "j", step: 2, appliedAt: "2026-10-01T00:00:00Z", message: "", strengths: [], toDevelop: [], stepDates: ["2026-10-01T00:00:00Z"] });
    expect(d).toHaveLength(3);
    expect(d.every(Boolean)).toBe(true);
  });
  it("classifica o tipo de aviso", () => {
    expect(notificationKind({ id: "1", text: "Frevo Comunicação enviou o retorno da sua candidatura.", at: "", read: true })).toBe("retorno");
  });
  it("conversa com última mensagem do recrutador não lida é marcada como nova", () => {
    const t = { id: "t", jobId: "j", with: "R", messages: [{ from: "them" as const, text: "oi", at: "2026-10-20T10:00:00Z" }] };
    expect(threadUnread(t)).toBe(true);
    expect(threadUnread({ ...t, readAt: "2026-10-21T10:00:00Z" })).toBe(false);
  });
});
