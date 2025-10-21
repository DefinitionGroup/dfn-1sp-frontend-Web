import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Transition } from "motion/react";
interface PercentageDiagramVerticalProps {
  percent: number;
  delay?: number;
}
const transition: Transition = {
  duration: 0.2,

  ease: "easeInOut",
};
const PercentageDiagramVertical: React.FC<PercentageDiagramVerticalProps> = ({
  percent,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentValue = isInView ? percent / 100 : 0;
  const activeClipPath = `inset(${100 - percent}% 0% 0% 0%)`;
  const indicatorPosition = ((percent - 4) / 100) * 228; // width of the bars is 228

  const pathRef = useRef<SVGPathElement>(null);
  const currentLength = useMotionValue(0);
  const [totalLength, setTotalLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setTotalLength(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (totalLength > 0 && isInView) {
      animate(currentLength, percentValue * totalLength, { duration: 1, ease: "easeOut" });
    }
  }, [percentValue, totalLength, isInView]);

  const position = useTransform(currentLength, (len) => {
    if (pathRef.current) {
      const point = pathRef.current.getPointAtLength(len);
      return { x: point.x, y: point.y };
    }
    return { x: 0, y: 0 };
  });

  const left = useTransform(position, (pos) => pos.x);
  const topPos = useTransform(position, (pos) => 60 + pos.y);

  return (
    <div ref={ref} className="relative w-[238px] h-[228px]">
      <motion.svg
        className="absolute left-0 bottom-0 "
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{  duration: 0.5, ease: "easeOut" }}
        width="208"
        height="171"
        viewBox="0 0 208 171"
      >
        <motion.path
          opacity="0.5"
          d="M0.342773 168.839C13.3428 173.839 50.1998 167.413 94.9998 133.813C151 91.813 165 33.813 197 10.813"
          stroke="white"
          stroke-dasharray="1 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={transition}
        />
        <path
          d="M203.548 3.57482L195.183 5.81626L201.306 11.94L203.548 3.57482Z"
          fill="#84cc16"
        />
      </motion.svg>

      {/* Active back - clipped to show percentage */}
      <motion.svg
        className="absolute left-0 -bottom-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"

        width="201"
        height="167"
        viewBox="0 0 201 167"
      >
        <motion.path
          ref={pathRef}
          d="M1.45272 161.353C14.4527 166.353 51.1995 159.941 95.9995 126.341C151.999 84.3408 165.999 26.3408 197.999 3.34082"
          strokeDasharray={"1 4"} strokeWidth={3}
          stroke="#84cc16"     stroke-linecap="round"
          initial={{ pathLength: 0}}
          animate={{ pathLength: percentValue }}
            transition={{ duration:1.2, ease: "easeOut" }}
        />
      </motion.svg>
      <motion.p
        className="bg-lime-500 px-2 w-fit rounded-full text-black -ml-2 text-xxs absolute"
        style={{ left, top: topPos }}
        transition={transition}
      >
        {percent} %
      </motion.p>
    </div>
  );
};

export default PercentageDiagramVertical;
const box: React.CSSProperties = {
  position: "absolute",

 
};
