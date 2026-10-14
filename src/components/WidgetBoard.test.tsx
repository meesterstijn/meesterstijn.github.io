import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { boardColumns } from "./widgetBoardLayout";
import { WidgetBoard } from "./WidgetBoard";

const widgets = [
  { id: "timer", title: "Timer", content: <input aria-label="Inhoud" defaultValue="bewaard" /> },
  { id: "text", title: "Tekstbord", content: <p>Tekst</p> },
];
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("keeps widget content mounted when hidden and restores visibility on reload", () => {
  const view = render(<WidgetBoard widgets={widgets} />);
  fireEvent.change(screen.getByLabelText("Inhoud"), { target: { value: "gewijzigd" } });
  fireEvent.click(screen.getByRole("button", { name: "Timer verbergen" }));
  expect(screen.getByLabelText("Inhoud").closest("article")).toHaveAttribute("hidden");
  fireEvent.keyDown(screen.getByRole("button", { name: "Blok toevoegen" }), { key: "ArrowDown" });
  fireEvent.click(screen.getByRole("menuitem", { name: "Timer" }));
  expect(screen.getByLabelText("Inhoud")).toHaveValue("gewijzigd");
  fireEvent.click(screen.getByRole("button", { name: "Timer verbergen" }));
  view.unmount();
  render(<WidgetBoard widgets={widgets} />);
  expect(screen.getByLabelText("Inhoud").closest("article")).toHaveAttribute("hidden");
});

it("reorders by keyboard and persists size and order", () => {
  const view = render(<WidgetBoard widgets={widgets} />);
  fireEvent.keyDown(screen.getByLabelText("Timer verplaatsen; gebruik de pijltjestoetsen"), { key: "ArrowRight" });
  for (let i = 0; i < 3; i++) fireEvent.keyDown(screen.getByLabelText("Timer breedte aanpassen"), { key: "ArrowRight" });
  view.unmount();
  render(<WidgetBoard widgets={widgets} />);
  expect(screen.getAllByRole("article").map(el => el.getAttribute("aria-label"))).toEqual(["Tekstbord", "Timer"]);
  expect(screen.getByLabelText("Inhoud").closest("article")?.style.getPropertyValue("--widget-width")).toBe("12");
});

it("recovers from malformed storage and adds newly registered widgets", () => {
  localStorage.setItem("klastools-layout-v1", JSON.stringify([null, { id: "timer", width: -9, height: -50, visible: true }, { id: "timer" }, { id: "removed" }]));
  render(<WidgetBoard widgets={widgets} />);
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByLabelText("Inhoud").closest("article")?.style.getPropertyValue("--widget-height")).toBe("320px");
});


it("locks layout controls while keeping widget content usable and remembers the lock", () => {
  const view = render(<WidgetBoard widgets={widgets} />);
  fireEvent.click(screen.getByRole("button", { name: "Indeling vergrendelen" }));
  expect(screen.queryByRole("button", { name: "Timer verbergen" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Blok toevoegen" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Inhoud"), { target: { value: "werkt" } });
  expect(screen.getByLabelText("Inhoud")).toHaveValue("werkt");
  view.unmount();
  render(<WidgetBoard widgets={widgets} />);
  expect(screen.getByRole("button", { name: "Indeling ontgrendelen" })).toHaveAttribute("aria-pressed", "true");
});

it("previews pointer moves, commits on release, and cancels resizing with Escape", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  render(<WidgetBoard widgets={widgets} />);
  const panels = screen.getAllByRole("article");
  panels.forEach((panel, index) => vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({ left: index * 400, right: index * 400 + 390, top: 0, bottom: 600, width: 390, height: 600, x: index * 400, y: 0, toJSON: () => ({}) }));
  const handle = screen.getByLabelText("Timer verplaatsen; gebruik de pijltjestoetsen");
  Object.defineProperty(handle, "setPointerCapture", { value: vi.fn() });
  fireEvent.pointerDown(handle, { button: 0, clientX: 50, clientY: 20 });
  fireEvent.pointerMove(handle, { clientX: 450, clientY: 20 });
  expect(panels[0].style.order).toBe("1");
  expect(JSON.parse(localStorage.getItem("klastools-layout-v1")!)[0].id).toBe("timer");
  fireEvent.pointerUp(handle);
  expect(JSON.parse(localStorage.getItem("klastools-layout-v1")!)[0].id).toBe("text");
  const resize = screen.getByLabelText("Timer hoogte aanpassen");
  Object.defineProperty(resize, "setPointerCapture", { value: vi.fn() });
  fireEvent.pointerDown(resize, { button: 0, clientX: 50, clientY: 560 });
  fireEvent.pointerMove(resize, { clientX: 50, clientY: 660 });
  expect(panels[0].style.getPropertyValue("--widget-height")).toBe("660px");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(panels[0].style.getPropertyValue("--widget-height")).toBe("560px");
  fireEvent.pointerDown(resize, { button: 0, clientX: 50, clientY: 560 });
  fireEvent.pointerMove(resize, { clientX: 50, clientY: 660 });
  fireEvent.pointerUp(resize);
  expect(JSON.parse(localStorage.getItem("klastools-layout-v1")!).find((w: { id: string }) => w.id === "timer").height).toBe(660);
});

