import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { KlaarWidget } from "./KlaarWidget";
import { DagplanningWidget, parseSchedule, currentActivityIndex } from "./DagplanningWidget";

const mocks = vi.hoisted(() => ({ read: vi.fn(), from: vi.fn(), remove: vi.fn(), classId: "class-a" }));
vi.mock("@/context/ClassContext", () => ({ useClasses: () => ({ activeClassId: mocks.classId, activeClass: { name: "Groep 5" }, loading: false }) }));
vi.mock("@/lib/supabase", () => ({ supabase: {
  from: mocks.from,
  channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
  removeChannel: mocks.remove,
} }));
beforeEach(() => {
  localStorage.clear(); mocks.classId = "class-a";
  mocks.read.mockReset(); mocks.from.mockReset();
  mocks.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mocks.read }) }) });
});
afterEach(cleanup);

it("saves task buttons and page number per class and restores them", () => {
  const view = render(<KlaarWidget />);
  fireEvent.click(screen.getByRole("button", { name: "Eigen/peil taken" }));
  fireEvent.click(screen.getByRole("button", { name: "Maken blz." }));
  fireEvent.change(screen.getByLabelText("Bladzijdenummer"), { target: { value: "24" } });
  fireEvent.click(screen.getByRole("button", { name: "Stillezen" }));
  view.unmount();
  const next = render(<KlaarWidget />);
  expect(screen.getByRole("button", { name: "Eigen/peil taken" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Stillezen" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByLabelText("Bladzijdenummer")).toHaveValue("24");
  mocks.classId = "class-b";
  next.rerender(<KlaarWidget />);
  expect(screen.getByRole("button", { name: "Maken blz." })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Stillezen" })).toHaveAttribute("aria-pressed", "true");
});

it("reads only Dagritme and refreshes the shared data when returning to the window", async () => {
  const payload = (title: string) => ({ data: { data: JSON.stringify({ week: [{ day: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"][new Date().getDay()], blocks: [{ id: "1", time: "08:30", title }] }] }) }, error: null });
  mocks.read.mockResolvedValue(payload("Stillezen"));
  render(<MemoryRouter><DagplanningWidget /></MemoryRouter>);
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(await screen.findByText("Stillezen")).toBeInTheDocument();
  expect(mocks.from).toHaveBeenCalledWith("dagritme");
  expect(screen.getByRole("link")).toHaveAttribute("href", "/dagritme");
  mocks.read.mockResolvedValue(payload("Rekenen"));
  fireEvent.focus(window);
  await waitFor(() => expect(screen.getByText("Rekenen")).toBeInTheDocument());
  expect(screen.queryByText("Stillezen")).not.toBeInTheDocument();
});

it("supports both stored Dagritme formats and rejects invalid data", () => {
  const week = [{ day: "Maandag", blocks: [] }];
  expect(parseSchedule(JSON.stringify(week))).toEqual(week);
  expect(parseSchedule(JSON.stringify({ week }))).toEqual(week);
  expect(() => parseSchedule('{"week":null}')).toThrow();
});

it("confirms choices as a list, remembers presentation mode, and allows editing again", () => {
  const view = render(<KlaarWidget />);
  fireEvent.click(screen.getByRole("button", { name: "Maken blz." }));
  expect(screen.getByRole("button", { name: "Selecteren" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Bladzijdenummer"), { target: { value: "24" } });
  fireEvent.click(screen.getByRole("button", { name: "Selecteren" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Maken blz. 24")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Stillezen" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Bladzijdenummer")).not.toBeInTheDocument();
  view.unmount();
  render(<KlaarWidget />);
  expect(screen.getByText("Maken blz. 24")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Aanpassen" }));
  expect(screen.getByLabelText("Bladzijdenummer")).toHaveValue("24");
});

it("requires custom text, presents it literally, and retains it after reopening", () => {
  const view = render(<KlaarWidget />);
  fireEvent.click(screen.getByRole("button", { name: "Eigen opdracht" }));
  expect(screen.getByRole("button", { name: "Selecteren" })).toBeDisabled();
  const task = "Maak een tekening.\nSchrijf er <drie> zinnen bij.";
  fireEvent.change(screen.getByLabelText("Eigen opdracht tekst"), { target: { value: task } });
  fireEvent.click(screen.getByRole("button", { name: "Selecteren" }));
  expect(screen.getAllByRole("listitem")[1].textContent).toContain(task);
  view.unmount();
  render(<KlaarWidget />);
  expect(screen.getAllByRole("listitem")[1].textContent).toContain(task);
  fireEvent.click(screen.getByRole("button", { name: "Aanpassen" }));
  expect(screen.getByLabelText("Eigen opdracht tekst")).toHaveValue(task);
});

it("keeps the current assignment separate from follow-up tasks and restores both fields", () => {
  const view = render(<KlaarWidget />);
  fireEvent.click(screen.getByRole("button", { name: "Huidige opdracht: Maken blz." }));
  fireEvent.click(screen.getByRole("button", { name: "Huidige opdracht: Maken opdracht" }));
  expect(screen.getByRole("button", { name: "Huidige opdracht selecteren" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Huidige opdracht bladzijdenummer"), { target: { value: "32" } });
  fireEvent.change(screen.getByLabelText("Huidige opdracht tekst"), { target: { value: "4 en 5" } });
  fireEvent.click(screen.getByRole("button", { name: "Huidige opdracht selecteren" }));
  expect(within(screen.getByRole("region", { name: "Huidige opdracht" })).getByText("Maken blz. 32")).toBeInTheDocument();
  expect(screen.getByText("Maken opdracht 4 en 5")).toBeInTheDocument();
  expect(within(screen.getByRole("region", { name: "Klaar-opdrachten" })).getByRole("button", { name: "Stillezen" })).toHaveAttribute("aria-pressed", "true");
  view.unmount();
  render(<KlaarWidget />);
  expect(screen.getByText("Maken opdracht 4 en 5")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Huidige opdracht aanpassen" }));
  expect(screen.getByLabelText("Huidige opdracht bladzijdenummer")).toHaveValue("32");
});

it("marks only today's current activity and switches at the next start time", () => {
  const blocks = [{ time: "08:30" }, { time: "09:00" }, { time: "10:15" }];
  expect(currentActivityIndex(blocks, "Maandag", new Date(2026, 9, 12, 8, 29))).toBe(-1);
  expect(currentActivityIndex(blocks, "Maandag", new Date(2026, 9, 12, 8, 30))).toBe(0);
  expect(currentActivityIndex(blocks, "Maandag", new Date(2026, 9, 12, 9, 0))).toBe(1);
  expect(currentActivityIndex(blocks, "Dinsdag", new Date(2026, 9, 12, 9, 0))).toBe(-1);
  expect(currentActivityIndex([], "Maandag", new Date(2026, 9, 12, 9, 0))).toBe(-1);
});
