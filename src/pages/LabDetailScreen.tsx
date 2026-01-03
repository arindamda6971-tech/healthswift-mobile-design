import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Star,
  MapPin,
  Clock,
  Search,
  ShoppingCart,
  Plus,
  Check,
  Filter,
  Beaker,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ScreenHeader from "@/components/layout/ScreenHeader";
import MobileLayout from "@/components/layout/MobileLayout";
import { toast } from "sonner";

// Lab data with test catalogs
const labsData: Record<string, {
  name: string;
  rating: number;
  reviews: number;
  location: string;
  timing: string;
  homeCollection: boolean;
  accredited: string[];
  tests: { id: string; name: string; price: number; originalPrice?: number; category: string; popular?: boolean }[];
}> = {
  "1": {
    name: "Dr. Lal PathLabs",
    rating: 4.8,
    reviews: 12500,
    location: "Pan India - 280+ Centers",
    timing: "6:00 AM - 10:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
    tests: [
      { id: "lpl1", name: "Complete Blood Count (CBC)", price: 340, originalPrice: 450, category: "Blood Tests", popular: true },
      { id: "lpl2", name: "Lipid Profile", price: 520, originalPrice: 650, category: "Heart Health", popular: true },
      { id: "lpl3", name: "Liver Function Test (LFT)", price: 680, originalPrice: 850, category: "Liver Health" },
      { id: "lpl4", name: "Kidney Function Test (KFT)", price: 620, originalPrice: 780, category: "Kidney Health" },
      { id: "lpl5", name: "Thyroid Profile (T3, T4, TSH)", price: 540, originalPrice: 700, category: "Thyroid", popular: true },
      { id: "lpl6", name: "HbA1c (Glycated Hemoglobin)", price: 450, originalPrice: 580, category: "Diabetes" },
      { id: "lpl7", name: "Vitamin D (25-OH)", price: 1200, originalPrice: 1500, category: "Vitamins", popular: true },
      { id: "lpl8", name: "Vitamin B12", price: 780, originalPrice: 950, category: "Vitamins" },
      { id: "lpl9", name: "Iron Studies", price: 850, originalPrice: 1050, category: "Blood Tests" },
      { id: "lpl10", name: "Urine Routine & Microscopy", price: 180, originalPrice: 250, category: "Urine Tests" },
      { id: "lpl11", name: "Blood Sugar Fasting", price: 80, originalPrice: 120, category: "Diabetes" },
      { id: "lpl12", name: "Blood Sugar PP", price: 80, originalPrice: 120, category: "Diabetes" },
      { id: "lpl13", name: "Creatinine, Serum", price: 220, originalPrice: 300, category: "Kidney Health" },
      { id: "lpl14", name: "Uric Acid, Serum", price: 200, originalPrice: 280, category: "Joint Health" },
      { id: "lpl15", name: "ESR (Erythrocyte Sedimentation Rate)", price: 120, originalPrice: 180, category: "Blood Tests" },
      { id: "lpl16", name: "Hemoglobin", price: 90, originalPrice: 140, category: "Blood Tests" },
      { id: "lpl17", name: "Aarogyam Basic", price: 999, originalPrice: 2100, category: "Health Packages", popular: true },
      { id: "lpl18", name: "Aarogyam 1.3", price: 1799, originalPrice: 4000, category: "Health Packages" },
      { id: "lpl19", name: "Aarogyam Full Body Checkup", price: 2999, originalPrice: 6500, category: "Health Packages", popular: true },
      { id: "lpl20", name: "Swasthfit Basic", price: 599, originalPrice: 1200, category: "Health Packages" },
    ],
  },
  "2": {
    name: "Metropolis Healthcare",
    rating: 4.7,
    reviews: 9800,
    location: "Pan India - 200+ Centers",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP", "ISO"],
    tests: [
      { id: "met1", name: "Complete Blood Count", price: 380, originalPrice: 500, category: "Blood Tests", popular: true },
      { id: "met2", name: "Lipid Profile", price: 580, originalPrice: 750, category: "Heart Health" },
      { id: "met3", name: "Liver Function Test", price: 720, originalPrice: 900, category: "Liver Health" },
      { id: "met4", name: "Kidney Function Test", price: 680, originalPrice: 850, category: "Kidney Health" },
      { id: "met5", name: "Thyroid Profile Total", price: 600, originalPrice: 800, category: "Thyroid", popular: true },
      { id: "met6", name: "HbA1c", price: 500, originalPrice: 650, category: "Diabetes" },
      { id: "met7", name: "Vitamin D Total", price: 1350, originalPrice: 1700, category: "Vitamins", popular: true },
      { id: "met8", name: "Vitamin B12", price: 850, originalPrice: 1100, category: "Vitamins" },
      { id: "met9", name: "Ferritin", price: 650, originalPrice: 850, category: "Blood Tests" },
      { id: "met10", name: "CRP (C-Reactive Protein)", price: 450, originalPrice: 600, category: "Inflammation" },
      { id: "met11", name: "Glucose Fasting", price: 100, originalPrice: 150, category: "Diabetes" },
      { id: "met12", name: "Glucose PP", price: 100, originalPrice: 150, category: "Diabetes" },
      { id: "met13", name: "Uric Acid", price: 240, originalPrice: 320, category: "Joint Health" },
      { id: "met14", name: "Calcium, Total", price: 280, originalPrice: 380, category: "Bone Health" },
      { id: "met15", name: "Full Body Checkup Basic", price: 1499, originalPrice: 3000, category: "Health Packages", popular: true },
      { id: "met16", name: "Full Body Checkup Advanced", price: 2999, originalPrice: 5500, category: "Health Packages" },
      { id: "met17", name: "Heart Health Package", price: 1999, originalPrice: 4000, category: "Health Packages" },
      { id: "met18", name: "Diabetes Care Package", price: 1299, originalPrice: 2800, category: "Health Packages" },
    ],
  },
  "3": {
    name: "SRL Diagnostics",
    rating: 4.6,
    reviews: 8500,
    location: "Pan India - 420+ Centers",
    timing: "6:30 AM - 9:30 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
    tests: [
      { id: "srl1", name: "Complete Hemogram", price: 350, originalPrice: 480, category: "Blood Tests", popular: true },
      { id: "srl2", name: "Lipid Profile Standard", price: 550, originalPrice: 720, category: "Heart Health" },
      { id: "srl3", name: "LFT (Liver Function)", price: 700, originalPrice: 900, category: "Liver Health" },
      { id: "srl4", name: "RFT (Renal Function)", price: 650, originalPrice: 820, category: "Kidney Health" },
      { id: "srl5", name: "Thyroid Function Test", price: 580, originalPrice: 750, category: "Thyroid", popular: true },
      { id: "srl6", name: "Glycated Hemoglobin", price: 480, originalPrice: 620, category: "Diabetes" },
      { id: "srl7", name: "25-OH Vitamin D", price: 1250, originalPrice: 1600, category: "Vitamins", popular: true },
      { id: "srl8", name: "Vitamin B12 Assay", price: 800, originalPrice: 1000, category: "Vitamins" },
      { id: "srl9", name: "Serum Iron", price: 350, originalPrice: 480, category: "Blood Tests" },
      { id: "srl10", name: "Homocysteine", price: 950, originalPrice: 1200, category: "Heart Health" },
      { id: "srl11", name: "Fasting Blood Sugar", price: 90, originalPrice: 140, category: "Diabetes" },
      { id: "srl12", name: "Creatinine", price: 200, originalPrice: 280, category: "Kidney Health" },
      { id: "srl13", name: "Uric Acid Blood", price: 220, originalPrice: 300, category: "Joint Health" },
      { id: "srl14", name: "ProHealth Basic", price: 1199, originalPrice: 2500, category: "Health Packages", popular: true },
      { id: "srl15", name: "ProHealth Essential", price: 2199, originalPrice: 4500, category: "Health Packages" },
      { id: "srl16", name: "ProHealth Comprehensive", price: 3499, originalPrice: 7000, category: "Health Packages" },
      { id: "srl17", name: "Senior Citizen Package", price: 2799, originalPrice: 5500, category: "Health Packages" },
    ],
  },
  "4": {
    name: "Thyrocare Technologies",
    rating: 4.5,
    reviews: 15000,
    location: "Pan India - 1200+ Centers",
    timing: "6:00 AM - 11:00 PM",
    homeCollection: true,
    accredited: ["NABL", "ISO"],
    tests: [
      { id: "thy1", name: "Aarogyam 1.1", price: 549, originalPrice: 1100, category: "Health Packages", popular: true },
      { id: "thy2", name: "Aarogyam 1.3", price: 799, originalPrice: 1600, category: "Health Packages", popular: true },
      { id: "thy3", name: "Aarogyam 1.8", price: 1199, originalPrice: 2400, category: "Health Packages" },
      { id: "thy4", name: "Aarogyam C", price: 1999, originalPrice: 4000, category: "Health Packages", popular: true },
      { id: "thy5", name: "Complete Blood Count", price: 280, originalPrice: 400, category: "Blood Tests" },
      { id: "thy6", name: "Thyroid Profile Total", price: 399, originalPrice: 600, category: "Thyroid", popular: true },
      { id: "thy7", name: "Lipid Profile", price: 399, originalPrice: 550, category: "Heart Health" },
      { id: "thy8", name: "Liver Function Test", price: 549, originalPrice: 750, category: "Liver Health" },
      { id: "thy9", name: "Kidney Function Test", price: 499, originalPrice: 700, category: "Kidney Health" },
      { id: "thy10", name: "Vitamin D 25-Hydroxy", price: 899, originalPrice: 1200, category: "Vitamins" },
      { id: "thy11", name: "Vitamin B12", price: 599, originalPrice: 850, category: "Vitamins" },
      { id: "thy12", name: "HbA1c", price: 349, originalPrice: 500, category: "Diabetes" },
      { id: "thy13", name: "Iron Deficiency Profile", price: 649, originalPrice: 900, category: "Blood Tests" },
      { id: "thy14", name: "Diabetes Screening", price: 299, originalPrice: 450, category: "Diabetes" },
      { id: "thy15", name: "Full Body Checkup", price: 999, originalPrice: 2000, category: "Health Packages" },
    ],
  },
  "5": {
    name: "Apollo Diagnostics",
    rating: 4.7,
    reviews: 7200,
    location: "Pan India - 150+ Centers",
    timing: "7:00 AM - 8:00 PM",
    homeCollection: true,
    accredited: ["NABL", "JCI"],
    tests: [
      { id: "apo1", name: "Complete Blood Picture", price: 400, originalPrice: 550, category: "Blood Tests", popular: true },
      { id: "apo2", name: "Lipid Profile", price: 600, originalPrice: 800, category: "Heart Health" },
      { id: "apo3", name: "Liver Function Tests", price: 750, originalPrice: 950, category: "Liver Health" },
      { id: "apo4", name: "Renal Function Tests", price: 700, originalPrice: 900, category: "Kidney Health" },
      { id: "apo5", name: "Thyroid Profile", price: 650, originalPrice: 850, category: "Thyroid", popular: true },
      { id: "apo6", name: "HbA1c Test", price: 550, originalPrice: 700, category: "Diabetes" },
      { id: "apo7", name: "Vitamin D3", price: 1400, originalPrice: 1800, category: "Vitamins", popular: true },
      { id: "apo8", name: "Vitamin B12", price: 900, originalPrice: 1150, category: "Vitamins" },
      { id: "apo9", name: "Ferritin Test", price: 700, originalPrice: 900, category: "Blood Tests" },
      { id: "apo10", name: "Apollo Basic Health Check", price: 1599, originalPrice: 3200, category: "Health Packages", popular: true },
      { id: "apo11", name: "Apollo Comprehensive Health Check", price: 3499, originalPrice: 7000, category: "Health Packages" },
      { id: "apo12", name: "Apollo Heart Care Package", price: 2299, originalPrice: 4500, category: "Health Packages" },
      { id: "apo13", name: "Apollo Women's Health Package", price: 2799, originalPrice: 5500, category: "Health Packages" },
      { id: "apo14", name: "Apollo Senior Citizen Package", price: 3199, originalPrice: 6500, category: "Health Packages" },
    ],
  },
  "6": {
    name: "Max Lab",
    rating: 4.6,
    reviews: 5600,
    location: "North India - 80+ Centers",
    timing: "6:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
    tests: [
      { id: "max1", name: "CBC with ESR", price: 380, originalPrice: 520, category: "Blood Tests", popular: true },
      { id: "max2", name: "Lipid Profile", price: 580, originalPrice: 750, category: "Heart Health" },
      { id: "max3", name: "LFT", price: 720, originalPrice: 920, category: "Liver Health" },
      { id: "max4", name: "KFT", price: 680, originalPrice: 880, category: "Kidney Health" },
      { id: "max5", name: "Thyroid Panel", price: 620, originalPrice: 820, category: "Thyroid", popular: true },
      { id: "max6", name: "HbA1c", price: 520, originalPrice: 680, category: "Diabetes" },
      { id: "max7", name: "Vitamin D", price: 1300, originalPrice: 1650, category: "Vitamins", popular: true },
      { id: "max8", name: "Max Basic Health Package", price: 1399, originalPrice: 2800, category: "Health Packages", popular: true },
      { id: "max9", name: "Max Premium Health Package", price: 2999, originalPrice: 6000, category: "Health Packages" },
      { id: "max10", name: "Max Executive Health Package", price: 4999, originalPrice: 10000, category: "Health Packages" },
    ],
  },
  "7": {
    name: "Tata 1mg Labs",
    rating: 4.5,
    reviews: 4800,
    location: "Metro Cities - 50+ Centers",
    timing: "7:00 AM - 8:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
    tests: [
      { id: "tata1", name: "Complete Blood Count", price: 299, originalPrice: 420, category: "Blood Tests", popular: true },
      { id: "tata2", name: "Lipid Profile", price: 449, originalPrice: 600, category: "Heart Health" },
      { id: "tata3", name: "Liver Function Test", price: 599, originalPrice: 800, category: "Liver Health" },
      { id: "tata4", name: "Kidney Function Test", price: 549, originalPrice: 750, category: "Kidney Health" },
      { id: "tata5", name: "Thyroid Profile", price: 499, originalPrice: 700, category: "Thyroid", popular: true },
      { id: "tata6", name: "HbA1c", price: 399, originalPrice: 550, category: "Diabetes" },
      { id: "tata7", name: "Vitamin D", price: 999, originalPrice: 1350, category: "Vitamins", popular: true },
      { id: "tata8", name: "Vitamin B12", price: 649, originalPrice: 900, category: "Vitamins" },
      { id: "tata9", name: "1mg Good Health Package", price: 899, originalPrice: 1800, category: "Health Packages", popular: true },
      { id: "tata10", name: "1mg Complete Care Package", price: 1799, originalPrice: 3600, category: "Health Packages" },
      { id: "tata11", name: "1mg Full Body Checkup", price: 2499, originalPrice: 5000, category: "Health Packages" },
    ],
  },
  "8": {
    name: "Redcliffe Labs",
    rating: 4.4,
    reviews: 6200,
    location: "Pan India - 100+ Centers",
    timing: "6:00 AM - 10:00 PM",
    homeCollection: true,
    accredited: ["NABL", "ISO"],
    tests: [
      { id: "red1", name: "Complete Blood Count", price: 249, originalPrice: 380, category: "Blood Tests", popular: true },
      { id: "red2", name: "Lipid Profile", price: 399, originalPrice: 550, category: "Heart Health" },
      { id: "red3", name: "Liver Function Test", price: 499, originalPrice: 700, category: "Liver Health" },
      { id: "red4", name: "Kidney Function Test", price: 449, originalPrice: 650, category: "Kidney Health" },
      { id: "red5", name: "Thyroid Profile", price: 399, originalPrice: 580, category: "Thyroid", popular: true },
      { id: "red6", name: "HbA1c", price: 349, originalPrice: 500, category: "Diabetes" },
      { id: "red7", name: "Vitamin D Total", price: 799, originalPrice: 1100, category: "Vitamins", popular: true },
      { id: "red8", name: "Vitamin B12", price: 549, originalPrice: 780, category: "Vitamins" },
      { id: "red9", name: "Redcliffe Basic Package", price: 699, originalPrice: 1400, category: "Health Packages", popular: true },
      { id: "red10", name: "Redcliffe Advance Package", price: 1499, originalPrice: 3000, category: "Health Packages" },
      { id: "red11", name: "Redcliffe Full Body", price: 2199, originalPrice: 4500, category: "Health Packages" },
    ],
  },
  "9": {
    name: "Neuberg Diagnostics",
    rating: 4.5,
    reviews: 4500,
    location: "South & West India - 90+ Centers",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
    tests: [
      { id: "neu1", name: "Complete Hemogram", price: 360, originalPrice: 500, category: "Blood Tests", popular: true },
      { id: "neu2", name: "Lipid Profile", price: 540, originalPrice: 720, category: "Heart Health" },
      { id: "neu3", name: "Liver Function Test", price: 680, originalPrice: 880, category: "Liver Health" },
      { id: "neu4", name: "Kidney Function Test", price: 620, originalPrice: 800, category: "Kidney Health" },
      { id: "neu5", name: "Thyroid Profile", price: 560, originalPrice: 750, category: "Thyroid", popular: true },
      { id: "neu6", name: "HbA1c", price: 460, originalPrice: 620, category: "Diabetes" },
      { id: "neu7", name: "Vitamin D", price: 1150, originalPrice: 1500, category: "Vitamins", popular: true },
      { id: "neu8", name: "Neuberg Wellness Package", price: 1299, originalPrice: 2600, category: "Health Packages", popular: true },
      { id: "neu9", name: "Neuberg Executive Package", price: 2799, originalPrice: 5600, category: "Health Packages" },
    ],
  },
  "10": {
    name: "Vijaya Diagnostic Centre",
    rating: 4.6,
    reviews: 3800,
    location: "South India - 100+ Centers",
    timing: "6:30 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
    tests: [
      { id: "vij1", name: "Complete Blood Picture", price: 350, originalPrice: 480, category: "Blood Tests", popular: true },
      { id: "vij2", name: "Lipid Profile", price: 520, originalPrice: 680, category: "Heart Health" },
      { id: "vij3", name: "Liver Function Test", price: 650, originalPrice: 850, category: "Liver Health" },
      { id: "vij4", name: "Kidney Function Test", price: 600, originalPrice: 780, category: "Kidney Health" },
      { id: "vij5", name: "Thyroid Profile", price: 540, originalPrice: 720, category: "Thyroid", popular: true },
      { id: "vij6", name: "HbA1c", price: 440, originalPrice: 600, category: "Diabetes" },
      { id: "vij7", name: "Vitamin D3", price: 1100, originalPrice: 1450, category: "Vitamins", popular: true },
      { id: "vij8", name: "Vijaya Basic Health Package", price: 1199, originalPrice: 2400, category: "Health Packages", popular: true },
      { id: "vij9", name: "Vijaya Comprehensive Package", price: 2599, originalPrice: 5200, category: "Health Packages" },
    ],
  },
  "11": {
    name: "Mahajan Imaging",
    rating: 4.7,
    reviews: 2900,
    location: "North India - 30+ Centers",
    timing: "8:00 AM - 8:00 PM",
    homeCollection: false,
    accredited: ["NABL", "AERB"],
    tests: [
      { id: "mah1", name: "MRI Brain", price: 5500, originalPrice: 7500, category: "Imaging", popular: true },
      { id: "mah2", name: "MRI Spine", price: 6000, originalPrice: 8000, category: "Imaging" },
      { id: "mah3", name: "CT Scan Chest", price: 3500, originalPrice: 4800, category: "Imaging", popular: true },
      { id: "mah4", name: "CT Scan Abdomen", price: 4000, originalPrice: 5500, category: "Imaging" },
      { id: "mah5", name: "X-Ray Chest", price: 350, originalPrice: 500, category: "Imaging" },
      { id: "mah6", name: "Ultrasound Abdomen", price: 1200, originalPrice: 1600, category: "Imaging", popular: true },
      { id: "mah7", name: "2D Echo", price: 2500, originalPrice: 3500, category: "Heart Health" },
      { id: "mah8", name: "PET CT Scan", price: 18000, originalPrice: 25000, category: "Imaging" },
      { id: "mah9", name: "Mammography", price: 1800, originalPrice: 2500, category: "Women's Health" },
      { id: "mah10", name: "DEXA Bone Density", price: 2200, originalPrice: 3000, category: "Bone Health" },
    ],
  },
  "12": {
    name: "Suburban Diagnostics",
    rating: 4.5,
    reviews: 3200,
    location: "West India - 70+ Centers",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL", "CAP"],
    tests: [
      { id: "sub1", name: "Complete Blood Count", price: 340, originalPrice: 470, category: "Blood Tests", popular: true },
      { id: "sub2", name: "Lipid Profile", price: 510, originalPrice: 680, category: "Heart Health" },
      { id: "sub3", name: "Liver Function Test", price: 660, originalPrice: 860, category: "Liver Health" },
      { id: "sub4", name: "Kidney Function Test", price: 610, originalPrice: 790, category: "Kidney Health" },
      { id: "sub5", name: "Thyroid Profile", price: 550, originalPrice: 730, category: "Thyroid", popular: true },
      { id: "sub6", name: "HbA1c", price: 450, originalPrice: 610, category: "Diabetes" },
      { id: "sub7", name: "Vitamin D", price: 1120, originalPrice: 1480, category: "Vitamins", popular: true },
      { id: "sub8", name: "Suburban Wellness Package", price: 1349, originalPrice: 2700, category: "Health Packages", popular: true },
    ],
  },
  "13": {
    name: "iGenetic Diagnostics",
    rating: 4.4,
    reviews: 2100,
    location: "Pan India - 40+ Centers",
    timing: "8:00 AM - 8:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
    tests: [
      { id: "igen1", name: "Complete Blood Count", price: 320, originalPrice: 450, category: "Blood Tests", popular: true },
      { id: "igen2", name: "Lipid Profile", price: 480, originalPrice: 650, category: "Heart Health" },
      { id: "igen3", name: "Liver Function Test", price: 620, originalPrice: 820, category: "Liver Health" },
      { id: "igen4", name: "Thyroid Profile", price: 520, originalPrice: 700, category: "Thyroid", popular: true },
      { id: "igen5", name: "Genetic Screening", price: 8500, originalPrice: 12000, category: "Genetic Tests", popular: true },
      { id: "igen6", name: "NIPT Test", price: 15000, originalPrice: 22000, category: "Genetic Tests" },
      { id: "igen7", name: "Carrier Screening", price: 12000, originalPrice: 18000, category: "Genetic Tests" },
      { id: "igen8", name: "iGenetic Basic Package", price: 999, originalPrice: 2000, category: "Health Packages", popular: true },
    ],
  },
  "14": {
    name: "HealthCare at Home",
    rating: 4.6,
    reviews: 1800,
    location: "Metro Cities",
    timing: "6:00 AM - 10:00 PM",
    homeCollection: true,
    accredited: ["NABL", "ISO"],
    tests: [
      { id: "hcah1", name: "Complete Blood Count", price: 299, originalPrice: 420, category: "Blood Tests", popular: true },
      { id: "hcah2", name: "Lipid Profile", price: 449, originalPrice: 620, category: "Heart Health" },
      { id: "hcah3", name: "Liver Function Test", price: 579, originalPrice: 780, category: "Liver Health" },
      { id: "hcah4", name: "Kidney Function Test", price: 529, originalPrice: 720, category: "Kidney Health" },
      { id: "hcah5", name: "Thyroid Profile", price: 479, originalPrice: 660, category: "Thyroid", popular: true },
      { id: "hcah6", name: "HbA1c", price: 379, originalPrice: 520, category: "Diabetes" },
      { id: "hcah7", name: "Vitamin D", price: 899, originalPrice: 1200, category: "Vitamins", popular: true },
      { id: "hcah8", name: "Home Care Basic Package", price: 799, originalPrice: 1600, category: "Health Packages", popular: true },
      { id: "hcah9", name: "Home Care Premium Package", price: 1699, originalPrice: 3400, category: "Health Packages" },
    ],
  },
  "15": {
    name: "Krsnaa Diagnostics",
    rating: 4.3,
    reviews: 2500,
    location: "Pan India - 60+ Centers",
    timing: "7:00 AM - 9:00 PM",
    homeCollection: true,
    accredited: ["NABL"],
    tests: [
      { id: "krs1", name: "Complete Blood Count", price: 280, originalPrice: 400, category: "Blood Tests", popular: true },
      { id: "krs2", name: "Lipid Profile", price: 420, originalPrice: 580, category: "Heart Health" },
      { id: "krs3", name: "Liver Function Test", price: 540, originalPrice: 720, category: "Liver Health" },
      { id: "krs4", name: "Kidney Function Test", price: 490, originalPrice: 660, category: "Kidney Health" },
      { id: "krs5", name: "Thyroid Profile", price: 460, originalPrice: 620, category: "Thyroid", popular: true },
      { id: "krs6", name: "HbA1c", price: 360, originalPrice: 500, category: "Diabetes" },
      { id: "krs7", name: "Vitamin D", price: 850, originalPrice: 1150, category: "Vitamins", popular: true },
      { id: "krs8", name: "Krsnaa Basic Package", price: 699, originalPrice: 1400, category: "Health Packages", popular: true },
      { id: "krs9", name: "Krsnaa Full Body Package", price: 1499, originalPrice: 3000, category: "Health Packages" },
    ],
  },
};

