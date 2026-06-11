from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

# Carrega o modelo treinado
model = joblib.load(BASE_DIR / "burnout_model_random_forest.pkl")

def predict_burnout(data):
    # Criamos o DataFrame mapeando exatamente os nomes das tags "name" do seu HTML
    df = pd.DataFrame([{
        "Employee_ID": data.get("employeeId", 0),
        "Age": data.get("age", 30),
        "Gender": data.get("gender", "male"),
        "Country": data.get("country", "Brasil"),
        "Job_Role": data.get("jobRole", "Desenvolvedor"),
        "Company_Size": data.get("companySize", "medium"),
        "Work_Environment": data.get("workEnvironment", "hybrid"),
        "Experience_Years": data.get("experienceYears", 5),
        "Work_Hours_Per_Day": data.get("workHoursPerDay", 8),
        "Meetings_Per_Day": data.get("meetingsPerDay", 3),
        "Internet_Speed_Mbps": data.get("internetSpeed", 500), # Mapeado idêntico ao seu input!
        "Sleep_Hours": data.get("sleepHours", 7),
        "Exercise_Hours_Per_Week": data.get("exerciseHoursPerWeek", 3),
        "Screen_Time_Hours": data.get("screenTimeHours", 10),
        "Stress_Level": data.get("stressLevel", "medium"),
        "Productivity_Score": data.get("productivityScore", 70),
    }])

    # Calcula a probabilidade do Burnout (valor retornado pelo modelo entre 0.0 e 1.0)
    probability = float(model.predict_proba(df)[0][1])

    # Devolvemos a probabilidade real multiplicada por 100
    return {
        "hasBurnout": probability >= 0.5,
        "probability": round(probability * 100, 2)
    }
