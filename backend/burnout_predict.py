from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

# Carrega o modelo treinado
model = joblib.load(BASE_DIR / "burnout_model_random_forest.pkl")

def predict_burnout(data):
    # Lógica blindada: tenta pegar com letra minúscula/camelCase, se não achar, tenta com a primeira Maiúscula
    df = pd.DataFrame([{
        "Employee_ID": data.get("employeeId", data.get("Employee_ID", 0)),
        "Age": float(data.get("age", data.get("Age", 32))),
        "Gender": str(data.get("gender", data.get("Gender", "male"))).lower(),
        "Country": data.get("country", data.get("Country", "Brasil")),
        "Job_Role": data.get("jobRole", data.get("Job_Role", "Desenvolvedor")),
        "Company_Size": str(data.get("companySize", data.get("Company_Size", "medium"))).lower(),
        "Work_Environment": str(data.get("workEnvironment", data.get("Work_Environment", "hybrid"))).lower(),
        "Experience_Years": float(data.get("experienceYears", data.get("Experience_Years", 5))),
        "Work_Hours_Per_Day": float(data.get("workHoursPerDay", data.get("Work_Hours_Per_Day", 8))),
        "Meetings_Per_Day": float(data.get("meetingsPerDay", data.get("Meetings_Per_Day", 3))),
        "Internet_Speed_Mbps": float(data.get("internetSpeed", data.get("Internet_Speed", 500))), 
        "Sleep_Hours": float(data.get("sleepHours", data.get("Sleep_Hours", 7))),
        "Exercise_Hours_Per_Week": float(data.get("exerciseHoursPerWeek", data.get("Exercise_Hours_Per_Week", 3))),
        "Screen_Time_Hours": float(data.get("screenTimeHours", data.get("Screen_Time_Hours", 10))),
        "Stress_Level": str(data.get("stressLevel", data.get("Stress_Level", "medium"))).lower(),
        "Productivity_Score": float(data.get("productivityScore", data.get("Productivity_Score", 70))),
    }])

    # Calcula a probabilidade do Burnout (valor entre 0.0 e 1.0)
    probability = float(model.predict_proba(df)[0][1])

    return {
        "hasBurnout": probability >= 0.5,
        "probability": round(probability * 100, 2)
    }
