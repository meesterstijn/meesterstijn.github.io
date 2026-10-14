import { expect, it } from "vitest";
import { nextLessonTime, reorderLessons } from "./dagritme";

it("adds new subjects after the latest lesson even if the saved order differs", () => {
  expect(nextLessonTime([{ time: "14:15" }, { time: "08:30" }])).toBe("14:45");
});
it("starts empty days at 08:30 and never wraps to the morning", () => {
  expect(nextLessonTime([])).toBe("08:30");
  expect(nextLessonTime([{ time: "23:45" }])).toBe("23:59");
  expect(nextLessonTime([{ time: "invalid" }])).toBe("08:30");
});

it("moves a lesson down, reassigns time slots and preserves its lesson details", () => {
  const blocks = [
    { id: "a", time: "08:30", title: "Taal", les: "Les 1" },
    { id: "b", time: "09:00", title: "Rekenen", les: "Les 2" },
    { id: "c", time: "10:15", title: "Pauze", les: "" },
  ];
  const moved = reorderLessons(blocks, "a", "c");
  expect(moved.map(b => b.id)).toEqual(["b", "c", "a"]);
  expect(moved.map(b => b.time)).toEqual(["08:30", "09:00", "10:15"]);
  expect(moved[2].les).toBe("Les 1");
  expect(blocks[0].time).toBe("08:30");
  expect(reorderLessons(moved, "a", "b")).toEqual(blocks);
  expect(reorderLessons(blocks, "a", "a")).toBe(blocks);
  expect(reorderLessons(blocks, "missing", "a")).toBe(blocks);
});
