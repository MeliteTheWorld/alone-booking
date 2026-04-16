import { useLayoutEffect, useRef, useState } from "react";

export default function AnimatedCollapse({
  open,
  className = "",
  children
}) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return undefined;
    }

    const measure = () => {
      setHeight(content.scrollHeight);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      aria-hidden={!open}
      className={`${className} overflow-hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{
        maxHeight: open ? `${height}px` : "0px",
        transform: "none"
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
