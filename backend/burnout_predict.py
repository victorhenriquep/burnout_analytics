from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

# Carrega o modelo treinado
model = joblib.load(BASE_DIR / "burnout_model_random_forest.pkl")

def predict_burnout(data):
    # Criamos o DataFrame mapeando as chaves EXATAMENTE como o main.js envia (Iniciais Maiúsculas)
    # Usamos .get() para evitar o KeyError de vez!
    df = pd.DataFrame([{
        "Employee_ID": data.get("Employee_ID", 0),
        "Age": data.get("Age", 30),
        "Gender": data.get("Gender", "male"),
        "Country": data.get("Country", "Brasil"),
        "Job_Role": data.get("Job_Role", "Desenvolvedor"),
        "Company_Size": data.get("Company_Size", "medium"),
        "Work_Environment": data.get("Work_Environment", "hybrid"),
        "Experience_Years": data.get("Experience_Years", 0.0),
        "Work_Hours_Per_Day": data.get("Work_Hours_Per_Day", 8.0),
        "Meetings_Per_Day": data.get("Meetings_Per_Day", 0.0),
        "Internet_Speed_Mbps": data.get("Internet_Speed", 100.0), 
        "Sleep_Hours": data.get("Sleep_Hours", 7.0),
        "Exercise_Hours_Per_Week": data.get("Exercise_Hours_Per_Week", 0.0),
        "Screen_Time_Hours": data.get("Screen_Time_Hours", 0.0),
        "Stress_Level": data.get("Stress_Level", "medium"),
        "Productivity_Score": data.get("Productivity_Score", 70.0),
    }])

    # Calcula a probabilidade do Burnout
    probability = float(model.predict_proba(df)[0][1])

    return {
        "hasBurnout": probability >= 0.5,
        "probability": round(probability, 4)
    }
