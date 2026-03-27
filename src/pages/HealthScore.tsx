import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Heart, Activity, Pill, AlertTriangle, Calendar,
  TrendingUp, FlaskConical, Stethoscope, Scissors, FileText,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface FactorRow {
  label: string;
  key: string;
  count: number;
  max: number;
  icon: typeof Heart;
  colorClass: string;
  effect: "positive" | "negative" | "neutral";
  description: string;
}

// ── Scoring weights per category ──────────────────────────────
// positive weights add to score, negative weights subtract
const CATEGORY_WEIGHTS: Record<string, { weight: number; effect: "positive" | "negative" | "neutral"; cap: number }> = {
  consultation:       { weight: 4,  effect: "positive", cap: 5  }, // up to +20
  vaccination:        { weight: 5,  effect: "positive", cap: 4  }, // up to +20
  lab_result:         { weight: 3,  effect: "positive", cap: 5  }, // up to +15
  treatment_plan:     { weight: 3,  effect: "positive", cap: 5  }, // up to +15
  chronic_condition:  { weight: -6, effect: "negative", cap: 5  }, // up to -30
  medication:         { weight: -2, effect: "negative", cap: 10 }, // up to -20
  allergy:            { weight: -3, effect: "negative", cap: 5  }, // up to -15
  surgery:            { weight: -5, effect: "negative", cap: 5  }, // up to -25
  diagnosis:          { weight: -2, effect: "negative", cap: 10 }, // up to -20
};

const BASE_SCORE = 60; // starting point when records exist