it("shares the entire row proportionally without wrapping and omits hidden columns", () => {
  const items = [{ width: 3, visible: true }, { width: 6, visible: true }, { width: 3, visible: true }];
  expect(boardColumns(items)).toBe("minmax(0, 3fr) minmax(0, 6fr) minmax(0, 3fr)");
  items[1].width = 3;
  expect(boardColumns(items)).toBe("minmax(0, 3fr) minmax(0, 3fr) minmax(0, 3fr)");
  items[1].visible = false;
  expect(boardColumns(items)).toBe("minmax(0, 3fr) minmax(0, 3fr)");
  render(<WidgetBoard widgets={widgets} />);
  const board = screen.getByRole("article", { name: "Timer" }).parentElement!;
  expect(board.style.getPropertyValue("--board-columns")).toBe("minmax(0, 4fr) minmax(0, 4fr)");
  fireEvent.click(screen.getByRole("button", { name: "Timer verbergen" }));
  expect(board.style.getPropertyValue("--board-columns")).toBe("minmax(0, 4fr)");
});

it("resizes from either edge in opposite directions without changing height", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  render(<WidgetBoard widgets={widgets} />);
  const panel = screen.getByRole("article", { name: "Timer" });
  Object.defineProperty(panel.parentElement, "clientWidth", { value: 1176 });
  const drag = (label: string, from: number, to: number) => {
    const handle = screen.getByLabelText(label);
    if (!("setPointerCapture" in handle)) Object.defineProperty(handle, "setPointerCapture", { value: vi.fn() });
    fireEvent.pointerDown(handle, { button: 0, clientX: from, clientY: 100 });
    fireEvent.pointerMove(handle, { clientX: to, clientY: 140 });
    fireEvent.pointerUp(handle);
  };
  drag("Timer breedte links aanpassen", 300, 100);
  expect(panel.style.getPropertyValue("--widget-width")).toBe("6");
  expect(panel.style.getPropertyValue("--widget-height")).toBe("560px");
  drag("Timer breedte links aanpassen", 100, 300);
  expect(panel.style.getPropertyValue("--widget-width")).toBe("4");
  drag("Timer breedte aanpassen", 300, 500);
  expect(panel.style.getPropertyValue("--widget-width")).toBe("6");
  drag("Timer breedte aanpassen", 500, 300);
  expect(panel.style.getPropertyValue("--widget-width")).toBe("4");
  fireEvent.keyDown(screen.getByLabelText("Timer breedte links aanpassen"), { key: "ArrowLeft" });
  expect(panel.style.getPropertyValue("--widget-width")).toBe("6");
});

it("adds a new module below its parent to an existing layout and keeps it independent", () => {
  localStorage.setItem("klastools-layout-v1", JSON.stringify([{ id: "timer", width: 4, height: 560, visible: true }, { id: "text", width: 6, height: 560, visible: true }]));
  render(<WidgetBoard widgets={[...widgets, { id: "sticks", title: "Beurtstokjes", below: "text", width: 6, height: 320, content: <button>Trek!</button> }]} />);
  const sticks = screen.getByRole("article", { name: "Beurtstokjes" });
  expect(sticks.style.getPropertyValue("--board-column")).toBe("2");
  expect(sticks.style.getPropertyValue("--board-row")).toBe("2");
  expect(sticks.parentElement!.style.getPropertyValue("--board-columns")).toBe("minmax(0, 4fr) minmax(0, 6fr)");
  fireEvent.click(screen.getByLabelText("Tekstbord verbergen"));
  expect(sticks).not.toHaveAttribute("hidden");
  expect(sticks.style.getPropertyValue("--board-row")).toBe("1");
  expect(screen.getByRole("button", { name: "Trek!" })).toBeEnabled();
});

it("fits the workspace to the viewport and updates on resize", () => {
  vi.stubGlobal("innerHeight", 900);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 200, left: 0, right: 1200, bottom: 800, width: 1200, height: 600, x: 0, y: 200, toJSON: () => ({}) });
  render(<WidgetBoard widgets={widgets} />);
  const field = screen.getByRole("article", { name: "Timer" }).parentElement!;
  expect(field.style.getPropertyValue("--board-height")).toBe("676px");
  vi.stubGlobal("innerHeight", 700);
  fireEvent.resize(window);
  expect(field.style.getPropertyValue("--board-height")).toBe("476px");
  vi.stubGlobal("innerHeight", 400);
  fireEvent.resize(window);
  expect(field.style.getPropertyValue("--board-height")).toBe("280px");
});
