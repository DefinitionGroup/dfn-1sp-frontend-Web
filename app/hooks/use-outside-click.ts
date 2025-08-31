import React, { useEffect } from "react";

// Accept both RefObject and MutableRefObject shapes
type AnyRef<T extends HTMLElement = HTMLElement> = { current: T | null };

export const useOutsideClick = (
  ref: AnyRef,
  callback: Function
) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
