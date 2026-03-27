import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Search, FileText, UserCheck, Plus, Clock, Brain,
  CalendarDays, Shield, Activity, Users, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const DoctorDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [recordsAdded, setRecordsAdded] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [recentRecords, setRecentRecords] = useState<{ id: string; title: string; category: string; record_date: string }[]>([]);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch total records added by this doctor
    supabase
      .from("medical_records")
      .select("id", { count: "exact", head: true })
      .eq("added_by", user.id)
      .then(({ count }) => setRecordsAdded(count ?? 0));

    // 2. Fetch today's appointments
    const today = format(new Date(), "yyyy-MM-dd");
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .eq("appointment_date", today)
      .neq("status", "cancelled")
      .then(({ count }) => setTodayAppointments(count ?? 0));

    // 3. Fetch recently added records
    supabase
      .from("medical_records")
      .select("id, title, category, record_date")
      .eq("added_by", user.id)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setRecentRecords(data ?? []));
  }, [user]);

  const categoryLabel = (c: string) =>
    c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const quickActions = [
    { label: "Bookings", icon: CalendarDays, to: "/appointments", color: "text-blue-500", bg: "bg-blue-500/10", desc: "View clinical calendar" },
    { label: "Search Patient", icon: Search, to: "/patients", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Access patient history" },
    { label: "Add Record", icon: Plus, to: "/patients", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Upload new reports" },
    { label: "AI Predictions", icon: Brain, to: "/predictions", color: "text-cyan-500", bg: "bg-cyan-500/10", desc: "Patient risk analysis" },
  ];

  return (
    <div className="relative space-y-8 pb-10">
      {/* Decorative Background Elements */}
      <div className="absolute left-1/4 top-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-1/4 top-32 -z-10 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome, Dr.{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {profile?.full_name?.split(" ").pop() || "Doctor"}
            </span>
          </h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Secure clinical dashboard for record management.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-card border border-border rounded-full px-4 py-1.5 shadow-sm">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">System Status: Active</span>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border glass hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Records</p>
                <p className="text-2xl font-bold text-foreground">{recordsAdded}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border glass hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <CalendarDays className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today's Appointments</p>
                <p className="text-2xl font-bold text-foreground">{todayAppointments}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border glass hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Role</p>
                <p className="text-lg font-bold text-foreground capitalize">{profile?.user_roles?.[0]?.role || "Doctor"}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border glass hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                <Brain className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Assistant</p>
                <p className="text-lg font-bold text-emerald-500">Ready</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-6">
        {/* Quick Navigation - Bottom left (4/6) */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="font-display text-xl font-bold tracking-wider text-foreground">
            Quick Navigation
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {/* Recent Activity - Right (2/6) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border glass h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Reports</CardTitle>
                <CardDescription>Last records uploaded by you</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRecords.length > 0 ? (
                recentRecords.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border group hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{categoryLabel(r.category)}</p>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {r.record_date}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                  <p className="text-xs text-muted-foreground">No recent activity.</p>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="w-full text-primary hover:text-primary/80 mt-2">
                Manage All Patients <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
