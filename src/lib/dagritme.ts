/** Append after the latest lesson without wrapping back to the morning. */
export function nextLessonTime(blocks: { time: string }[]): string {
  const times = blocks.map(block => {
    if (!/^\d{1,2}:\d{2}$/.test(block.time)) return -1;
    const [hour, minute] = block.time.split(":").map(Number);
    return hour < 24 && minute < 60 ? hour * 60 + minute : -1;
  }).filter(time => time >= 0);
  if (!times.length) return "08:30";
  const next = Math.min(23 * 60 + 59, Math.max(...times) + 30);
  return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
}

/** Lessons move between the existing chronological time slots. */
export function reorderLessons<T extends { id: string; time: string }>(blocks: T[], fromId: string, toId: string): T[] {
  const from = blocks.findIndex(b => b.id === fromId);
  const to = blocks.findIndex(b => b.id === toId);
  if (from < 0 || to < 0 || from === to) return blocks;
  const times = blocks.map(b => b.time).sort((a, b) => a.localeCompare(b));
  const reordered = [...blocks];
  reordered.splice(to, 0, reordered.splice(from, 1)[0]);
  return reordered.map((block, index) => ({ ...block, time: times[index] }));
}
