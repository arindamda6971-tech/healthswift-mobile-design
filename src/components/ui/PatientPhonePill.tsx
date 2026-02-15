import React from 'react';
import { Phone } from 'lucide-react';

interface Props {
  phone?: string | null;
  onClick?: () => void;
  className?: string;
}

const PatientPhonePill: React.FC<Props> = ({ phone, onClick, className = '' }) => {
  if (!phone) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full ${className}`}
    >
      <Phone className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-foreground">{phone}</span>
    </button>
  );
};

export default PatientPhonePill;
