"use client";
import { useRouter } from "next/navigation";

export function useOptimizedTransitionRouter() {
  const router = useRouter();

  return {
    push: router.push.bind(router),
  };
}
