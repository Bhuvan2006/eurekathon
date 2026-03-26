from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import json
import traceback
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from .env file in project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")
load_dotenv(env_path)

# -----------------------------
# Load model (Docker-safe path)
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "diabetes_model.pkl")

model = joblib.load(MODEL_PATH)

app = FastAPI(title="Diabetes Prediction API")

# -----------------------------
# Allow frontend (React) to call backend
# -----------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Health check
# -----------------------------
@app.get("/")
def health():
    return {"message": "Diabetes model API is running"}

# -----------------------------
# Request Schema
# -----------------------------
class PredictRequest(BaseModel):
    pregnancies: float
    glucose: float
    bloodPressure: float
    skinThickness: float
    insulin: float
    bmi: float
    diabetesPedigree: float
    age: float

# ─────────────────────────────────────────────────────────────
# AI / LLM Setup
# ─────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY not set in .env — LLM explanations will be disabled")

genai_client = None
if GEMINI_API_KEY:
    genai_client = genai.Client(api_key=GEMINI_API_KEY)


SYSTEM_PROMPT = """
You are a clinical decision support assistant helping clinicians understand a patient's diabetes risk.

You must explain the diabetes risk assessment using ONLY the structured data provided below.

You are NOT allowed to:
- Add new risk factors not present in the data
- Provide a definitive medical diagnosis
- Infer causes not explicitly mentioned
- Mention model internals or algorithms

You MUST:
- Format your entire response as **markdown bullet points** (use `- ` for each point)
- **Bold** all important medical terms, risk factor names, numeric values, and clinical keywords using `**word**`
- Use cautious, non-diagnostic clinical language
- Clearly explain why the assigned risk level was determined
- Reference the top contributing factors, detected patterns, and the counterfactual insight
- Write 10-15 bullet points in a clear, accurate, and neutral clinical tone
- Include evidence-based lifestyle factors (e.g. diet, physical activity, weight management) that are known to influence diabetes risk

If information is missing, do NOT speculate. Stay strictly within the provided data.
"""

def build_user_prompt(reasoning: dict, patient_data: dict) -> str:
    return f"""
Using the following structured risk assessment data and patient inputs, write a clinician-friendly explanation.

Patient Input Data:
- Pregnancies       : {patient_data.get("pregnancies")}
- Glucose Level     : {patient_data.get("glucose")} mg/dL
- Blood Pressure    : {patient_data.get("bloodPressure")} mm Hg
- Skin Thickness    : {patient_data.get("skinThickness")} mm
- Insulin           : {patient_data.get("insulin")} μU/mL
- BMI               : {patient_data.get("bmi")} kg/m²
- Diabetes Pedigree : {patient_data.get("diabetesPedigree")}
- Age               : {patient_data.get("age")} years

Risk Assessment (MODEL OUTPUT):
- Risk Level        : {reasoning.get("risk_level")}
- Confidence        : {reasoning.get("confidence")}
- Pattern Detected  : {reasoning.get("pattern_detected")}
- Counterfactual    : {reasoning.get("counterfactual")}
- Top Factors       : {json.dumps(reasoning.get("top_factors", []), indent=2)}

Based on all the above data, write a 10-15 sentence explanation for the clinician.
Explain the risk level, reference the key contributing factors, and mention evidence-based lifestyle habits
(such as diet, exercise, and weight management) that are known to affect diabetes risk.
Do not introduce any information not present in the data above.
"""

def generate_explanation(reasoning: dict, patient_data: dict) -> str:
    if genai_client is None:
        return "LLM explanation unavailable — check GEMINI_API_KEY in .env"

    import time
    prompt = f"{SYSTEM_PROMPT}\n\n{build_user_prompt(reasoning, patient_data)}"
    last_error = None

    for attempt in range(3):
        try:
            response = genai_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            return response.text
        except Exception as e:
            last_error = e
            error_msg = str(e)
            if "API key not valid" in error_msg or "API_KEY_INVALID" in error_msg:
                print("[Gemini Error] Invalid API key")
                return "LLM explanation unavailable — check GEMINI_API_KEY in .env"
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                wait = 2 ** attempt
                print(f"[Gemini] Rate limited, retrying in {wait}s (attempt {attempt+1}/3)")
                time.sleep(wait)
                continue
            traceback.print_exc()
            print(f"[Gemini Error] {e}")
            return f"AI explanation unavailable. ({type(e).__name__}: {e})"

    print(f"[Gemini] All retries exhausted: {last_error}")
    return "AI explanation temporarily unavailable due to API rate limits. The risk assessment above is still valid."

