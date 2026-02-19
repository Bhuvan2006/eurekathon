import { useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FormData {
  pregnancies: string;
  glucose: string;
  bloodPressure: string;
  skinThickness: string;
  insulin: string;
  bmi: string;
  diabetesPedigree: string;
  age: string;
}

interface PredictionResult {
  riskPercentage: number;
  riskLevel: "Low" | "Moderate" | "High";
  shapValues: Array<{ feature: string; value: number }>;
}

export function Prediction() {
  const [formData, setFormData] = useState<FormData>({
    pregnancies: "",
    glucose: "",
    bloodPressure: "",
    skinThickness: "",
    insulin: "",
    bmi: "",
    diabetesPedigree: "",
    age: "",
  });
  
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePredict = () => {
    setIsLoading(true);
    
    // Simulate prediction with mock data
    setTimeout(() => {
      const glucose = parseFloat(formData.glucose) || 0;
      const bmi = parseFloat(formData.bmi) || 0;
      const age = parseFloat(formData.age) || 0;
      
      // Simple mock calculation
      let risk = 20;
      if (glucose > 140) risk += 30;
      if (bmi > 30) risk += 20;
      if (age > 45) risk += 15;
      if (formData.diabetesPedigree && parseFloat(formData.diabetesPedigree) > 0.5) risk += 15;
      
      risk = Math.min(risk, 95);
      
      const mockResult: PredictionResult = {
        riskPercentage: risk,
        riskLevel: risk < 30 ? "Low" : risk < 60 ? "Moderate" : "High",
        shapValues: [
          { feature: "Glucose", value: glucose > 140 ? 0.35 : 0.12 },
          { feature: "BMI", value: bmi > 30 ? 0.28 : 0.08 },
          { feature: "Age", value: age > 45 ? 0.22 : 0.05 },
          { feature: "Diabetes Pedigree", value: 0.18 },
          { feature: "Blood Pressure", value: 0.12 },
          { feature: "Insulin", value: 0.09 },
          { feature: "Pregnancies", value: 0.06 },
          { feature: "Skin Thickness", value: 0.04 },
        ].sort((a, b) => b.value - a.value),
      };
      
      setResult(mockResult);
      setIsLoading(false);
    }, 1500);
  };
  
  const inputFields = [
    { key: "pregnancies" as keyof FormData, label: "Pregnancies", placeholder: "0-17", unit: "times" },
    { key: "glucose" as keyof FormData, label: "Glucose Level", placeholder: "70-200", unit: "mg/dL" },
    { key: "bloodPressure" as keyof FormData, label: "Blood Pressure", placeholder: "40-122", unit: "mm Hg" },
    { key: "skinThickness" as keyof FormData, label: "Skin Thickness", placeholder: "7-99", unit: "mm" },
    { key: "insulin" as keyof FormData, label: "Insulin", placeholder: "14-846", unit: "μU/mL" },
    { key: "bmi" as keyof FormData, label: "BMI", placeholder: "18.5-67", unit: "kg/m²" },
    { key: "diabetesPedigree" as keyof FormData, label: "Diabetes Pedigree", placeholder: "0.078-2.42", unit: "" },
    { key: "age" as keyof FormData, label: "Age", placeholder: "21-81", unit: "years" },
  ];
  
  return (
    <div className="flex-1 py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Diabetes Risk Prediction</h1>
          <p className="text-lg text-muted-foreground">
            Enter patient information to generate an explainable diabetes risk assessment
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-accent" />
                Patient Information
              </CardTitle>
              <CardDescription>
                All fields are required for accurate prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {inputFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="bg-input-background border-border rounded-xl pr-16"
                      />
                      {field.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {field.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-6 rounded-xl shadow-md"
              >
                {isLoading ? "Analyzing..." : "Predict Diabetes Risk"}
              </Button>
              
              <div className="flex items-start gap-2 p-4 bg-accent/5 rounded-xl border border-accent/20">
                <Info className="size-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  This tool provides risk assessment support. Always consult with healthcare professionals for medical decisions.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Risk Assessment Card */}
              <Card className="shadow-lg border-border rounded-2xl">
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>AI-generated diabetes risk analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold text-foreground mb-2">
                      {result.riskPercentage}%
                    </div>
                    <div className="text-lg text-muted-foreground mb-4">
                      Diabetes Risk Probability
                    </div>
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
                      result.riskLevel === "Low" 
                        ? "bg-green-100 text-green-800" 
                        : result.riskLevel === "Moderate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {result.riskLevel === "Low" ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <AlertCircle className="size-5" />
                      )}
                      {result.riskLevel} Risk
                    </div>
                  </div>
                  
                  <div className="h-px bg-border"></div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Risk Interpretation</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.riskLevel === "Low" && "Patient shows low diabetes risk based on current indicators. Continue regular monitoring."}
                      {result.riskLevel === "Moderate" && "Patient shows moderate diabetes risk. Consider preventive measures and lifestyle modifications."}
                      {result.riskLevel === "High" && "Patient shows high diabetes risk. Recommend comprehensive evaluation and intervention planning."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* SHAP Explanation Card */}
              <Card className="shadow-lg border-border rounded-2xl">
                <CardHeader>
                  <CardTitle>SHAP Feature Importance</CardTitle>
                  <CardDescription>
                    How each feature contributed to the prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={result.shapValues} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#6B7280" />
                      <YAxis type="category" dataKey="feature" stroke="#6B7280" width={130} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {result.shapValues.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#14B8A6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">SHAP values</strong> explain the contribution of each feature to the final prediction. 
                      Higher values indicate stronger influence on the diabetes risk assessment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {!result && (
            <Card className="shadow-lg border-border rounded-2xl bg-muted/30">
              <CardContent className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="size-10 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Ready for Analysis
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Complete the patient information form and click "Predict Diabetes Risk" to generate an explainable risk assessment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
