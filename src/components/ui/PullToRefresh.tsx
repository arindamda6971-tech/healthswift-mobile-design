import { ReactNode, useCallback, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

const PullToRefresh = ({ children, onRefresh, threshold = 80 }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring animation for smooth release
  const springConfig = { stiffness: 400, damping: 30 };
  const pullSpring = useSpring(0, springConfig);
  
  // Transform pull distance to various visual effects
  const loaderOpacity = useTransform(pullSpring, [0, threshold * 0.5, threshold], [0, 0.5, 1]);
  const loaderScale = useTransform(pullSpring, [0, threshold], [0.5, 1]);
  const loaderRotation = useTransform(pullSpring, [0, threshold], [0, 180]);
  const progressStroke = useTransform(pullSpring, [0, threshold], [0, 251]); // 251 is the circumference

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      isPulling.current = false;
      setPullDistance(0);
      pullSpring.set(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0) {
      // Natural resistance - the further you pull, the harder it gets
      const resistance = 0.4;
      const dampedDistance = Math.pow(distance, resistance) * 3;
      const clampedDistance = Math.min(dampedDistance, threshold * 1.5);
      
      setPullDistance(clampedDistance);
      pullSpring.set(clampedDistance);
      
      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isRefreshing, threshold, pullSpring]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      pullSpring.set(threshold * 0.75);
      
      try {
        await onRefresh();
      } finally {
        // Smooth exit animation
        pullSpring.set(0);
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      pullSpring.set(0);
      setPullDistance(0);
    }
    
    startY.current = 0;
  }, [pullDistance, threshold, isRefreshing, onRefresh, pullSpring]);

  const isActive = pullDistance > 0 || isRefreshing;

  return (
    <div 
      className="relative h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
        style={{ 
          y: useTransform(pullSpring, [0, threshold], [-40, 16]),
          opacity: loaderOpacity,
          scale: loaderScale,
        }}
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Progress circle */}
          <svg className="absolute w-10 h-10 -rotate-90">
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="251"
              style={{ 
                strokeDashoffset: useTransform(progressStroke, v => 251 - v)
              }}
            />
          </svg>
          
          {/* Icon */}
          <motion.div
            style={{ rotate: isRefreshing ? 0 : loaderRotation }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            } : {}}
          >
            <RefreshCw 
              className="w-4 h-4 text-primary" 
              strokeWidth={2.5}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content container */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto overscroll-none"
        style={{
          y: pullSpring,
          scale: useTransform(pullSpring, [0, threshold * 1.5], [1, 0.985]),
        }}
      >
        {children}
      </motion.div>

      {/* Subtle overlay when pulling */}
      <motion.div
        className="absolute inset-0 bg-primary/5 pointer-events-none"
        style={{
          opacity: useTransform(pullSpring, [0, threshold], [0, isActive ? 0.5 : 0]),
        }}
      />
    </div>
  );
};

export default PullToRefresh;
