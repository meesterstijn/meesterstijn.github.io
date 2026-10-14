/** Layout settings for Klastools. Keep Tailwind classes complete so they are generated. */
export const BOARD_CLASSES = {
  // Full viewport width with comfortable padding. Add max-w-screen-2xl to cap it.
  page: "mx-auto w-full max-w-none px-4 py-8 sm:px-6 lg:px-8",
  // Change gap-6 to adjust spacing. Visible windows share one row from sm upward.
  field: "widget-board grid w-full grid-cols-1 items-start gap-6 sm:grid-cols-[var(--board-columns)]",
  // Column sizes come from relative weights, so every resize redistributes the full width.
  panel: "relative min-w-0 w-full max-w-full sm:col-start-[var(--board-column)] sm:row-start-[var(--board-row)]",
  content: "h-[var(--widget-height)] overflow-auto",
};

export const BOARD_SIZE = {
  defaultHeight: 560,
  minHeight: 320,
  maxHeight: 1000,
};


type LayoutItem = { id?: string; width: number; visible: boolean; below?: string };

function columns(items: LayoutItem[]) {
  const visible = items.filter(item => item.visible);
  // Only stack beneath an independent visible module; invalid links become columns.
  const roots = visible.filter(item => !item.below || !visible.some(parent => parent.id === item.below && !parent.below));
  return roots.map(root => [root, ...visible.filter(item => item.below === root.id && item !== root && !roots.includes(item))]);
}

export function boardColumns(items: LayoutItem[]) {
  return columns(items).map(([root]) => `minmax(0, ${root.width}fr)`).join(" ");
}

export function boardPositions(items: LayoutItem[]) {
  const positions: Record<string, { column: number; row: number; span: number }> = {};
  const groups = columns(items);
  const rows = Math.max(1, ...groups.map(group => group.length));
  groups.forEach((column, col) => column.forEach((item, row) => {
    if (item.id) positions[item.id] = { column: col + 1, row: row + 1, span: column.length === 1 ? rows : 1 };
  }));
  return positions;
}
