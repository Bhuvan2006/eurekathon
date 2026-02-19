import { Outlet } from "react-router";
import { Header } from "./Header";

export function Root() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Outlet />
      <footer className="bg-primary text-primary-foreground py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-primary-foreground/90">
                © 2026 DiabetesAI Explainable Prediction System
              </p>
              <p className="text-xs text-primary-foreground/70 mt-1">
                For healthcare professional use only. Not a substitute for clinical judgment.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-primary-foreground/80">
              <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
