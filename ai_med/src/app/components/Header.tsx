import { Link, useLocation } from "react-router";
import { Activity } from "lucide-react";

export function Header() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/predict", label: "Prediction" },
    { path: "/insights", label: "Model Insights" },
    { path: "/about", label: "About" },
  ];
  
  return (
    <header className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-accent p-2 rounded-lg">
              <Activity className="size-6 text-accent-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-tight">DiabetesAI</span>
              <span className="text-xs opacity-90">Explainable Prediction</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-primary-foreground/90 hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="md:hidden flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
