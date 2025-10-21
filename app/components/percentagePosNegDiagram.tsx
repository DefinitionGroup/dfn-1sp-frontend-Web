import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface PercentagePosNegDiagramProps {
  value: number; // positive for positive bar, negative for negative bar
}

const PercentagePosNegDiagram: React.FC<PercentagePosNegDiagramProps> = ({
  value,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const isPositive = value >= 0;
  const percent = Math.abs(value);
  const displayValue = Math.round(value);

  // Background dimensions
  const bgWidth = 258;
  const bgHeight = 144;
  const centerX = 128.5;
  const barY = 71.0879;
  const barLength = 120; // from center to end

  // Positive bar: from centerX to centerX + barLength
  // Negative bar: from centerX - barLength to centerX

  const offset = (percent / 100) * barLength;
  const indicatorX = isPositive ? centerX + offset : centerX - offset;

  const positiveClipPath = `inset(0 ${100 - percent}% 0 0)`;
  const negativeClipPath = `inset(0 0 0 ${100 - percent}%)`;

  return (
    <div
      ref={ref}
      className="relative min-h-[160px] mt-16"
      style={{ width: bgWidth, height: bgHeight }}
    >
      {/* Background Grid */}
      <motion.svg
        className="absolute top-0 left-0"
        width={bgWidth}
        height={bgHeight}
        viewBox={`0 0 ${bgWidth} ${bgHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <line
          opacity="0.3"
          x1={centerX}
          y1="0.372559"
          x2={centerX}
          y2="62.8726"
          stroke="#D2D6DB"
        />
        <line
          opacity="0.3"
          x1={centerX}
          y1="81"
          x2={centerX}
          y2="143"
          stroke="#D2D6DB"
        />
        <line
          x1="138"
          y1={barY}
          x2="258"
          y2={barY}
          stroke="white"
          stroke-dasharray="1 4"
        />
        <line
          x1="1"
          y1={barY}
          x2="120"
          y2={barY}
          stroke="white"
          stroke-dasharray="1 8"
        />
        <circle
          opacity="0.3"
          cx={centerX}
          cy={barY - 0.2153}
          r="4"
          fill="#D9D9D9"
        />
      </motion.svg>

      {/* Positive Values Bar */}
      {isPositive && (
        <motion.svg
          className="absolute"
          style={{ top: barY - 5, left: centerX + 7 }}
          width={barLength}
          height="10"
          viewBox="0 0 130 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          animate={isInView ? { opacity: 1, clipPath: positiveClipPath } : {}}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <line
            x1="1"
            y1="4"
            x2="130"
            y2="5"
            stroke="#84cc16"
            stroke-width="122"
            stroke-dasharray="1 4"
          />
        </motion.svg>
      )}

      {/* Negative Values Bar */}
      {!isPositive && (
        <motion.svg
          className="absolute"
          style={{ top: barY - 4, left: centerX - barLength }}
          width={barLength}
          height="9"
          viewBox="0 0 130 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, clipPath: "inset(0 0 0 100%)" }}
          animate={isInView ? { opacity: 1, clipPath: negativeClipPath } : {}}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <line
            x1="-1"
            y1="4"
            x2="120"
            y2="4"
            stroke="white"
            stroke-width="122"
            stroke-dasharray="1 4"
          />
        </motion.svg>
      )}

      {/* Vertical Indicator */}
      <motion.div
        className="absolute"
        style={{ left: centerX - 5, top: barY - 120 }} // center the indicator
        initial={{ opacity: 0, x: 0 }}
        animate={
          isInView ? { opacity: 1, x: isPositive ? offset : -offset } : {}
        }
        transition={{
          delay: 0.2,
          opacity: { duration: 0.3, ease: "easeOut" },
          x: { duration: 0.8, ease: "easeOut" },
        }}
      >
        <svg
          width="27"
          height="200"
          viewBox="0 0 27 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="8.20874" y1="-10" x2="8.20874" y2="120" stroke="#84cc16" />
          <text x="0" y="130" fill="#84cc16" font-family="Arial" font-size="9">
            {displayValue} %
          </text>
        </svg>
      </motion.div>
    </div>
  );
};

export default PercentagePosNegDiagram;
