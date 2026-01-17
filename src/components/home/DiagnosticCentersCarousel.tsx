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
            
            // Brand-inspired color themes for popular Indian diagnostic labs
            const brandThemes: Record<string, { gradient: string; accent: string; glow: string }> = {
              "Dr. Lal PathLabs": {
                gradient: "from-[#1e3a8a] via-[#1d4ed8] to-[#3b82f6]",
                accent: "#fbbf24",
                glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              },
              "Thyrocare": {
                gradient: "from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa]",
                accent: "#fbbf24",
                glow: "shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              },
              "Metropolis Healthcare": {
                gradient: "from-[#0d9488] via-[#14b8a6] to-[#2dd4bf]",
                accent: "#ffffff",
                glow: "shadow-[0_0_30px_rgba(20,184,166,0.5)]"
              },
              "SRL Diagnostics": {
                gradient: "from-[#dc2626] via-[#ef4444] to-[#f87171]",
                accent: "#ffffff",
                glow: "shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              },
              "Apollo Diagnostics": {
                gradient: "from-[#0369a1] via-[#0284c7] to-[#38bdf8]",
                accent: "#fbbf24",
                glow: "shadow-[0_0_30px_rgba(2,132,199,0.5)]"
              },
            };
            
            // Fallback themes for unknown labs
            const fallbackThemes = [
              { gradient: "from-[#1e40af] via-[#3b82f6] to-[#60a5fa]", accent: "#fcd34d", glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]" },
              { gradient: "from-[#7e22ce] via-[#a855f7] to-[#c084fc]", accent: "#fcd34d", glow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]" },
              { gradient: "from-[#059669] via-[#10b981] to-[#34d399]", accent: "#ffffff", glow: "shadow-[0_0_30px_rgba(16,185,129,0.5)]" },
              { gradient: "from-[#ea580c] via-[#f97316] to-[#fb923c]", accent: "#ffffff", glow: "shadow-[0_0_30px_rgba(249,115,22,0.5)]" },
              { gradient: "from-[#be185d] via-[#ec4899] to-[#f472b6]", accent: "#ffffff", glow: "shadow-[0_0_30px_rgba(236,72,153,0.5)]" },
            ];
            
            const theme = brandThemes[center.name] || fallbackThemes[index % fallbackThemes.length];
            
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
                  className={`relative bg-gradient-to-br ${theme.gradient} rounded-3xl cursor-pointer overflow-hidden ${isActive ? theme.glow : 'shadow-xl'}`}
                >
                  {/* Shimmer Effect - Only on active card */}
                  {isActive && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div 
                        className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite]"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/5 rounded-full" />
                  
                  {/* Glowing orb effect for active card */}
                  {isActive && (
                    <motion.div 
                      className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40"
                      style={{ background: `radial-gradient(circle, rgba(255,255,255,0.4), transparent)` }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  
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
                      <motion.div 
                        className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full"
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-white font-semibold text-sm">View Lab</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </motion.div>
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