# ─────────────────────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────────────────────

def calculate_confidence(risk_percentage: float) -> float:
    """Scale 0–100 risk percentage → 0.60–0.95 confidence score."""
    return round(0.6 + (risk_percentage / 100) * 0.35, 2)

def extract_top_factors(shap_values: list, top_k: int = 3) -> list:
    """Sort SHAP values by impact descending and return top-k."""
    sorted_factors = sorted(shap_values, key=lambda x: x["value"], reverse=True)
    return [
        {
            "feature": factor["feature"].lower().replace(" ", "_"),
            "impact": round(factor["value"], 2)
        }
        for factor in sorted_factors[:top_k]
    ]

def detect_pattern(input_data: dict) -> str:
    patterns = []
    if input_data["glucose"] > 140:
        patterns.append("elevated glucose")
    if input_data["bmi"] >= 30:
        patterns.append("high BMI")
    if input_data["diabetesPedigree"] > 0.6:
        patterns.append("strong family history")
    if patterns:
        return f"{', '.join(patterns).capitalize()} — higher diabetes risk group"
    return "No strong high-risk metabolic patterns detected"

def generate_counterfactual(top_factors: list) -> str:
    if not top_factors:
        return "Insufficient factor data for counterfactual reasoning"
    strongest = top_factors[0]["feature"]
    return f"Reducing {strongest.replace('_', ' ')} has the strongest impact on lowering risk"

def build_reasoning_json(model_output: dict, input_data: dict) -> dict:
    top_factors = extract_top_factors(model_output["shapValues"])
    return {
        "risk_level": model_output["riskLevel"],
        "confidence": calculate_confidence(model_output["riskPercentage"]),
        "top_factors": top_factors,
        "pattern_detected": detect_pattern(input_data),
        "counterfactual": generate_counterfactual(top_factors)
    }

# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────

@app.post("/predict")
def predict(data: PredictRequest):

    features = np.array([[
        data.pregnancies,
        data.glucose,
        data.bloodPressure,
        data.skinThickness,
        data.insulin,
        data.bmi,
        data.diabetesPedigree,
        data.age
    ]])

    probability = model.predict_proba(features)[0][1]
    risk_percentage = int(probability * 100)

    risk_level = (
        "Low"      if probability < 0.30 else
        "Moderate" if probability < 0.60 else
        "High"
    )

    # SHAP-style feature importance values
    feature_names = [
        "Pregnancies", "Glucose", "Blood Pressure",
        "Skin Thickness", "Insulin", "BMI",
        "Diabetes Pedigree", "Age"
    ]
    importances = model.feature_importances_
    shap_values = [
        {"feature": name, "value": float(imp)}
        for name, imp in zip(feature_names, importances)
    ]

    response_from_model = {
        "riskLevel": risk_level,
        "riskPercentage": risk_percentage,
        "shapValues": shap_values
    }

    patient_input = {
        "pregnancies": data.pregnancies,
        "glucose": data.glucose,
        "bloodPressure": data.bloodPressure,
        "skinThickness": data.skinThickness,
        "insulin": data.insulin,
        "bmi": data.bmi,
        "diabetesPedigree": data.diabetesPedigree,
        "age": data.age
    }

    reasoning = build_reasoning_json(
        model_output=response_from_model,
        input_data=patient_input
    )

    # Pass full patient data into the LLM prompt
    explanation = generate_explanation(reasoning, patient_input)

    return {
        "riskProbability": round(float(probability), 3),
        "riskPercentage": risk_percentage,
        "riskLevel": risk_level,
        "confidence": reasoning["confidence"],
        "top_factors": reasoning["top_factors"],
        "pattern_detected": reasoning["pattern_detected"],
        "counterfactual": reasoning["counterfactual"],
        "explanation": explanation
    }
