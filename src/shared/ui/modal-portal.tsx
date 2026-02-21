"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ModalPortal({ children }: PropsWithChildren) {
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(children, document.body);
}
