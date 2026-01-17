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
            
            // Dynamic gradient colors based on index
            const gradients = [
              "from-primary/90 via-primary/70 to-sky-400/80",
              "from-emerald-500/90 via-teal-500/70 to-cyan-400/80",
              "from-violet-500/90 via-purple-500/70 to-fuchsia-400/80",
              "from-orange-500/90 via-amber-500/70 to-yellow-400/80",
              "from-rose-500/90 via-pink-500/70 to-red-400/80",
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <div
                key={center.id}
                className="flex-[0_0_88%] min-w-0 pl-4 first:pl-4 last:pr-4"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.9,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  onClick={() => navigate(`/lab/${center.id}`)}
                  className={`relative bg-gradient-to-br ${gradient} rounded-3xl shadow-xl cursor-pointer overflow-hidden`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/5 rounded-full" />
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-5">
                      {/* Logo/Icon */}
                      <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border border-white/30">
                        {center.logo ? (
                          <img 
                            src={center.logo} 
                            alt={center.name} 
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Building2 className="w-10 h-10 text-white" />
                        )}
                      </div>
                      
                      {/* Center Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-lg leading-tight line-clamp-2">
                          {center.name}
                        </h4>
                        
                        <div className="flex items-center gap-3 mt-3">
                          {/* Rating */}
                          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                            <span className="text-sm font-bold text-white">
                              {center.rating}
                            </span>
                          </div>
                          
                          {/* Tests Count */}
                          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <TestTubes className="w-4 h-4 text-white" />
                            <span className="text-sm font-semibold text-white">
                              {center.tests}+ tests
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-white/80 text-sm font-medium">Explore tests & packages</span>
                      <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-white font-semibold text-sm">View Lab</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
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
