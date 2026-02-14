import React from "react";
import { FileText, Heart, Activity, Stethoscope, Circle } from "lucide-react";

type Props = {
  category: string;
  className?: string;
};

// Use the same lucide icons/style as `DoctorConsultScreen` so report
// category pills visually match the "Book a Doctor" page.
const CategoryIcon: React.FC<Props> = ({ category, className = "w-4 h-4" }) => {
  switch (category) {
    case "Health Tests":
      return <FileText className={className} />;
    case "ECG Tests":
      return <Heart className={className} />;
    case "Physiotherapy":
      return <Activity className={className} />;
    case "Consultations":
      return <Stethoscope className={className} />;
    default:
      return <Circle className={className} />;
  }
};

export default CategoryIcon;
