import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ScreenHeader from "@/components/layout/ScreenHeader";
import MobileLayout from "@/components/layout/MobileLayout";

// Partner labs data - Labs across India
const partnerLabs = [
  {
    id: "1",
    name: "Dr. Lal PathLabs",
    rating: 4.8,
    reviews: 12500,
    tests: 500,
    location: "Pan India - 280+ Centers",
    city: "Delhi NCR",
    timing: "6:00 AM - 10:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
    image: null,
  },
  {
    id: "2",
    name: "Metropolis Healthcare",
    rating: 4.7,
    reviews: 9800,
    tests: 450,
    location: "Pan India - 200+ Centers",
    city: "Mumbai",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP", "ISO"],
  },
  {
    id: "3",
    name: "SRL Diagnostics",
    rating: 4.6,
    reviews: 8500,
    tests: 400,
    location: "Pan India - 420+ Centers",
    city: "Mumbai",
    timing: "6:30 AM - 9:30 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
  },
  {
    id: "4",
    name: "Thyrocare Technologies",
    rating: 4.5,
    reviews: 15000,
    tests: 350,
    location: "Pan India - 1200+ Centers",
    city: "Navi Mumbai",
    timing: "6:00 AM - 11:00 PM",
    homeCollection: true,
    accredited: ["NABL", "ISO"],
  },
  {
    id: "5",
    name: "Apollo Diagnostics",
    rating: 4.7,
    reviews: 7200,
    tests: 380,
    location: "Pan India - 150+ Centers",
    city: "Chennai",
    timing: "7:00 AM - 8:00 PM",
    homeCollection: true,
    accredited: ["NABL", "JCI"],
  },
  {
    id: "6",
    name: "Max Lab",
    rating: 4.6,
    reviews: 5600,
    tests: 320,
    location: "North India - 80+ Centers",
    city: "Delhi",
    timing: "6:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
  },
  {
    id: "7",
    name: "Tata 1mg Labs",
    rating: 4.5,
    reviews: 4800,
    tests: 280,
    location: "Metro Cities - 50+ Centers",
    city: "Gurugram",
    timing: "7:00 AM - 8:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
  },
  {
    id: "8",
    name: "Redcliffe Labs",
    rating: 4.4,
    reviews: 6200,
    tests: 250,
    location: "Pan India - 100+ Centers",
    city: "Noida",
    timing: "6:00 AM - 10:00 PM",
    homeCollection: true,
    accredited: ["NABL", "ISO"],
  },
  {
    id: "9",
    name: "Neuberg Diagnostics",
    rating: 4.5,
    reviews: 4500,
    tests: 360,
    location: "South & West India - 90+ Centers",
    city: "Bangalore",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
  },
  {
    id: "10",
    name: "Vijaya Diagnostic Centre",
    rating: 4.6,
    reviews: 3800,
    tests: 300,
    location: "South India - 100+ Centers",
    city: "Hyderabad",
    timing: "6:30 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
  },
  {
    id: "11",
    name: "Mahajan Imaging",
    rating: 4.7,
    reviews: 2900,
    tests: 180,
    location: "North India - 30+ Centers",
    city: "Delhi",
    timing: "8:00 AM - 8:00 PM",
    homeCollection: false,
    accredited: ["NABL", "AERB"],
  },
  {
    id: "12",
    name: "Suburban Diagnostics",
    rating: 4.5,
    reviews: 3200,
    tests: 290,
    location: "West India - 70+ Centers",
    city: "Mumbai",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
  },
  {
    id: "13",
    name: "iGenetic Diagnostics",
    rating: 4.4,
    reviews: 2100,
    tests: 220,
    location: "Pan India - 40+ Centers",
    city: "Hyderabad",
    timing: "8:00 AM - 8:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
  },
  {
    id: "14",
    name: "HealthCare at Home",
    rating: 4.6,
    reviews: 1800,
    tests: 200,
    location: "Metro Cities",
    city: "Delhi NCR",
    timing: "6:00 AM - 10:00 PM",
    homeCollection: true,
    accredited: ["NABL", "ISO"],
  },
  {
    id: "15",
    name: "Krsnaa Diagnostics",
    rating: 4.3,
    reviews: 2500,
    tests: 240,
    location: "Pan India - 60+ Centers",
    city: "Pune",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
  },
];

const cities = ["All Cities", "Delhi NCR", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"];

const PartnerLabsScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  const filteredLabs = partnerLabs.filter((lab) => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "All Cities" || lab.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Partner Labs" />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search labs by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>


        {/* Stats */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-primary">{partnerLabs.length}+</p>
            <p className="text-xs text-muted-foreground">Partner Labs</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-primary">3000+</p>
            <p className="text-xs text-muted-foreground">Centers</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-primary">500+</p>
            <p className="text-xs text-muted-foreground">Cities</p>
          </div>
        </div>

        {/* Labs List */}
        <div className="space-y-3 pb-8">
          {filteredLabs.map((lab, index) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="soft-card p-4 cursor-pointer"
              onClick={() => navigate(`/lab/${lab.id}`)}
            >
              <div className="flex gap-3">
                {/* Lab Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>

                {/* Lab Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate">{lab.name}</h3>
                    {lab.homeCollection && (
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        Home Collection
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">{lab.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({lab.reviews.toLocaleString()} reviews)
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-primary font-medium">{lab.tests}+ tests</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{lab.location}</span>
                  </div>

                  {/* Timing & Accreditations */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{lab.timing}</span>
                    </div>
                  </div>

                  {/* Accreditations */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {lab.accredited.map((acc) => (
                      <Badge key={acc} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 self-center" />
              </div>
            </motion.div>
          ))}

          {filteredLabs.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No labs found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default PartnerLabsScreen;
