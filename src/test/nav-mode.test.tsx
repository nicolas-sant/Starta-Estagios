import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NAV_MODE_KEY, readNavMode, writeNavMode } from "@/lib/nav-mode";

vi.mock("@/lib/public-jobs.functions", () => ({ listPublicJobs: async () => [] }));

async function renderStudent() {
  const { routeTree } = await import("@/routeTree.gen");
  Object.assign(routeTree.options, { shellComponent: ({ children }: { children: ReactNode }) => <>{children}</> });
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: ["/estudante/buscar"] }) });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = ((q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} })) as never;
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("student nav mode", () => {
  it("persists across reloads", () => {
    expect(readNavMode()).toBe("top");
    writeNavMode("side");
    expect(localStorage.getItem(NAV_MODE_KEY)).toBe("side");
    expect(readNavMode()).toBe("side");
  });

  it("falls back to top when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    expect(() => writeNavMode("side")).not.toThrow();
    expect(readNavMode()).toBe("top");
  });

  it("marks the active item with aria-current in both modes", async () => {
    const { container, getAllByRole } = await renderStudent();
    const activeIn = (sel: string) => container.querySelector(`${sel} a[aria-current="page"]`)?.textContent;
    await waitFor(() => expect(activeIn("header nav")).toContain("Buscar"));
    await act(async () => { fireEvent.click(getAllByRole("button", { name: "Mover navegação para a lateral" })[0]!); });
    await waitFor(() => expect(activeIn("aside nav")).toContain("Buscar"));
    expect(localStorage.getItem(NAV_MODE_KEY)).toBe("side");
  });
});
