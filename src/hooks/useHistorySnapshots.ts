import { useCallback, useEffect, useState } from "react";

export type HistorySnapshot<T> = {
  id: string;
  label: string;
  createdAt: string;
  data: T;
};

const MAX_SNAPSHOTS = 20;

export const useHistorySnapshots = <T,>(scope: string) => {
  const storageKey = `ms-history-${scope}`;
  const [snapshots, setSnapshots] = useState<HistorySnapshot<T>[]>([]);

  useEffect(() => {
    try {
      setSnapshots(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      setSnapshots([]);
    }
  }, [storageKey]);

  const store = useCallback((next: HistorySnapshot<T>[]) => {
    const limited = next.slice(0, MAX_SNAPSHOTS);
    setSnapshots(limited);
    localStorage.setItem(storageKey, JSON.stringify(limited));
  }, [storageKey]);

  const capture = useCallback((label: string, data: T) => {
    const snapshot: HistorySnapshot<T> = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      createdAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)) as T,
    };
    setSnapshots(previous => {
      const next = [snapshot, ...previous].slice(0, MAX_SNAPSHOTS);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const remove = (id: string) => store(snapshots.filter(snapshot => snapshot.id !== id));
  const clear = () => store([]);

  return { snapshots, capture, remove, clear };
};
