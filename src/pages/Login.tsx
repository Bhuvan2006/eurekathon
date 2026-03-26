import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Wallet, Loader2, Stethoscope, User, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

// ── Edge function helper ───────────────────────────────────────────────────
// Calls metamask-auth edge function via raw fetch so it works regardless of
// whether the Supabase publishable key passes JWT verification or not.
// The edge function is deployed with --no-verify-jwt (public auth endpoint).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function callMetaMaskAuth(body: Record<string, unknown>): Promise<{
  data: Record<string, unknown> | null;
  error: string | null;
}> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/metamask-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Send the key as both apikey and Authorization so it works
        // regardless of the Supabase gateway version / key format.
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: json, error: json?.error ?? `HTTP ${res.status}` };
    }
    return { data: json, error: null };
  } catch (e) {
    console.error("callMetaMaskAuth error:", e);
    return { data: null, error: e instanceof Error ? e.message : "Network error" };
  }
}
// ──────────────────────────────────────────────────────────────────────────

const Login = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeRole, setActiveRoleTab] = useState("patient");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { setActiveRole } = useAuth();

  const handleMetaMask = async () => {
    if (!window.ethereum?.isMetaMask) {
      toast.error("MetaMask not detected. Please install MetaMask to continue.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      // Step 1: Request wallet accounts
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        toast.error("No accounts found. Please connect your MetaMask wallet.");
        return;
      }

      const walletAddress = accounts[0].toLowerCase();

      // Step 2: Check if wallet is registered (pre-flight, fault-tolerant)
      const { data: checkData, error: checkError } = await callMetaMaskAuth({
        action: "check",
        walletAddress,
      });

      if (!checkError && checkData !== null) {
        const walletExists = checkData?.exists === true;

        if (authMode === "login" && !walletExists) {
          toast.error("Wallet not registered. Please sign up first.");
          return;
        }

        if (authMode === "register" && walletExists) {
          toast.error("Wallet already registered. Please log in instead.");
          return;
        }
      }
      // If check fails (network/other), proceed and let backend enforce intent.

      // Step 3: Get challenge nonce
      const { data: challengeData, error: challengeError } = await callMetaMaskAuth({
        action: "challenge",
        walletAddress,
      });

      if (challengeError || !challengeData?.nonce) {
        toast.error("Failed to get authentication challenge. Please try again.");
        console.error("Challenge error:", challengeError, challengeData);
        return;
      }

      // Step 4: Ask user to sign the nonce message
      const message = `Sign this message to authenticate with MediLocker.\n\nNonce: ${challengeData.nonce}`;
      const signature = (await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      })) as string;

      // Step 5: Verify signature + enforce intent on backend
      const { data: verifyData, error: verifyError } = await callMetaMaskAuth({
        action: "verify",
        walletAddress,
        signature,
        nonce: challengeData.nonce,
        loginAs: activeRole,
        intent: authMode,
      });

      if (verifyError || !verifyData?.token) {
        // Surface specific error messages from backend
        const msg = (verifyData?.message as string) ?? null;
        if (verifyError === "not_registered" || msg?.toLowerCase().includes("not registered")) {
          toast.error("Wallet not registered. Please sign up first.");
        } else if (verifyError === "already_registered" || msg?.toLowerCase().includes("already registered")) {
          toast.error("Wallet already registered. Please log in instead.");
        } else {
          toast.error(msg ?? "Authentication failed. Please try again.");
        }
        console.error("Verify error:", verifyError, verifyData);
        return;
      }

      // Step 6: Establish Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: verifyData.token as string,
        refresh_token: verifyData.refresh_token as string,
      });

      if (sessionError) {
        toast.error("Failed to establish session. Please try again.");
        console.error("Session error:", sessionError);
        return;
      }

      setActiveRole(activeRole as "patient" | "doctor");

      if (authMode === "register") {
        toast.success("Account created! Welcome to MediLocker.");
        navigate("/onboarding");
      } else {
        toast.success(
          `Welcome back! Logged in as ${activeRole === "doctor" ? "Doctor" : "Patient"}.`
        );
        if (verifyData.onboarding_complete) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes("User rejected")) {
        toast.error("Connection cancelled by user.");
      } else {
        toast.error("Failed to connect wallet. Please try again.");
        console.error(error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[480px] px-4"
      >
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">MediLocker</CardTitle>
            <CardDescription className="text-muted-foreground">
              Secure health records powered by your wallet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* ── Role selection ─────────────────────────── */}
            <Tabs value={activeRole} onValueChange={setActiveRoleTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="patient"
                  className="gap-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger
                  value="doctor"
                  className="gap-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>
              <TabsContent value="patient" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Access your medical records, health score, insurance, and QR code.
                </p>
              </TabsContent>
              <TabsContent value="doctor" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Dashboard with patient search, add medical records, and upload reports directly to
                  patient files.
                </p>
              </TabsContent>
            </Tabs>

            {/* ── Auth mode toggle ───────────────────────── */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  authMode === "login"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Log In
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  authMode === "register"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </button>
            </div>

            {/* ── Helper text ────────────────────────────── */}
            <p className="text-xs text-muted-foreground text-center">
              {authMode === "login"
                ? "Connect your registered wallet to log in to your account."
                : "Connect a new wallet to create your MediLocker account."}
            </p>

            {/* ── MetaMask button ────────────────────────── */}
            <Button
              onClick={handleMetaMask}
              disabled={isConnecting}
              className="w-full gap-3"
              size="lg"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
              {isConnecting
                ? "Connecting..."
                : authMode === "login"
                ? "Log In with MetaMask"
                : "Sign Up with MetaMask"}
            </Button>

            {/* ── Security note ──────────────────────────── */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">🔒 Secure Authentication</span>
                <br />
                We use your MetaMask wallet to verify your identity. No passwords are stored —
                your private key never leaves your wallet.
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Don't have MetaMask?{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Download here
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
