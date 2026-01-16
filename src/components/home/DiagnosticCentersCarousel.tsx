import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Building2, Star, ChevronRight, TestTubes } from "lucide-react";

interface DiagnosticCenter {
  id: string;
  name: string;
  rating: number;
  tests: number;
  logo?: string;
}

interface DiagnosticCentersCarouselProps {
  centers: DiagnosticCenter[];
  autoPlayInterval?: number;
}

const DiagnosticCentersCarousel = ({ 
  centers, 
  autoPlayInterval = 4000 
}: DiagnosticCentersCarouselProps) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Auto-play logic
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (emblaApi && isPlaying) {
        emblaApi.scrollNext();
      }
    }, autoPlayInterval);
  }, [emblaApi, isPlaying, autoPlayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  // Pause on interaction
  const handlePointerDown = useCallback(() => {
    setIsPlaying(false);
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handlePointerUp = useCallback(() => {
    // Resume after a short delay
    setTimeout(() => {
      setIsPlaying(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", handlePointerDown);
    emblaApi.on("pointerUp", handlePointerUp);
    
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", handlePointerDown);
      emblaApi.off("pointerUp", handlePointerUp);
    };
  }, [emblaApi, onSelect, handlePointerDown, handlePointerUp]);

  // Start/stop auto-play based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isPlaying, startAutoPlay, stopAutoPlay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Diagnostic Centers</h3>
        </div>
        <button 
          onClick={() => navigate('/partner-labs')}
          className="flex items-center gap-1 text-primary text-sm font-medium"
        >
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {centers.map((center, index) => {
            const isActive = index === selectedIndex;
            
            return (
              <div
                key={center.id}
                className="flex-[0_0_85%] min-w-0 pl-4 first:pl-4 last:pr-4"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.92,
                    opacity: isActive ? 1 : 0.7,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  onClick={() => navigate(`/lab/${center.id}`)}
                  className="bg-card rounded-2xl shadow-card border border-border/50 cursor-pointer overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Logo/Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {center.logo ? (
                          <img 
                            src={center.logo} 
                            alt={center.name} 
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      
                      {/* Center Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-base truncate">
                          {center.name}
                        </h4>
                        
                        <div className="flex items-center gap-3 mt-2">
                          {/* Rating */}
                          <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                            <span className="text-sm font-semibold text-foreground">
                              {center.rating}
                            </span>
                          </div>
                          
                          {/* Tests Count */}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TestTubes className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {center.tests}+ tests
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {centers.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              width: index === selectedIndex ? 20 : 6,
              backgroundColor: index === selectedIndex 
                ? "hsl(var(--primary))" 
                : "hsl(var(--muted-foreground) / 0.3)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default DiagnosticCentersCarousel;
