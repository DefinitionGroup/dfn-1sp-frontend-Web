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
          y1="81.3726"
          x2={centerX}
          y2="143.873"
          stroke="#D2D6DB"
        />
        <line
          x1="137.998"
          y1={barY}
          x2="257.998"
          y2={barY}
          stroke="white"
          stroke-dasharray="1 4"
        />
        <line
          y1={barY}
          x2="120"
          y2={barY}
          stroke="white"
          stroke-dasharray="1 4"
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
          style={{ top: barY - 4, left: centerX }}
          width={barLength}
          height="9"
          viewBox="0 0 130 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          animate={isInView ? { opacity: 1, clipPath: positiveClipPath } : {}}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
        >
          <line
            x1="0.0529785"
            y1="4.48633"
            x2="130"
            y2="4.48633"
            stroke="#84cc16"
            stroke-width="8"
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
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
        >
          <line
            x1="0.0529785"
            y1="4.48633"
            x2="130"
            y2="4.48633"
            stroke="white"
            stroke-width="8"
            stroke-dasharray="1 4"
          />
        </motion.svg>
      )}

      {/* Vertical Indicator */}
      <motion.div
        className="absolute"
        style={{ left: centerX - 13.5, top: barY - 40 }} // center the indicator
        initial={{ opacity: 0, x: 0 }}
        animate={
          isInView ? { opacity: 1, x: isPositive ? offset : -offset } : {}
        }
        transition={{
          opacity: { delay: 0.4, duration: 0.3 },
          x: { delay: 0.7, type: "spring", stiffness: 100, damping: 10 },
        }}
      >
        <svg
          width="27"
          height="80"
          viewBox="0 0 27 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="8.20874" y1="21" x2="8.20874" y2="79.5" stroke="#84cc16" />
          <text x="0" y="15" fill="#84cc16" font-family="Arial" font-size="12">
            {displayValue}
          </text>
          <path
            d="M21.536 12.6C21.104 12.6 20.768 12.44 20.528 12.12C20.2933 11.7947 20.176 11.3787 20.176 10.872C20.176 10.3653 20.2933 9.952 20.528 9.632C20.768 9.30667 21.104 9.144 21.536 9.144C21.968 9.144 22.3013 9.30667 22.536 9.632C22.776 9.952 22.896 10.3653 22.896 10.872C22.896 11.3787 22.776 11.7947 22.536 12.12C22.3013 12.44 21.968 12.6 21.536 12.6ZM21.536 12.072C21.776 12.072 21.9547 11.968 22.072 11.76C22.1947 11.552 22.256 11.256 22.256 10.872C22.256 10.488 22.1947 10.192 22.072 9.984C21.9547 9.776 21.776 9.672 21.536 9.672C21.296 9.672 21.1147 9.776 20.992 9.984C20.8747 10.192 20.816 10.488 20.816 10.872C20.816 11.256 20.8747 11.552 20.992 11.76C21.1147 11.968 21.296 12.072 21.536 12.072ZM24.744 9.24H25.392L22.344 15H21.696L24.744 9.24ZM25.552 15.096C25.12 15.096 24.784 14.936 24.544 14.616C24.3093 14.2907 24.192 13.8747 24.192 13.368C24.192 12.8613 24.3093 12.448 24.544 12.128C24.784 11.8027 25.12 11.64 25.552 11.64C25.984 11.64 26.3173 11.8027 26.552 12.128C26.792 12.448 26.912 12.8613 26.912 13.368C26.912 13.8747 26.792 14.2907 26.552 14.616C26.3173 14.936 25.984 15.096 25.552 15.096ZM25.552 14.568C25.792 14.568 25.9707 14.464 26.088 14.256C26.2107 14.048 26.272 13.752 26.272 13.368C26.272 12.984 26.2107 12.688 26.088 12.48C25.9707 12.272 25.792 12.168 25.552 12.168C25.312 12.168 25.1307 12.272 25.008 12.48C24.8907 12.688 24.832 12.984 24.832 13.368C24.832 13.752 24.8907 14.048 25.008 14.256C25.1307 14.464 25.312 14.568 25.552 14.568Z"
            fill="white"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default PercentagePosNegDiagram;
