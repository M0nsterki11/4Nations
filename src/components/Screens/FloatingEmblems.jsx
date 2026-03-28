import React from "react";
import { motion, useReducedMotion } from "motion/react";

const FLOAT_KEYFRAME_TIMES = [0, 0.26, 0.54, 0.8, 1];
const SMOOTH_EASE = [0.42, 0, 0.22, 1];

function scaleKeyframes(values, multiplier) {
  return values.map((value) => Number((value * multiplier).toFixed(2)));
}

function createOrbMotion(config) {
  const {
    x,
    y,
    rotate = [0, 0.8, -0.5, 0.6, 0],
    scale = [1, 1.02, 0.995, 1.01, 1],
    duration,
  } = config;

  return {
    x,
    y,
    rotate,
    scale,
    duration,
  };
}

const DEFAULT_EMBLEMS = [
  {
    id: "air",
    icon: "🌪️",
    positionClass: "start-emblem-1",
    motion: createOrbMotion({
      x: [0, 15, -9, 6, 0],
      y: [0, -20, -8, 10, 0],
      rotate: [0, 1.4, -0.9, 0.7, 0],
      scale: [1, 1.032, 0.992, 1.016, 1],
      duration: 7,
    }),
  },
  {
    id: "earth",
    icon: "🌱",
    positionClass: "start-emblem-2",
    motion: createOrbMotion({
      x: [0, -13, 14, -8, 0],
      y: [0, 12, -9, -16, 0],
      rotate: [0, -1, 0.9, -0.6, 0],
      scale: [1, 1.024, 0.994, 1.014, 1],
      duration: 8.1,
    }),
  },
  {
    id: "water",
    icon: "💧",
    positionClass: "start-emblem-3",
    motion: createOrbMotion({
      x: [0, 12, -15, 8, 0],
      y: [0, -11, 8, 17, 0],
      rotate: [0, 1.1, -1.2, 0.6, 0],
      scale: [1, 1.028, 0.993, 1.016, 1],
      duration: 7.5,
    }),
  },
  {
    id: "fire",
    icon: "🔥",
    positionClass: "start-emblem-4",
    motion: createOrbMotion({
      x: [0, -16, 10, -5, 0],
      y: [0, 15, -10, -18, 0],
      rotate: [0, -1.2, 1, -0.7, 0],
      scale: [1, 1.034, 0.991, 1.018, 1],
      duration: 6.7,
    }),
  },
];

function getAnimationProps(motionConfig, prefersReducedMotion) {
  const amplitudeMultiplier = prefersReducedMotion ? 0.45 : 1;
  const duration = prefersReducedMotion
    ? motionConfig.duration * 1.35
    : motionConfig.duration;

  return {
    initial: {
      x: motionConfig.x[0],
      y: motionConfig.y[0],
      rotate: motionConfig.rotate[0],
      scale: motionConfig.scale[0],
    },
    animate: {
      x: scaleKeyframes(motionConfig.x, amplitudeMultiplier),
      y: scaleKeyframes(motionConfig.y, amplitudeMultiplier),
      rotate: scaleKeyframes(motionConfig.rotate, amplitudeMultiplier),
      scale: prefersReducedMotion
        ? motionConfig.scale.map((value) => 1 + (value - 1) * 0.45)
        : motionConfig.scale,
    },
    transition: {
      duration,
      ease: SMOOTH_EASE,
      repeat: Infinity,
      repeatType: "loop",
      times: FLOAT_KEYFRAME_TIMES,
    },
  };
}

function FloatingEmblems({
  className = "start-emblems",
  items = DEFAULT_EMBLEMS,
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className}>
      {items.map(({ id, icon, positionClass, motion: motionConfig }, index) => {
        const animation = getAnimationProps(motionConfig, prefersReducedMotion);

        return (
          <motion.span
            key={id}
            className={`start-emblem ${positionClass}`}
            style={{
              "--emblem-delay": `${(index * -1.2).toFixed(1)}s`,
              transformOrigin: "center center",
            }}
            initial={animation.initial}
            animate={animation.animate}
            transition={animation.transition}
          >
            <span className="start-emblem-core">{icon}</span>
          </motion.span>
        );
      })}
    </div>
  );
}

export default FloatingEmblems;
