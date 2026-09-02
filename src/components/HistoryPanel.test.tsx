import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistoryPanel } from "@/components/HistoryPanel";

describe("HistoryPanel", () => {
  it("wist een tekstselectie wanneer het paneel wordt geopend", () => {
    const removeAllRanges = vi.fn();
    vi.spyOn(window, "getSelection").mockReturnValue({ removeAllRanges } as Selection);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      callback(0);
      return 1;
    });

    render(
      <HistoryPanel
        title="Dagritme"
        snapshots={[]}
        onRestore={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "Geschiedenis" });
    fireEvent.pointerDown(button);
    fireEvent.click(button);

    expect(removeAllRanges).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("heading", { name: "Dagritme" })).toBeInTheDocument();
  });
});
