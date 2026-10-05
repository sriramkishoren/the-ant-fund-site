// Saved strategies, kept in the browser. No account, no server — which is also
// the point: if nobody saves or shares anything, accounts would not have helped.

import { decodePosition, encodePosition } from './url-state';
import type { Position } from './types';

const KEY = 'taf:strategies';
const LIMIT = 50;

export interface SavedStrategy {
  id: string;
  name: string;
  /** ISO timestamp. */
  savedAt: string;
  /** The position, in the same compact form the share link uses. */
  encoded: string;
}

function read(): SavedStrategy[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SavedStrategy =>
        !!s && typeof s === 'object' && typeof (s as SavedStrategy).encoded === 'string',
    );
  } catch {
    // Private browsing, blocked storage, or corrupted JSON — behave as empty.
    return [];
  }
}

function write(list: SavedStrategy[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)));
  } catch {
    // Non-fatal: the strategy just will not survive a reload.
  }
}

export function listStrategies(): SavedStrategy[] {
  return read();
}

export function saveStrategy(name: string, position: Position): SavedStrategy[] {
  const entry: SavedStrategy = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || 'Untitled strategy',
    savedAt: new Date().toISOString(),
    encoded: encodePosition(position),
  };
  const next = [entry, ...read()];
  write(next);
  return next.slice(0, LIMIT);
}

export function deleteStrategy(id: string): SavedStrategy[] {
  const next = read().filter((s) => s.id !== id);
  write(next);
  return next;
}

export function loadStrategy(entry: SavedStrategy): Position | null {
  return decodePosition(entry.encoded);
}
