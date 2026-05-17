import { useState, useEffect } from "react";

/**
 * Hook to safely check if code is running on the client side.
 * Prevents hydration mismatches by returning false on server,
 * then true after hydration on client.
 */
export function useIsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

/**
 * Hook to safely access window dimensions.
 * Returns default values on server, actual values on client after hydration.
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}

/**
 * Hook to safely detect mobile breakpoint.
 * Returns false on server, actual value after hydration on client.
 */
export function useIsMobile(breakpoint: number = 768) {
    const { width } = useWindowSize();
    return width > 0 && width < breakpoint;
}
