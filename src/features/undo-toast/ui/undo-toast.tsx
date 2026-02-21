"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { useAppStore } from "@/store/use-app-store";

export function UndoToast(): JSX.Element {
  const undoStack = useAppStore((state) => state.undoStack);
  const undoLastAction = useAppStore((state) => state.undoLastAction);

  const latest = undoStack.at(-1);

  return (
    <AnimatePresence>
      {latest ? (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft"
        >
          <span className="text-sm">{latest.label}</span>
          <Button variant="primary" onClick={undoLastAction}>
            Undo
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
