import { useCallback, useRef, useState } from "react";

const useParentWidth = () => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [parentWidth, setParentWidth] = useState<number>(window.innerWidth);

  const observerRef = useRef<ResizeObserver | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect(); // cleanup any previous observer
      observerRef.current = null;
    }

    if (node) {
      nodeRef.current = node;
      const width = node.getBoundingClientRect().width;
      setParentWidth(width);

      // setup ResizeObserver when node is available
      observerRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const newWidth = entry.contentRect.width;
          setParentWidth(prev => (prev !== newWidth ? newWidth : prev));
        }
      });

      observerRef.current.observe(node);
    }
  }, []);

  return { containerRef: setRef, parentWidth };
};

export default useParentWidth;
