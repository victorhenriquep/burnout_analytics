from pathlib import Path

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(
    BASE_DIR / "burnout_model_random_forest.pkl"
)

def predict_burnout(data):

    df = pd.DataFrame([{
        "Employee_ID": data.get("employeeId", 0),
        "Age": data["age"],
        "Gender": data["gender"],
        "Country": data["country"],
        "Job_Role": data["jobRole"],
        "Company_Size": data["companySize"],
        "Work_Environment": data["workEnvironment"],
        "Experience_Years": data["experienceYears"],
        "Work_Hours_Per_Day": data["workHoursPerDay"],
        "Meetings_Per_Day": data["meetingsPerDay"],
        "Internet_Speed_Mbps": data["internetSpeedMbps"],
        "Sleep_Hours": data["sleepHours"],
        "Exercise_Hours_Per_Week": data["exerciseHoursPerWeek"],
        "Screen_Time_Hours": data["screenTimeHours"],
        "Stress_Level": data["stressLevel"],
        "Productivity_Score": data["productivityScore"],
    }])

    probability = float(model.predict_proba(df)[0][1])

    return {
        "hasBurnout": probability >= 0.5,
        "probability": round(probability * 100, 2)
    }
