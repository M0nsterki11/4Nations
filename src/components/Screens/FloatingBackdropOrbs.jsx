import React from "react";
import { motion, useReducedMotion } from "motion/react";

const ORB_KEYFRAME_TIMES = [0, 0.24, 0.56, 0.82, 1];
const SMOOTH_EASE = [0.42, 0, 0.22, 1];

function scaleKeyframes(values, multiplier) {
  return values.map((value) => Number((value * multiplier).toFixed(2)));
}

function createOrbMotion({ x, y, scale, opacity, duration, delay }) {
  return {
    x,
    y,
    scale,
    opacity,
    duration,
    delay,
  };
}

const DEFAULT_ORBS = [
  {
    id: "air",
    className: "start-orb start-orb-air",
    motion: createOrbMotion({
      x: [0, 16, -8, 6, 0],
      y: [0, -14, 8, -6, 0],
      scale: [0.84, 1.12, 0.92, 1.02, 0.84],
      opacity: [0.24, 0.5, 0.32, 0.42, 0.24],
      duration: 8.6,
      delay: -1.4,
    }),
  },
  {
    id: "earth",
    className: "start-orb start-orb-earth",
    motion: createOrbMotion({
      x: [0, -12, 10, -6, 0],
      y: [0, 10, -8, -12, 0],
      scale: [0.82, 1.08, 0.9, 1.04, 0.82],
      opacity: [0.24, 0.46, 0.3, 0.4, 0.24],
      duration: 10.8,
      delay: -3.2,
    }),
  },
  {
    id: "water",
    className: "start-orb start-orb-water",
    motion: createOrbMotion({
      x: [0, 14, -12, 7, 0],
      y: [0, -10, 7, 13, 0],
      scale: [0.8, 1.1, 0.88, 1.03, 0.8],
      opacity: [0.24, 0.44, 0.3, 0.38, 0.24],
      duration: 9.4,
      delay: -5,
    }),
  },
  {
    id: "fire",
    className: "start-orb start-orb-fire",
    motion: createOrbMotion({
      x: [0, -18, 10, -6, 0],
      y: [0, 14, -10, -18, 0],
      scale: [0.78, 1.22, 0.92, 1.08, 0.78],
      opacity: [0.24, 0.56, 0.34, 0.46, 0.24],
      duration: 8.1,
      delay: -6.6,
    }),
  },
];

function getOrbAnimation(motionConfig, prefersReducedMotion) {
  const amplitudeMultiplier = prefersReducedMotion ? 0.45 : 1;
  const duration = prefersReducedMotion
    ? motionConfig.duration * 1.35
    : motionConfig.duration;

  return {
    initial: {
      x: motionConfig.x[0],
      y: motionConfig.y[0],
      scale: motionConfig.scale[0],
      opacity: motionConfig.opacity[0],
    },
    animate: {
      x: scaleKeyframes(motionConfig.x, amplitudeMultiplier),
      y: scaleKeyframes(motionConfig.y, amplitudeMultiplier),
      scale: prefersReducedMotion
        ? motionConfig.scale.map((value) => 1 + (value - 1) * 0.45)
        : motionConfig.scale,
      opacity: prefersReducedMotion
        ? motionConfig.opacity.map((value) => Number((value * 0.75).toFixed(2)))
        : motionConfig.opacity,
    },
    transition: {
      duration,
      delay: motionConfig.delay,
      ease: SMOOTH_EASE,
      repeat: Infinity,
      repeatType: "loop",
      times: ORB_KEYFRAME_TIMES,
    },
  };
}

function FloatingBackdropOrbs({ items = DEFAULT_ORBS }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {items.map(({ id, className, motion: motionConfig }) => {
        const animation = getOrbAnimation(motionConfig, prefersReducedMotion);

        return (
          <motion.span
            key={id}
            className={className}
            initial={animation.initial}
            animate={animation.animate}
            transition={animation.transition}
          />
        );
      })}
    </>
  );
}

export default FloatingBackdropOrbs;
