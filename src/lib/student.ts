import { setState, type Application } from "./store";

const DAY_MS = 86_400_000;

export function expectedResponseDate(appliedAt: string, avgResponseDays: number) {
  return new Date(new Date(appliedAt).getTime() + avgResponseDays * DAY_MS);
}

export function canWithdrawApplication(application: Pick<Application, "result"> | undefined) {
  return !!application && !application.result;
}

export function withdrawApplication(jobId: string, jobTitle: string) {
  setState((state) => {
    const application = state.applications.find((item) => item.jobId === jobId);
    if (!application || application.result) return state;
    return {
      ...state,
      applications: state.applications.filter((item) => item.jobId !== jobId),
      candidates: state.candidates.filter((candidate) =>
        application.candidateId
          ? candidate.id !== application.candidateId
          : !(candidate.jobId === jobId && candidate.studentLinked),
      ),
      notifications: [
        {
          id: crypto.randomUUID(),
          text: `Você retirou sua candidatura para ${jobTitle}.`,
          at: new Date().toISOString(),
          read: false,
          kind: "retirada" as const,
        },
        ...state.notifications,
      ],
    };
  });
}
