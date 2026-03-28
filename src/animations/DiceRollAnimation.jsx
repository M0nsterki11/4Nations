import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/DiceRollAnimation.css";

const DEFAULT_DURATION = 1100;
const START_FRAME_DELAY_MS = 60;
const END_FRAME_DELAY_MS = 150;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getFrameDelay = (elapsed, duration) => {
  const progress = clamp(elapsed / duration, 0, 1);
  const slowdownCurve = progress * progress;

  return (
    START_FRAME_DELAY_MS +
    (END_FRAME_DELAY_MS - START_FRAME_DELAY_MS) * slowdownCurve
  );
};

// This is the single place to tweak later when the roll needs to stop on a result.
const getRestingFrameIndex = (lastFrameIndex) => lastFrameIndex;

function DiceRollAnimation({
  frames,
  isRolling,
  duration = DEFAULT_DURATION,
  onComplete,
  className = "",
}) {
  const safeFrames = useMemo(
    () => (Array.isArray(frames) ? frames.filter(Boolean) : []),
    [frames]
  );
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const timeoutRef = useRef(null);
  const startedAtRef = useRef(0);
  const activeFrameRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRolling || safeFrames.length > 0) {
      return;
    }

    onCompleteRef.current?.();
  }, [isRolling, safeFrames.length]);

  useEffect(() => {
    if (!isRolling) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      isAnimatingRef.current = false;
      setIsAnimating(false);
      return;
    }

    if (!safeFrames.length || isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    startedAtRef.current = performance.now();
    activeFrameRef.current = 0;
    setActiveFrameIndex(0);
    setIsAnimating(true);

    const tick = () => {
      const elapsed = performance.now() - startedAtRef.current;

      if (elapsed >= duration) {
        const restingFrameIndex = getRestingFrameIndex(activeFrameRef.current);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        activeFrameRef.current = restingFrameIndex;
        isAnimatingRef.current = false;
        setActiveFrameIndex(restingFrameIndex);
        setIsAnimating(false);
        onCompleteRef.current?.();
        return;
      }

      activeFrameRef.current = (activeFrameRef.current + 1) % safeFrames.length;
      setActiveFrameIndex(activeFrameRef.current);

      timeoutRef.current = setTimeout(
        tick,
        getFrameDelay(elapsed, duration)
      );
    };

    timeoutRef.current = setTimeout(tick, START_FRAME_DELAY_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      isAnimatingRef.current = false;
    };
  }, [duration, isRolling, safeFrames]);

  if (!safeFrames.length) {
    return null;
  }

  const activeFrame = safeFrames[activeFrameIndex] ?? safeFrames[0];
  const classes = [
    "dice-roll-animation",
    isAnimating && "dice-roll-animation-active",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{ "--dice-roll-duration": `${duration}ms` }}
      aria-hidden="true"
    >
      <div className="dice-roll-frame-shell">
        <img
          src={activeFrame}
          alt=""
          className="dice-roll-frame-image"
          draggable="false"
        />
      </div>
    </div>
  );
}

export default DiceRollAnimation;
