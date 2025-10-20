import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface PercentageDiagramVerticalProps {
  percent: number;
  delay?: number;
}

const PercentageDiagramVertical: React.FC<PercentageDiagramVerticalProps> = ({
  percent,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const activeClipPath = `inset(${100 - percent}% 0 0 0)`;
  const indicatorPosition = ((percent - 4) / 100) * 228; // width of the bars is 228

  return (
    <div ref={ref} className="relative w-[238px] h-[228px]">
      <motion.svg
        className="absolute left-0 bottom-0 "
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay, duration: 0.5, ease: "easeOut" }}
        width="208"
        height="171"
        viewBox="0 0 208 171"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.5"
          d="M0.342773 168.839C13.3428 173.839 50.1998 167.413 94.9998 133.813C151 91.813 165 33.813 197 10.813"
          stroke="white"
          stroke-dasharray="1 3"
        />
        <path
          d="M203.548 3.57482L195.183 5.81626L201.306 11.94L203.548 3.57482Z"
          fill="#00FF48"
        />
      </motion.svg>

      {/* Active back - clipped to show percentage */}
      <motion.svg
        className="absolute left-0 -translate-x-1/ bottom-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        animate={isInView ? { opacity: 1, clipPath: activeClipPath } : {}}
        transition={{
          opacity: { delay: 0.9 + delay, duration: 0.5 },
          clipPath: {
            delay: 0.9 + delay,
            duration: 2.8,
            ease: "easeInOut",
          },
        }}
        width="201"
        height="167"
        viewBox="0 0 201 167"
      >
        <path
          d="M1.45272 161.353C14.4527 166.353 51.1995 159.941 95.9995 126.341C151.999 84.3408 165.999 26.3408 197.999 3.34082"
          stroke="#00FF48"
          stroke-width="8"
          stroke-dasharray="1 4"
        />
      </motion.svg>
      <motion.svg
        className="absolute left-1/2 -translate-x-1/2 top-0"
        width="71"
        height="38"
        viewBox="0 0 71 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? { opacity: 1, y: indicatorPosition } : {}}
        transition={{ delay: 0.9 + delay, duration: 0.8, ease: "easeOut" }}
      >
        <rect x="0.5" y="0.5" width="70" height="37" rx="18.5" fill="#84cc16" />
        <text
          x="35.5"
          y="22"
          text-anchor="middle"
          className="text-white text-xs font-bold"
        >
          {percent}%
        </text>
      </motion.svg>
    </div>
  );
};

export default PercentageDiagramVertical;
