-- Create diagnostic_centers table to store lab/center information
CREATE TABLE public.diagnostic_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  rating NUMERIC DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  opening_time TEXT DEFAULT '07:00',
  closing_time TEXT DEFAULT '21:00',
  services JSONB DEFAULT '[]'::jsonb,
  ecg_available BOOLEAN DEFAULT false,
  ecg_price NUMERIC,
  home_collection_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diagnostic_centers ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to view active diagnostic centers
CREATE POLICY "Anyone can view active diagnostic centers" 
ON public.diagnostic_centers 
FOR SELECT 
USING (is_active = true);

-- Insert sample ECG-capable diagnostic centers
INSERT INTO public.diagnostic_centers (name, address, city, state, pincode, latitude, longitude, phone, logo_url, rating, reviews_count, is_verified, ecg_available, ecg_price, services) VALUES
('Dr. Lal PathLabs', '123, MG Road, Near City Mall', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, '+91 22 1234 5678', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Dr_Lal_PathLabs_logo.svg/200px-Dr_Lal_PathLabs_logo.svg.png', 4.8, 1250, true, true, 449, '["ECG", "Blood Tests", "Urine Tests", "X-Ray"]'),
('Thyrocare', '456, Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', 19.0596, 72.8295, '+91 22 2345 6789', 'https://www.thyrocare.com/NewAssets2/images/thyrocare-logo.png', 4.6, 890, true, true, 399, '["ECG", "Thyroid Tests", "Blood Tests", "Health Packages"]'),
('Metropolis Healthcare', '789, Andheri East, Near Metro Station', 'Mumbai', 'Maharashtra', '400069', 19.1136, 72.8697, '+91 22 3456 7890', 'https://www.metropolisindia.com/assets/images/metropolis-logo-new.svg', 4.7, 1100, true, true, 499, '["ECG", "Full Body Checkup", "Blood Tests", "CT Scan"]'),
('SRL Diagnostics', '321, Powai, Hiranandani Gardens', 'Mumbai', 'Maharashtra', '400076', 19.1176, 72.9060, '+91 22 4567 8901', 'https://www.srlworld.com/assets/images/srl-logo.svg', 4.5, 750, true, true, 399, '["ECG", "MRI", "Blood Tests", "Pathology"]'),
('Apollo Diagnostics', '654, Juhu, Near Airport', 'Mumbai', 'Maharashtra', '400049', 19.1075, 72.8263, '+91 22 5678 9012', 'https://www.apollodiagnostics.in/assets/images/apollo-logo.png', 4.9, 1500, true, true, 549, '["ECG", "Heart Checkup", "Blood Tests", "Radiology"]'),
('Vijaya Diagnostic Centre', '987, Thane West, Near Station', 'Mumbai', 'Maharashtra', '400601', 19.2183, 72.9781, '+91 22 6789 0123', NULL, 4.4, 620, true, true, 349, '["ECG", "Blood Tests", "Ultrasound"]'),
('Suburban Diagnostics', '111, Malad West, Infinity Mall Road', 'Mumbai', 'Maharashtra', '400064', 19.1860, 72.8484, '+91 22 7890 1234', NULL, 4.3, 450, true, true, 379, '["ECG", "Blood Tests", "Health Packages"]'),
('iGenetic Diagnostics', '222, Goregaon East, Oberoi Mall', 'Mumbai', 'Maharashtra', '400063', 19.1663, 72.8526, '+91 22 8901 2345', NULL, 4.6, 580, true, true, 429, '["ECG", "Genetic Testing", "Blood Tests"]');

-- Create index for faster ECG lab queries
CREATE INDEX idx_diagnostic_centers_ecg ON public.diagnostic_centers(ecg_available) WHERE ecg_available = true;
CREATE INDEX idx_diagnostic_centers_city ON public.diagnostic_centers(city);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_diagnostic_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_diagnostic_centers_updated_at
BEFORE UPDATE ON public.diagnostic_centers
FOR EACH ROW
EXECUTE FUNCTION public.update_diagnostic_centers_updated_at();