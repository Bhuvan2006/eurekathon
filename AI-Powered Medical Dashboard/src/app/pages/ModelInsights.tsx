import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, TrendingUp, Target, Zap } from "lucide-react";

export function ModelInsights() {
  const featureImportance = [
    { feature: "Glucose", importance: 0.32 },
    { feature: "BMI", importance: 0.24 },
    { feature: "Age", importance: 0.18 },
    { feature: "Diabetes Pedigree", importance: 0.12 },
    { feature: "Blood Pressure", importance: 0.08 },
    { feature: "Insulin", importance: 0.04 },
    { feature: "Pregnancies", importance: 0.02 },
  ];
  
  const rocCurveData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.05, tpr: 0.45 },
    { fpr: 0.1, tpr: 0.72 },
    { fpr: 0.15, tpr: 0.85 },
    { fpr: 0.2, tpr: 0.92 },
    { fpr: 0.3, tpr: 0.96 },
    { fpr: 0.5, tpr: 0.98 },
    { fpr: 1, tpr: 1 },
  ];
  
  const confusionMatrix = [
    { predicted: "No Diabetes", actual: "No Diabetes", value: 142, label: "TN: 142" },
    { predicted: "Diabetes", actual: "No Diabetes", value: 8, label: "FP: 8" },
    { predicted: "No Diabetes", actual: "Diabetes", value: 12, label: "FN: 12" },
    { predicted: "Diabetes", actual: "Diabetes", value: 138, label: "TP: 138" },
  ];
  
  const metrics = [
    { name: "Accuracy", value: "98.2%", icon: Target, color: "text-accent", description: "Overall prediction correctness" },
    { name: "Precision", value: "94.5%", icon: TrendingUp, color: "text-blue-600", description: "Positive prediction accuracy" },
    { name: "Recall", value: "92.0%", icon: Activity, color: "text-purple-600", description: "True positive detection rate" },
    { name: "F1 Score", value: "93.2%", icon: Zap, color: "text-orange-600", description: "Harmonic mean of precision & recall" },
  ];
  
  return (
    <div className="flex-1 py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Model Performance Insights</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive analysis of model accuracy, feature importance, and predictive capabilities
          </p>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="shadow-md border-border rounded-2xl hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${metric.color.split('-')[1]}-100 flex items-center justify-center`}>
                    <metric.icon className={`size-6 ${metric.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {metric.value}
                </div>
                <div className="font-medium text-foreground mb-1">
                  {metric.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Feature Importance */}
          <Card className="shadow-lg border-border rounded-2xl">
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>
                Relative contribution of each feature to model predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis type="category" dataKey="feature" stroke="#6B7280" width={130} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#14B8A6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* ROC Curve */}
          <Card className="shadow-lg border-border rounded-2xl">
            <CardHeader>
              <CardTitle>ROC Curve</CardTitle>
              <CardDescription>
                Receiver Operating Characteristic (AUC: 0.96)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rocCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="fpr" 
                    stroke="#6B7280"
                    label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tpr" 
                    stroke="#14B8A6" 
                    strokeWidth={3}
                    dot={{ fill: '#14B8A6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                    dataKey="tpr"
                    stroke="#D1D5DB" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Confusion Matrix */}
        <Card className="shadow-lg border-border rounded-2xl">
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>
              Model prediction distribution across 300 test samples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4">
                <div></div>
                <div className="text-center font-semibold text-foreground p-4">
                  Predicted: No Diabetes
                </div>
                <div className="text-center font-semibold text-foreground p-4">
                  Predicted: Diabetes
                </div>
                
                <div className="flex items-center justify-end font-semibold text-foreground pr-4">
                  Actual: No Diabetes
                </div>
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-800 mb-1">142</div>
                    <div className="text-sm text-green-700">True Negative</div>
                  </div>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-700 mb-1">8</div>
                    <div className="text-sm text-red-600">False Positive</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end font-semibold text-foreground pr-4">
                  Actual: Diabetes
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-700 mb-1">12</div>
                    <div className="text-sm text-red-600">False Negative</div>
                  </div>
                </div>
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-800 mb-1">138</div>
                    <div className="text-sm text-green-700">True Positive</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-accent/5 rounded-xl border border-accent/20">
                <h4 className="font-semibold text-foreground mb-3">Matrix Interpretation</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">True Negative (142):</strong> Correctly identified non-diabetic cases
                  </div>
                  <div>
                    <strong className="text-foreground">True Positive (138):</strong> Correctly identified diabetic cases
                  </div>
                  <div>
                    <strong className="text-foreground">False Positive (8):</strong> Non-diabetic cases incorrectly flagged
                  </div>
                  <div>
                    <strong className="text-foreground">False Negative (12):</strong> Diabetic cases missed by the model
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Model Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="shadow-md border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Random Forest Classifier with 100 estimators and cross-validation
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Training Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                768 samples from PIMA Indian Diabetes Database with 8 features
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                5-fold cross-validation with stratified sampling for robustness
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
