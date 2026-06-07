import { useSyncExternalStore } from "react";
import {
  seedOpportunities,
  defaultCategories as seedCategories,
  type Opportunity,
} from "./opportunities";

const STORAGE_KEY = "startitup:opportunities:v1";
const CATS_KEY = "startitup:categories:v1";

type State = {
  items: Opportunity[];
  categories: string[];
};

function isBrowser() {
  return typeof window !== "undefined";
}

function load(): State {
  if (!isBrowser()) return { items: seedOpportunities, categories: seedCategories };
  try {
    const rawI = localStorage.getItem(STORAGE_KEY);
    const rawC = localStorage.getItem(CATS_KEY);
    return {
      items: rawI ? (JSON.parse(rawI) as Opportunity[]) : seedOpportunities,
      categories: rawC ? (JSON.parse(rawC) as string[]) : seedCategories,
    };
  } catch {
    return { items: seedOpportunities, categories: seedCategories };
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  localStorage.setItem(CATS_KEY, JSON.stringify(state.categories));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Re-hydrate on first browser tick (handles SSR mismatch gracefully)
if (isBrowser()) {
  state = load();
}

export function useOpportunitiesStore() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => ({ items: seedOpportunities, categories: seedCategories }),
  );
}

export function getAllOpportunities() {
  return state.items;
}

export function getOpportunityById(id: string) {
  return state.items.find((o) => o.id === id);
}

export function upsertOpportunity(o: Opportunity) {
  const idx = state.items.findIndex((x) => x.id === o.id);
  const next = [...state.items];
  if (idx >= 0) next[idx] = o;
  else next.unshift(o);
  state = { ...state, items: next };
  persist();
  emit();
}

export function deleteOpportunity(id: string) {
  state = { ...state, items: state.items.filter((o) => o.id !== id) };
  persist();
  emit();
}

export function setCategories(cats: string[]) {
  const cleaned = Array.from(new Set(cats.map((c) => c.trim()).filter(Boolean)));
  state = { ...state, categories: cleaned };
  persist();
  emit();
}

export function resetToDefaults() {
  state = { items: seedOpportunities, categories: seedCategories };
  persist();
  emit();
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export type { Opportunity };
