import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { TekstbordWidget } from "./TekstbordWidget";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(cleanup);

it("shows the new greeting on a new device", () => {
  render(<TekstbordWidget />);
  expect(screen.getByRole("textbox", { name: "Tekstbord inhoud" }).textContent).toBe("Wat fijn dat jij er bent!\n\nDe Chromebooks worden gehaald.\nDe schriften worden uitgedeeld, deze doe je in je la.\n\nWe gaan gelijk stillezen. Veel plezier!");
});

it("replaces the old restored greeting in both storage locations", () => {
  sessionStorage.setItem("klastools-tekstbord-html", "<div>Wat fijn dat jij er bent.</div><div>Om half 9 gaan we beginnen met stillezen.</div>");
  render(<TekstbordWidget />);
  expect(screen.getByRole("textbox")).toHaveTextContent("De Chromebooks worden gehaald.");
  expect(localStorage.getItem("klastools-tekstbord-html")).toContain("We gaan gelijk stillezen. Veel plezier!");
  expect(sessionStorage.getItem("klastools-tekstbord-html")).toContain("We gaan gelijk stillezen. Veel plezier!");
});

it("preserves unrelated board content", () => {
  localStorage.setItem("klastools-tekstbord-html", "<b>Rekenen: bladzijde 12</b>");
  render(<TekstbordWidget />);
  expect(screen.getByRole("textbox").innerHTML).toBe("<b>Rekenen: bladzijde 12</b>");
});
