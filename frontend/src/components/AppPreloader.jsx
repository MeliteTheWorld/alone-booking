import { useEffect, useRef, useState } from "react";

const MIN_PRELOADER_TIME_MS = 700;
const EXIT_DURATION_MS = 260;

export default function AppPreloader() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const loadResolvedRef = useRef(false);
  const minTimePassedRef = useRef(false);

  useEffect(() => {
    let exitTimeoutId;

    const finish = () => {
      if (!loadResolvedRef.current || !minTimePassedRef.current) {
        return;
      }

      setVisible(false);
      exitTimeoutId = window.setTimeout(() => {
        setMounted(false);
      }, EXIT_DURATION_MS);
    };

    const minTimerId = window.setTimeout(() => {
      minTimePassedRef.current = true;
      finish();
    }, MIN_PRELOADER_TIME_MS);

    const handleLoad = () => {
      loadResolvedRef.current = true;
      finish();
    };

    if (document.readyState === "complete") {
      loadResolvedRef.current = true;
    } else {
      window.addEventListener("load", handleLoad);
    }

    finish();

    return () => {
      window.clearTimeout(minTimerId);
      window.clearTimeout(exitTimeoutId);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`app-preloader ${visible ? "app-preloader-visible" : "app-preloader-hidden"}`}
    >
      <div className="app-preloader-mark">
        <div className="app-preloader-rhombus">
          <svg
            aria-hidden="true"
            className="app-preloader-rhombus-icon"
            fill="none"
            viewBox="0 0 64 64"
          >
            <rect
              x="12"
              y="12"
              width="40"
              height="40"
              rx="8"
              transform="rotate(45 32 32)"
              stroke="white"
              strokeWidth="5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
