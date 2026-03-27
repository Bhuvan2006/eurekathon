import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Heart, FileText, QrCode, MessageCircle, Activity, Pill,
  Calendar, Plus, TrendingUp, Shield, HelpCircle, ArrowRight, CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DoctorDashboard from "./DoctorDashboard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface HealthSnapshot {
  created_at: string;
  score: number;
}

interface MedicalRecord {
  id: string;
  title: string;
  category: string;
  record_date: string;
}

const Dashboard = () => {
  const { profile, hasRole, user, activeRole } = useAuth();
  const navigate = useNavigate();
  const [recordCount, setRecordCount] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [scoreHistory, setScoreHistory] = useState<HealthSnapshot[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const isDoctor = activeRole === "doctor";

  useEffect(() => {
    if (!user || isDoctor) return;

    // 1. Fetch total record count
    supabase
      .from("medical_records")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .then(({ count }) => setRecordCount(count ?? 0));

    // 2. Fetch recent records
    supabase
      .from("medical_records")
      .select("id, title, category, record_date")
      .eq("patient_id", user.id)
      .order("record_date", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentRecords((data as MedicalRecord[]) || []));

    // 3. Fetch health score history for trend chart
    supabase
      .from("health_scores")
      .select("created_at, score")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: true })
      .limit(10)
      .then(({ data }) => setScoreHistory((data as HealthSnapshot[]) || []));

    // 4. Calculate current score live
    supabase
      .from("medical_records")
      .select("category")
      .eq("patient_id", user.id)
      .then(({ data: records }) => {
        const counts: Record<string, number> = {};
        records?.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
        const total = Object.values(counts).reduce((s, v) => s + v, 0);
        if (total === 0) { setLatestScore(0); return; }

        const WEIGHTS: Record<string, number> = {
          consultation: 4, vaccination: 5, lab_result: 3, treatment_plan: 3,
          chronic_condition: -6, surgery: -5, allergy: -3, medication: -2, diagnosis: -2,
        };
        const CAPS: Record<string, number> = {
          consultation: 5, vaccination: 4, lab_result: 5, treatment_plan: 5,
          chronic_condition: 5, surgery: 5, allergy: 5, medication: 10, diagnosis: 10,
        };
        let s = 60;
        for (const [cat, w] of Object.entries(WEIGHTS)) {
          s += Math.min(counts[cat] || 0, CAPS[cat]) * w;
        }
        setLatestScore(Math.max(0, Math.min(100, Math.round(s))));
      });
  }, [user, isDoctor]);

  if (isDoctor) return <DoctorDashboard />;

  const getScoreColorClass = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score >= 80) return "text-health-excellent";
    if (score >= 60) return "text-health-good";
    if (score >= 40) return "text-health-fair";
    if (score >= 20) return "text-health-poor";
    return "text-health-critical";
  };

  const dashboardCharts = scoreHistory.length > 0 ? scoreHistory.map(d => ({
    date: new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: d.score
  })) : [
    { date: 'Initial', score: 0 },
    { date: 'Current', score: latestScore || 0 }
  ];

  const quickActions = [
    { label: "Add Record", icon: Plus, to: "/records?add=true", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Upload reports" },
    { label: "My Appointments", icon: CalendarDays, to: "/appointments", color: "text-orange-500", bg: "bg-orange-500/10", desc: "Schedule visits" },
    { label: "My QR Code", icon: QrCode, to: "/qr-code", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Emergency ID" },
    { label: "Predictions", icon: TrendingUp, to: "/my-predictions", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "AI Health Risk" },
    { label: "AI Assistant", icon: MessageCircle, to: "/chatbot", color: "text-cyan-500", bg: "bg-cyan-500/10", desc: "Consult AI" },
  ];

  const getInsights = () => {
    if (recordCount === 0) return ["Start by adding your first medical record.", "Complete your health profile for better insights.", "Explore the AI chatbot for any queries."];
    if ((latestScore || 0) < 40) return ["Critical: Consult a doctor regarding your chronic conditions.", "Ensure you are following your medications strictly.", "Consider a session with our AI health assistant."];
    if ((latestScore || 0) < 70) return ["Monitor your lab results regularly.", "Schedule a follow-up consultation soon.", "Check for missing vaccinations in your records."];
    return ["You're doing great! Keep maintaining your records.", "Regular vaccinations are up to date.", "Share your QR code with your family for emergencies."];
  };

  return (
    <div className="relative space-y-8 pb-10">
      {/* Decorative Background Elements */}
      <div className="absolute left-1/4 top-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-1/4 top-32 -z-10 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {profile?.full_name?.split(" ")[0] || "User"}
            </span>
          </h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Your medical records are secured and private.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-card border border-border rounded-full px-4 py-1.5 shadow-sm">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">Live Activity</span>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border glass overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Health Progress
                  </CardTitle>
                  <CardDescription>Visualizing your health score over time</CardDescription>
                </div>
                <div className={`font-display text-3xl font-bold ${getScoreColorClass(latestScore || 0)}`}>
                  {latestScore ?? "0"}
                </div>
              </CardHeader>
              <CardContent className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardCharts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border glass hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Health Score</p>
                  <p className={`text-xl font-bold ${getScoreColorClass(latestScore || 0)}`}>{latestScore ?? 0}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border glass hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reports</p>
                  <p className="text-xl font-bold text-foreground">{recordCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border glass hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Blood Type</p>
                  <p className="text-xl font-bold text-foreground">{profile?.blood_type || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Records list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Medical Activity</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/records")} className="text-primary hover:text-primary/80">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentRecords.length > 0 ? (
                  recentRecords.map((rec, i) => (
                    <div key={rec.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border group hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{rec.title}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">{rec.category.replace('_', ' ')}</p>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {new Date(rec.record_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No recent medical activity found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (1/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-primary/20 bg-primary/[0.02] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary font-display flex items-center gap-2">
                  Health AI Insights
                </CardTitle>
                <CardDescription>Personalized suggestions based on your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {getInsights().map((insight, i) => (
                    <li key={i} className="text-sm flex gap-3 text-muted-foreground leading-relaxed">
                      <span className="text-primary mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate("/chatbot")} className="w-full mt-2 font-semibold">
                  Consult AI Assistant
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-rose-500/20 bg-rose-500/[0.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-rose-500 text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-rose-500/10">
                  <span className="text-sm text-muted-foreground">Emergency Contact</span>
                  <span className="text-sm font-semibold">{profile?.emergency_contact_name || "Not set"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-rose-500/10">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-semibold">{profile?.emergency_contact_phone || "Not set"}</span>
                </div>
                <Button variant="outline" onClick={() => navigate("/qr-code")} className="w-full border-rose-500/20 text-rose-500 hover:bg-rose-500/10">
                  <QrCode className="mr-2 h-4 w-4" /> View Medical ID
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card */}
          <Card className="border-border glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Need help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                MediLocker uses decentralized storage to ensure your records are encrypted and only accessible by you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions (Bottom) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="mb-4 font-display text-xl font-bold tracking-wider text-foreground">
          Quick Navigation
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, icon: Icon, to, color, bg, desc }) => (
            <Button
              key={label}
              variant="outline"
              onClick={() => navigate(to)}
              className="h-auto flex-col items-start gap-4 border-border bg-card p-6 hover:bg-primary/[0.02] hover:border-primary/30 group transition-all"
            >
              <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div className="text-left w-full">
                <span className="text-sm font-bold block">{label}</span>
                <span className="text-xs text-muted-foreground font-normal">{desc}</span>
              </div>
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
