import { useSyncExternalStore } from "react";

let open = false;
let collapsed = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setOpen(value: boolean) {
  if (open !== value) {
    open = value;
    emit();
  }
}

export function setCollapsed(value: boolean) {
  if (collapsed !== value) {
    collapsed = value;
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getOpenSnapshot() {
  return open;
}

function getCollapsedSnapshot() {
  return collapsed;
}

export function useSidebarOpen() {
  const openValue = useSyncExternalStore(
    subscribe,
    getOpenSnapshot,
    getOpenSnapshot,
  );
  const collapsedValue = useSyncExternalStore(
    subscribe,
    getCollapsedSnapshot,
    getCollapsedSnapshot,
  );

  return {
    open: openValue,
    collapsed: collapsedValue,
    setOpen,
    setCollapsed,
  };
}
