import { beforeEach, describe, expect, it } from "vitest";
import { allJobs, getState, resetState, setState } from "@/lib/store";
import { advanceCandidate, sendCandidateMessage, setJobStatus } from "@/lib/recruiter";

beforeEach(() => {
  resetState();
});
describe("Recruiter workflows", () => {
  it("keeps terminal stages valid", () => {
    advanceCandidate("c7");
    expect(getState().candidates.find((c) => c.id === "c7")?.stage).toBe("Recusado");
  });
  it("advances linked applications and sends student messages", () => {
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((c) => (c.id === "c3" ? { ...c, studentLinked: true } : c)),
    }));
    advanceCandidate("c3");
    expect(getState().applications.find((a) => a.jobId === "rh-ml")?.result).toBe("aprovado");
    sendCandidateMessage("c3", "Olá!");
    expect(
      getState()
        .threads.find((t) => t.jobId === "rh-ml")
        ?.messages.at(-1)?.text,
    ).toBe("Olá!");
  });
  it("excludes filled seed jobs from public discovery and preserves history", () => {
    setJobStatus("rh-ml", "filled");
    expect(allJobs(getState()).some((j) => j.id === "rh-ml")).toBe(false);
    expect(getState().applications.find((a) => a.jobId === "rh-ml")?.feedback).toContain(
      "preenchida",
    );
    expect(
      getState()
        .candidates.find((c) => c.id === "c3")
        ?.chat.at(-1)?.text,
    ).toContain("preenchida");
  });
  it("uses edited values instead of seed data", () => {
    setState((s) => ({
      ...s,
      recruiterJobs: s.recruiterJobs.map((j) =>
        j.id === "front-ml" ? { ...j, stipend: 3000 } : j,
      ),
    }));
    expect(allJobs(getState()).find((j) => j.id === "front-ml")?.stipend).toBe(3000);
  });
});
