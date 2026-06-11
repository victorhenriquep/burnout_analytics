from flask import Flask, request, jsonify
from flask_cors import CORS
from burnout_predict import predict_burnout

app = Flask(__name__)
CORS(app)

@app.post("/predict")
def predict():

    data = request.get_json()

    result = predict_burnout(data)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
