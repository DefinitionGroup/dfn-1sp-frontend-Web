"use client";
import { useTransitionRouter as useNextTransitionRouter } from "next-view-transitions";
import { useRouter as useNextRouter } from "next/navigation";
import { useCallback, useRef } from "react";

const TRANSITION_TIMEOUT = 1500; // Skip transition if navigation takes longer than 1.5s

export function useOptimizedTransitionRouter() {
    const transitionRouter = useNextTransitionRouter();
    const fallbackRouter = useNextRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const push = useCallback(
        (href: string) => {
            let transitionCompleted = false;

            // Set a timeout to skip transition if it takes too long
            timeoutRef.current = setTimeout(() => {
                if (!transitionCompleted) {
                    console.log(
                        "Navigation taking longer than expected, using instant navigation"
                    );
                    fallbackRouter.push(href);
                }
            }, TRANSITION_TIMEOUT);

            // Attempt transition with timeout
            try {
                transitionRouter.push(href);
                transitionCompleted = true;
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            } catch (error) {
                console.error("Transition error, falling back to instant navigation:", error);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                fallbackRouter.push(href);
            }
        },
        [transitionRouter, fallbackRouter]
    );

    return { push };
}
