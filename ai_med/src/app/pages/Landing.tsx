import { Link } from "react-router";
import { Brain, ShieldCheck, BarChart3, ChevronRight, Activity, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Landing() {
  const features = [
    {
      icon: Brain,
      title: "Explainable AI",
      description: "Understand every prediction with transparent SHAP-based explanations and feature contributions.",
    },
    {
      icon: ShieldCheck,
      title: "High Accuracy",
      description: "Trained on validated medical datasets with robust cross-validation and performance metrics.",
    },
    {
      icon: BarChart3,
      title: "SHAP Insights",
      description: "Visual interpretation of feature importance and individual prediction reasoning.",
    },
  ];
  
  const benefits = [
    "Evidence-based risk assessment",
    "Transparent decision support",
    "Real-time predictions",
    "Clinical-grade accuracy",
  ];
  
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                  AI-Powered Healthcare
                </span>
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                Explainable AI for Diabetes Risk Prediction
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Transparent, reasoning-backed diagnostic support for healthcare professionals
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/predict">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8 rounded-xl shadow-lg">
                    Start Prediction
                    <ChevronRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link to="/insights">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 font-medium px-8 rounded-xl"
                  >
                    View Model Insights
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-card rounded-2xl shadow-2xl p-6 border border-border">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1767449441925-737379bc2c4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMGRhc2hib2FyZCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcxNDg4MDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Medical Dashboard Illustration"
                  className="w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Built for Healthcare Professionals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced machine learning meets clinical transparency with our explainable AI platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-border group"
              >
                <div className="bg-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="size-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
                <Zap className="size-4 text-accent" />
                <span className="text-sm font-medium text-accent">Clinical Benefits</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Trusted Decision Support for Diabetes Risk
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI system provides interpretable predictions backed by medical evidence, helping healthcare professionals make informed decisions with confidence.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="size-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/about">
                  <Button variant="outline" className="border-2 rounded-xl">
                    Learn More About Our Approach
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent rounded-xl p-3">
                    <Activity className="size-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">98.2%</div>
                    <div className="text-sm text-muted-foreground">Model Accuracy</div>
                  </div>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex items-center gap-4">
                  <div className="bg-accent rounded-xl p-3">
                    <Brain className="size-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Explainable Predictions</div>
                  </div>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex items-center gap-4">
                  <div className="bg-accent rounded-xl p-3">
                    <ShieldCheck className="size-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">HIPAA</div>
                    <div className="text-sm text-muted-foreground">Compliant Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Experience transparent AI-driven diabetes risk prediction with real-time explanations
          </p>
          <Link to="/predict">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-10 rounded-xl shadow-lg">
              Start Your First Prediction
              <ChevronRight className="ml-2 size-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