const categories = ["All", "Blood Tests", "Health Packages", "Thyroid", "Diabetes", "Heart Health", "Vitamins", "Liver Health", "Kidney Health"];

const LabDetailScreen = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedTests, setAddedTests] = useState<Set<string>>(new Set());

  const lab = labId ? labsData[labId] : null;

  if (!lab) {
    return (
      <MobileLayout showNav={false} showFloatingAdd={false}>
        <ScreenHeader title="Lab Not Found" />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Lab not found</p>
          <Button className="mt-4" onClick={() => navigate("/partner-labs")}>
            Back to Labs
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const filteredTests = lab.tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTest = (testId: string, testName: string) => {
    setAddedTests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
        toast.info(`${testName} removed from cart`);
      } else {
        newSet.add(testId);
        toast.success(`${testName} added to cart`);
      }
      return newSet;
    });
  };

  return (
    <MobileLayout showNav={false} showFloatingAdd={false}>
      <ScreenHeader title={lab.name} />

      <div className="px-4 py-4 space-y-4">
        {/* Lab Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card p-4"
        >
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-foreground">{lab.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm font-medium">{lab.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({lab.reviews.toLocaleString()} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{lab.location}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{lab.timing}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {lab.homeCollection && (
                  <Badge variant="secondary" className="text-[10px]">Home Collection</Badge>
                )}
                {lab.accredited.map((acc) => (
                  <Badge key={acc} variant="outline" className="text-[10px]">
                    {acc}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 text-xs"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Tests Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTests.length} tests available
          </p>
          {addedTests.size > 0 && (
            <Button
              size="sm"
              onClick={() => navigate("/cart")}
              className="gap-1"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart ({addedTests.size})
            </Button>
          )}
        </div>

        {/* Tests List */}
        <div className="space-y-3 pb-8">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="soft-card p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-sm">{test.name}</h3>
                    {test.popular && (
                      <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{test.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold text-foreground">₹{test.price}</span>
                    {test.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{test.originalPrice}
                      </span>
                    )}
                    {test.originalPrice && (
                      <Badge variant="secondary" className="text-[9px] bg-success/10 text-success">
                        {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={addedTests.has(test.id) ? "default" : "outline"}
                  className="flex-shrink-0 gap-1 h-8"
                  onClick={() => handleAddTest(test.id, test.name)}
                >
                  {addedTests.has(test.id) ? (
                    <>
                      <Check className="w-3 h-3" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}

          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <Beaker className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tests found matching your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {addedTests.size > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-[398px] mx-auto"
        >
          <Button
            className="w-full gap-2 shadow-lg"
            size="lg"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="w-5 h-5" />
            View Cart ({addedTests.size} tests)
          </Button>
        </motion.div>
      )}
    </MobileLayout>
  );
};

export default LabDetailScreen;
