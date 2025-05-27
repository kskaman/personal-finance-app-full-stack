import { useCallback, useEffect, useRef, useState } from "react";

const useParentWidth = () => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [parentWidth, setParentWidth] = useState<number>(window.innerWidth);

  // this function is executed when React gives us the element node
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // element just mounted 
      nodeRef.current = node;
      setParentWidth(node.getBoundingClientRect().width);
    }
  }, []);

  // keep listening to viewport resizes
  useEffect(() => {
    const handle = () => {
      if (!nodeRef.current) return;
      const newW = nodeRef.current.getBoundingClientRect().width;
      setParentWidth(prev => (prev === newW ? prev : newW));
    };

    // run once in case the element mounted after the first render
    handle();

    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return { containerRef: setRef, parentWidth };
};

export default useParentWidth;