function calculateScore(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((s, c) => s + c, 0);
  if (total === 0) return 0;

  let score = BASE_SCORE;
  for (const [cat, cfg] of Object.entries(CATEGORY_WEIGHTS)) {
    const count = Math.min(counts[cat] || 0, cfg.cap);
    score += count * cfg.weight;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Score colour / label ──────────────────────────────────────
const getScoreColor = (s: number) => {
  if (s === 0)  return "hsl(215, 16%, 47%)";   // grey — no records
  if (s >= 80)  return "hsl(142, 60%, 45%)";   // green
  if (s >= 60)  return "hsl(185, 65%, 42%)";   // teal
  if (s >= 40)  return "hsl(45, 90%, 48%)";    // amber
  if (s >= 20)  return "hsl(25, 93%, 50%)";    // orange
  return         "hsl(0, 68%, 52%)";            // red
};

const getScoreLabel = (s: number) => {
  if (s === 0)  return "No Records";
  if (s >= 80)  return "Excellent";
  if (s >= 60)  return "Good";
  if (s >= 40)  return "Fair";
  if (s >= 20)  return "Poor";
  return         "Critical";
};

// ── Component ─────────────────────────────────────────────────
const HealthScore = () => {
  const { user, profile } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: records } = await supabase
        .from("medical_records")
        .select("category")
        .eq("patient_id", user.id);

      const c: Record<string, number> = {};
      records?.forEach((r) => {
        c[r.category] = (c[r.category] || 0) + 1;
      });

      const total = Object.values(c).reduce((s, v) => s + v, 0);
      setCounts(c);
      setTotalRecords(total);

      const s = calculateScore(c);
      setScore(s);

      // Persist to health_scores table (best-effort)
      await supabase.from("health_scores").insert({
        patient_id: user.id,
        score: s,
        factors: { ...c, total_records: total },
      });
    };

    fetchData();
  }, [user, profile]);

  // ── Build factor rows ────────────────────────────────────────
  const factors: FactorRow[] = [
    { label: "Consultations",      key: "consultation",      count: counts["consultation"]      || 0, max: 5,  icon: Calendar,    colorClass: "text-emerald-500",  effect: "positive", description: "Regular checkups improve score" },
    { label: "Vaccinations",       key: "vaccination",       count: counts["vaccination"]       || 0, max: 4,  icon: TrendingUp,  colorClass: "text-teal-500",     effect: "positive", description: "Up-to-date vaccines improve score" },
    { label: "Lab Results",        key: "lab_result",        count: counts["lab_result"]        || 0, max: 5,  icon: FlaskConical,colorClass: "text-blue-500",     effect: "positive", description: "Monitoring test results improves score" },
    { label: "Treatment Plans",    key: "treatment_plan",    count: counts["treatment_plan"]    || 0, max: 5,  icon: Stethoscope, colorClass: "text-cyan-500",     effect: "positive", description: "Active treatment plans improve score" },
    { label: "Chronic Conditions", key: "chronic_condition", count: counts["chronic_condition"] || 0, max: 5,  icon: Activity,    colorClass: "text-red-500",      effect: "negative", description: "Each condition reduces score" },
    { label: "Medications",        key: "medication",        count: counts["medication"]        || 0, max: 10, icon: Pill,        colorClass: "text-amber-500",    effect: "negative", description: "High medication count reduces score" },
    { label: "Allergies",          key: "allergy",           count: counts["allergy"]           || 0, max: 5,  icon: AlertTriangle,colorClass: "text-orange-500",  effect: "negative", description: "Recorded allergies reduce score" },
    { label: "Surgeries",          key: "surgery",           count: counts["surgery"]           || 0, max: 5,  icon: Scissors,    colorClass: "text-rose-500",     effect: "negative", description: "Surgeries indicate health burden" },
    { label: "Diagnoses",          key: "diagnosis",         count: counts["diagnosis"]         || 0, max: 10, icon: FileText,    colorClass: "text-pink-500",     effect: "negative", description: "Active diagnoses reduce score" },
  ];

  const circumference = 2 * Math.PI * 90;
  const dashOffset = score !== null
    ? ((100 - score) / 100) * circumference
    : circumference;

  const scoreColor = score !== null ? getScoreColor(score) : "transparent";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health Score</h1>
        <p className="text-sm text-muted-foreground">
          Calculated from your {totalRecords} medical record{totalRecords !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Gauge ── */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border">
            <CardContent className="flex flex-col items-center p-8">
              <div className="relative">
                <svg width="220" height="220" className="-rotate-90">
                  {/* Track */}
                  <circle
                    cx="110" cy="110" r="90"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="14"
                  />
                  {/* Progress */}
                  <motion.circle
                    cx="110" cy="110" r="90"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold" style={{ color: scoreColor }}>
                    {score ?? "—"}
                  </span>
                  <span className="mt-1 text-sm text-muted-foreground">
                    {score !== null ? getScoreLabel(score) : "Calculating…"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {totalRecords} record{totalRecords !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Score interpretation bar */}
              <div className="mt-6 w-full space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-teal-400 to-emerald-500">
                  <div
                    className="h-full w-2 rounded-full bg-white shadow border border-muted transition-all duration-1000"
                    style={{ marginLeft: `calc(${score ?? 0}% - 4px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Critical</span><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
                </div>
              </div>

              {totalRecords === 0 && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Add medical records to calculate your health score.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Factor breakdown ── */}
        <div className="space-y-2.5">
          {factors.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
            >
              <Card className="border-border">
                <CardContent className="flex items-center gap-3 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <f.icon className={`h-4 w-4 ${f.colorClass}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{f.label}</span>
                      <span className={`text-sm font-bold ${f.colorClass}`}>{f.count}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: f.effect === "positive" ? "hsl(142,60%,45%)" : "hsl(0,68%,52%)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((f.count / f.max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                      />
                    </div>
                  </div>
                  {/* +/- badge */}
                  <span className={`shrink-0 text-xs font-semibold ${f.effect === "positive" ? "text-emerald-500" : "text-red-500"}`}>
                    {f.effect === "positive" ? "▲" : "▼"}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── How it's calculated ── */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-primary">How Your Score Is Calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Starting from a base of <strong className="text-foreground">60</strong> when records exist
            (or <strong className="text-foreground">0</strong> with no records), each category adjusts the score:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Positive (increases score)</p>
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                <li>• Consultation: <strong className="text-foreground">+4 each</strong> (up to 5)</li>
                <li>• Vaccination: <strong className="text-foreground">+5 each</strong> (up to 4)</li>
                <li>• Lab Result: <strong className="text-foreground">+3 each</strong> (up to 5)</li>
                <li>• Treatment Plan: <strong className="text-foreground">+3 each</strong> (up to 5)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Negative (decreases score)</p>
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                <li>• Chronic Condition: <strong className="text-foreground">−6 each</strong></li>
                <li>• Surgery: <strong className="text-foreground">−5 each</strong></li>
                <li>• Allergy: <strong className="text-foreground">−3 each</strong></li>
                <li>• Medication / Diagnosis: <strong className="text-foreground">−2 each</strong></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Score is clamped between 0 and 100.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthScore;
