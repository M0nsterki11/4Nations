import { motion, AnimatePresence } from "framer-motion";
import doorImg from "../assets/door.png";

export default function LeaveAnimation({
  isLeaving,
  currentIcon,
  onComplete,
}) {
  return (
    <AnimatePresence>
      {isLeaving && (
        <motion.div
          className="leave-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Vrata u sredini ekrana */}
          <motion.img
            src={doorImg}
            alt="Exit door"
            className="leave-door"
            initial={{ scaleX: 1, opacity: 1 }}
            animate={{
              scaleX: 0,
              opacity: 0,
              rotateY: 0,   // ostavi 0 jer radi fake 2D opening
            }}
            transition={{
              delay: 0.9,
              duration: 0.6,
              ease: "easeInOut"
            }}
          />

          {/* Igrač (emoji) koji doskakuće i ulazi kroz vrata */}
          <motion.div
            className="leave-character"
            initial={{ x: 80, y: 0, opacity: 1, scale: 1 }}
            animate={{
              // 3 "bounca" prema vratima
              x: [80, 55, 55, 30, 30, 5, 5, 0],
              y: [0, -20, 0, -15, 0, -10, 0, 0],
              scale: [1, 1.05, 1, 1.05, 1, 1.05, 1, 0.6],
              opacity: [1, 1, 1, 1, 1, 1, 1, 0],
            }}
            transition={{ duration: 1.7, ease: "easeInOut",}}
            onAnimationComplete={onComplete}
          >
            <span className="leave-character-icon">{currentIcon}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}