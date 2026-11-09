import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Stepper } from "@/components/starta/ui";

const STEPS = ["Recebido", "Triagem", "Entrevista", "Resultado"] as const;
afterEach(cleanup);

describe("Stepper", () => {
  it("marks the current step with aria-current", () => {
    const { container } = render(<Stepper steps={STEPS} current={2} />);
    const cur = container.querySelectorAll('li[aria-current="step"]');
    expect(cur).toHaveLength(1);
    expect(cur[0].textContent).toContain("Entrevista");
  });

  it("shows the last step as completed when the process is approved", () => {
    const { container } = render(<Stepper steps={STEPS} current={3} complete />);
    expect(container.querySelectorAll('li[aria-current="step"]')).toHaveLength(0);
    expect(container.querySelectorAll("li svg")).toHaveLength(4);
  });

  it("keeps a rejected last step as the current failed step", () => {
    const { container } = render(<Stepper steps={STEPS} current={3} failed complete />);
    expect(container.querySelector('li[aria-current="step"]')?.textContent).toContain("Resultado");
  });
});
