import { useEffect, useRef, useState } from "react";

const useParentWidth = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const newWidth = entry.contentRect.width;
      setParentWidth(newWidth);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, parentWidth };
};

export default useParentWidth;
