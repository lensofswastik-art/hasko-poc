"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import type { FilterOption } from "@/lib/machines";

export function FilterBottomSheet({
  open,
  label,
  options,
  value,
  onApply,
  onClose,
}: {
  open: boolean;
  label: string;
  options: FilterOption[];
  value: string | null;
  onApply: (value: string | null) => void;
  onClose: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Local until Apply — matches the "Apply pinned" behaviour in CLAUDE.md's
  // mobile finder spec, rather than filtering the instant a row is tapped.
  const [pending, setPending] = useState(value);

  useEffect(() => {
    if (open) setPending(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filter"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[90vh] flex-col rounded-t-[20px] border-t border-line bg-black sm:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={transition}
          >
            <div className="flex items-center justify-between border-b border-line-soft px-6 py-5">
              <span className="figure text-[11px] uppercase tracking-[0.14em] text-muted">
                {label}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex size-11 items-center justify-center text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              <button
                type="button"
                onClick={() => setPending(null)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-lg ${
                  pending === null ? "bg-chip text-chip-ink" : "text-white"
                }`}
              >
                All {label.toLowerCase()}
                {pending === null && <Check size={20} weight="bold" />}
              </button>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPending(opt.value)}
                  className={`figure flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-lg uppercase ${
                    pending === opt.value ? "bg-chip text-chip-ink" : "text-white"
                  }`}
                >
                  {opt.label}
                  {pending === opt.value && <Check size={20} weight="bold" />}
                </button>
              ))}
            </div>

            <div className="border-t border-line-soft p-4">
              <button
                type="button"
                onClick={() => onApply(pending)}
                className="flex h-14 w-full items-center justify-center bg-chip text-base font-semibold text-black transition-colors hover:bg-white"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
