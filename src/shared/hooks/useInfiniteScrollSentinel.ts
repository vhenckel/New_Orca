import { useEffect } from "react";

interface UseInfiniteScrollSentinelOptions {
  enabled: boolean;
  onLoadMore: () => void;
  root?: Element | null;
  scrollRef?: React.RefObject<HTMLElement | null>;
  rootMargin?: string;
}

export function useInfiniteScrollSentinel(
  sentinelRef: React.RefObject<HTMLElement | null>,
  { enabled, onLoadMore, root, scrollRef, rootMargin = "120px" }: UseInfiniteScrollSentinelOptions,
) {
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !enabled) return;

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      const scrollRoot = scrollRef?.current ?? root ?? null;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) onLoadMore();
        },
        { root: scrollRoot, rootMargin, threshold: 0 },
      );
      observer.observe(target);
    };

    attach();
    const frame = requestAnimationFrame(attach);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [enabled, onLoadMore, root, scrollRef, rootMargin, sentinelRef]);
}
