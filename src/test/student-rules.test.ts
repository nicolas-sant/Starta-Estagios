import { beforeEach, describe, expect, it } from "vitest";
import { getState, notificationKind, resetState, setState, sortNotifications, stepDatesFor, threadUnread } from "@/lib/store";
import { canWithdrawApplication, expectedResponseDate, withdrawApplication } from "@/lib/student";

beforeEach(() => {
  resetState();
});

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
  it("retirar remove a candidatura e o candidato correspondente do pipeline", () => {
    setState((state) => ({
      ...state,
      applications: [
        { candidateId: "c1", jobId: "front-ml", step: 0, appliedAt: "2026-10-20T10:00:00Z", message: "", strengths: [], toDevelop: [] },
        ...state.applications,
      ],
    }));
    withdrawApplication("front-ml", "Estágio em Desenvolvimento Front-end");
    expect(getState().applications.some((application) => application.jobId === "front-ml")).toBe(false);
    expect(getState().candidates.some((candidate) => candidate.id === "c1")).toBe(false);
    expect(getState().candidates.some((candidate) => candidate.id === "c2")).toBe(true);
    expect(getState().notifications[0]).toMatchObject({
      text: "Você retirou sua candidatura para Estágio em Desenvolvimento Front-end.",
      kind: "retirada",
    });
  });
  it("não disponibiliza nem executa a retirada quando já existe resultado", () => {
    expect(canWithdrawApplication({ result: "aprovado" })).toBe(false);
    expect(canWithdrawApplication({ result: "recusado" })).toBe(false);
    expect(canWithdrawApplication({})).toBe(true);
    withdrawApplication("mkt-frevo", "Estágio em Marketing de Conteúdo");
    expect(getState().applications.some((application) => application.jobId === "mkt-frevo")).toBe(true);
  });
  it("calcula a previsão somando o prazo médio à data da candidatura", () => {
    expect(expectedResponseDate("2026-10-01T12:00:00.000Z", 3).toISOString()).toBe("2026-10-04T12:00:00.000Z");
    expect(expectedResponseDate("2026-10-01T12:00:00.000Z", 21).toISOString()).toBe("2026-10-22T12:00:00.000Z");
  });
});
