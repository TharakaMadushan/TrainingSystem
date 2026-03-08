'use client';
import { useState, useEffect, useRef } from 'react';

/**
 * Hook that animates a number from 0 to target value.
 * Returns the current animated value.
 */
export function useAnimatedCounter(target: number, duration: number = 1200, decimals: number = 0): number {
    const [current, setCurrent] = useState(0);
    const prevTarget = useRef(0);
    const rafId = useRef<number>(0);

    useEffect(() => {
        const start = prevTarget.current;
        const diff = target - start;
        if (diff === 0) return;

        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = start + diff * eased;

            setCurrent(Number(value.toFixed(decimals)));

            if (progress < 1) {
                rafId.current = requestAnimationFrame(animate);
            } else {
                prevTarget.current = target;
            }
        };

        rafId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId.current);
    }, [target, duration, decimals]);

    return current;
}
