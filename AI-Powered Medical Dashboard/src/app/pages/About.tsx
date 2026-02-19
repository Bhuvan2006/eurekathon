import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Database, Brain, LineChart, Shield, Users, BookOpen } from "lucide-react";

export function About() {
  const datasetFeatures = [
    { name: "Pregnancies", description: "Number of times pregnant" },
    { name: "Glucose", description: "Plasma glucose concentration (mg/dL)" },
    { name: "Blood Pressure", description: "Diastolic blood pressure (mm Hg)" },
    { name: "Skin Thickness", description: "Triceps skin fold thickness (mm)" },
    { name: "Insulin", description: "2-Hour serum insulin (μU/mL)" },
    { name: "BMI", description: "Body mass index (weight in kg/(height in m)²)" },
    { name: "Diabetes Pedigree", description: "Diabetes pedigree function score" },
    { name: "Age", description: "Patient age in years" },
  ];
  
  return (
    <div className="flex-1 py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">About the System</h1>
          <p className="text-lg text-muted-foreground">
            Understanding our explainable AI approach to diabetes risk prediction
          </p>
        </div>
        
        {/* Mission Statement */}
        <Card className="shadow-lg border-border rounded-2xl mb-8">
          <CardContent className="pt-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="size-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Transparent AI for Better Healthcare
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is to provide healthcare professionals with trustworthy, explainable AI tools that enhance 
                diagnostic accuracy while maintaining full transparency in how predictions are made. We believe that 
                understanding the "why" behind AI decisions is crucial for clinical confidence and patient care.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Key Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md border-border rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Database className="size-6 text-accent" />
              </div>
              <CardTitle>Validated Dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built on the PIMA Indian Diabetes Database, a well-established medical research dataset with validated clinical outcomes.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-border rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <LineChart className="size-6 text-accent" />
              </div>
              <CardTitle>SHAP Explanations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every prediction includes SHAP (SHapley Additive exPlanations) values that show exactly how each feature influenced the result.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-border rounded-2xl">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="size-6 text-accent" />
              </div>
              <CardTitle>Clinical Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Designed with healthcare professionals in mind, following best practices for medical AI systems and interpretability.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Dataset Information */}
        <Card className="shadow-lg border-border rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-accent" />
              Dataset Information
            </CardTitle>
            <CardDescription>
              PIMA Indian Diabetes Database characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Dataset Overview</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Total Samples:</span>
                    <span className="font-medium text-foreground">768 patients</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Features:</span>
                    <span className="font-medium text-foreground">8 clinical measurements</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Positive Cases:</span>
                    <span className="font-medium text-foreground">268 (34.9%)</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium text-foreground">National Institute of Diabetes</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-3">Clinical Features</h4>
                <div className="space-y-2">
                  {datasetFeatures.map((feature, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-foreground text-sm">{feature.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{feature.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> The dataset consists of diagnostic measurements from female patients 
                of Pima Indian heritage, aged 21 years or older. All patients were tested for diabetes according to World Health 
                Organization criteria.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Algorithm Explanation */}
        <Card className="shadow-lg border-border rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-5 text-accent" />
              Machine Learning Algorithm
            </CardTitle>
            <CardDescription>
              Random Forest Classifier with ensemble learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our system uses a <strong className="text-foreground">Random Forest Classifier</strong>, an ensemble learning method 
              that constructs multiple decision trees during training and outputs the mode of the classes for classification tasks.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <h4 className="font-semibold text-foreground mb-2">Why Random Forest?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>High accuracy and robustness to overfitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Handles non-linear relationships effectively</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Provides feature importance rankings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Works well with medical diagnostic data</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-xl">
                <h4 className="font-semibold text-foreground mb-2">Model Configuration</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Number of Trees:</span>
                    <span className="font-medium text-foreground">100 estimators</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Max Depth:</span>
                    <span className="font-medium text-foreground">Auto-optimized</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Min Samples Split:</span>
                    <span className="font-medium text-foreground">2</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Cross-Validation:</span>
                    <span className="font-medium text-foreground">5-fold stratified</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* SHAP Explainability */}
        <Card className="shadow-lg border-border rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-accent" />
              Explainability with SHAP
            </CardTitle>
            <CardDescription>
              Understanding prediction transparency through SHAP values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong className="text-foreground">SHAP (SHapley Additive exPlanations)</strong> is a game-theoretic approach 
              to explain the output of machine learning models. It provides a unified measure of feature importance that is 
              both theoretically sound and practically useful for healthcare applications.
            </p>
            
            <div className="space-y-3">
              <div className="p-4 bg-accent/5 rounded-xl border-l-4 border-accent">
                <h4 className="font-semibold text-foreground mb-2">What are SHAP Values?</h4>
                <p className="text-sm text-muted-foreground">
                  SHAP values represent the contribution of each feature to the difference between the actual prediction 
                  and the average prediction. They answer the question: "How much did this specific feature value contribute 
                  to moving the prediction away from the baseline?"
                </p>
              </div>
              
              <div className="p-4 bg-accent/5 rounded-xl border-l-4 border-accent">
                <h4 className="font-semibold text-foreground mb-2">Why SHAP for Healthcare?</h4>
                <p className="text-sm text-muted-foreground">
                  In clinical settings, understanding <em>why</em> a model makes a prediction is as important as the 
                  prediction itself. SHAP values provide:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• Individual prediction explanations</li>
                  <li>• Feature-level transparency</li>
                  <li>• Consistency and accuracy guarantees</li>
                  <li>• Intuitive visualization for clinicians</li>
                </ul>
              </div>
              
              <div className="p-4 bg-accent/5 rounded-xl border-l-4 border-accent">
                <h4 className="font-semibold text-foreground mb-2">Interpretation in Practice</h4>
                <p className="text-sm text-muted-foreground">
                  When you receive a prediction, each feature's SHAP value tells you whether that feature pushed the 
                  prediction higher (toward diabetes risk) or lower (away from risk), and by how much. This helps 
                  clinicians validate predictions against their clinical judgment and patient context.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Usage Guidelines */}
        <Card className="shadow-lg border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-accent" />
              Clinical Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h4 className="font-semibold text-yellow-900 mb-2">Important Clinical Notice</h4>
              <p className="text-sm text-yellow-800">
                This system is designed as a <strong>decision support tool</strong> for healthcare professionals. 
                It should not be used as the sole basis for clinical decisions. Always consider patient history, 
                additional diagnostic tests, and clinical judgment when making treatment decisions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-semibold text-green-900 mb-2">✓ Recommended Use</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Early risk screening and triage</li>
                  <li>• Supporting clinical diagnosis</li>
                  <li>• Patient education and discussion</li>
                  <li>• Research and quality improvement</li>
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="font-semibold text-red-900 mb-2">✗ Not Recommended</h4>
                <ul className="space-y-1 text-sm text-red-800">
                  <li>• Sole diagnostic criterion</li>
                  <li>• Replacing laboratory tests</li>
                  <li>• Emergency decision making</li>
                  <li>• Without clinical context</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
