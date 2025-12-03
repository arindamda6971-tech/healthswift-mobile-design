import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Copy,
  Share2,
  Users,
  Coins,
  ChevronRight,
  Check,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { toast } from "@/hooks/use-toast";

const referralRewards = [
  { invited: 1, reward: 100 },
  { invited: 3, reward: 350 },
  { invited: 5, reward: 700 },
  { invited: 10, reward: 1500 },
];

const recentReferrals = [
  { name: "Priya S.", status: "completed", reward: 100, date: "Nov 25" },
  { name: "Rahul M.", status: "pending", reward: 100, date: "Nov 28" },
  { name: "Ananya K.", status: "completed", reward: 100, date: "Nov 20" },
];

const earnOptions = [
  { icon: Star, title: "Rate the app", description: "Rate us 5 stars on Play Store", reward: 50, completed: true },
  { icon: Users, title: "Complete profile", description: "Add all your health details", reward: 25, completed: true },
  { icon: Zap, title: "First booking", description: "Book your first test", reward: 100, completed: false },
];

const RewardsScreen = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const referralCode = "HEALTHJOHN500";
  const totalEarnings = 500;
  const referralCount = 3;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader title="Rewards & Referrals" />

      <div className="px-4 pb-8">
        {/* Earnings card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold text-foreground">₹{totalEarnings}</p>
              <p className="text-xs text-muted-foreground mt-1">{referralCount} friends joined</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center">
              <Coins className="w-8 h-8 text-warning" />
            </div>
          </div>
          <Button variant="soft" className="w-full mt-4" onClick={() => navigate("/home")}>
            Redeem on next booking
          </Button>
        </motion.div>

        {/* Referral code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="soft-card mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Your Referral Code</p>
              <p className="text-xs text-muted-foreground">Share & earn ₹100 per friend</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 py-3 px-4 bg-muted rounded-xl font-mono font-bold text-foreground text-center tracking-wider">
              {referralCode}
            </div>
            <Button variant="soft" size="icon" onClick={copyCode}>
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
            <Button variant="soft" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Referral milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Milestone Rewards</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {referralRewards.map((milestone, index) => {
              const achieved = referralCount >= milestone.invited;
              return (
                <div
                  key={index}
                  className={`flex-shrink-0 w-24 py-4 px-3 rounded-2xl text-center ${
                    achieved ? "bg-success/10" : "bg-muted"
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    achieved ? "bg-success" : "bg-muted-foreground/20"
                  }`}>
                    {achieved ? (
                      <Check className="w-5 h-5 text-success-foreground" />
                    ) : (
                      <Users className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground mt-2">₹{milestone.reward}</p>
                  <p className="text-xs text-muted-foreground">{milestone.invited} friends</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Ways to earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">More Ways to Earn</h3>
          <div className="space-y-2">
            {earnOptions.map((option, index) => (
              <div
                key={index}
                className={`soft-card flex items-center gap-4 ${
                  option.completed ? "opacity-60" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  option.completed ? "bg-success/10" : "bg-primary/10"
                }`}>
                  <option.icon className={`w-5 h-5 ${
                    option.completed ? "text-success" : "text-primary"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{option.title}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                {option.completed ? (
                  <Badge variant="softSuccess">Earned</Badge>
                ) : (
                  <Badge variant="soft">+₹{option.reward}</Badge>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">Recent Referrals</h3>
          <div className="space-y-2">
            {recentReferrals.map((referral, index) => (
              <div
                key={index}
                className="soft-card flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">{referral.name[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{referral.name}</p>
                  <p className="text-xs text-muted-foreground">{referral.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+₹{referral.reward}</p>
                  <Badge variant={referral.status === "completed" ? "softSuccess" : "softWarning"}>
                    {referral.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default RewardsScreen;
