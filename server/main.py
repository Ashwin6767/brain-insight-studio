import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import sys
import os

# Initialize FastAPI app
app = FastAPI(
    title="Alzheimer's Prediction API",
    description="An API to serve predictions from a RandomForest model (for CSV data) and a CNN model (for MRI images).",
    version="1.0.0"
)

# --- CORS Configuration ---
# Allow requests from our frontend development server
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
# Resolve paths relative to this file (server directory)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load the trained models when the server starts
try:
    csv_model_path = os.path.join(MODELS_DIR, 'alzheimers_csv_model.joblib')
    csv_model = joblib.load(csv_model_path)
    print("CSV model loaded successfully.")
except FileNotFoundError:
    print("Error: 'alzheimers_csv_model.joblib' not found in server/models.", file=sys.stderr)
    csv_model = None

try:
    image_model_path = os.path.join(MODELS_DIR, 'alzheimers_image_model.h5')
    image_model = tf.keras.models.load_model(image_model_path)
    print("Image model loaded successfully.")
except (FileNotFoundError, IOError):
    print("Error: 'alzheimers_image_model.h5' not found in server/models.", file=sys.stderr)
    image_model = None

# --- Pydantic Models for Request Bodies ---
# These models validate the structure of incoming data
class ClinicalData(BaseModel):
    gender: str
    age: float
    educ: float
    ses: float
    mmse: float
    etiv: float
    nwbv: float
    asf: float

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Alzheimer's Prediction API"}

@app.post("/predict/csv")
async def predict_csv(data: ClinicalData):
    """
    Receives clinical data, preprocesses it, and returns a prediction
    from the RandomForest model.
    """
    if not csv_model:
        return {"error": "CSV model is not available."}

    # Preprocess the input data to match the model's training format
    # The model was trained with 'M/F' encoded as 1/0
    gender_encoded = 1 if data.gender == 'M' else 0
    
    # The features must be in the same order as during training
    features = [
        gender_encoded, 
        data.age, 
        data.educ, 
        data.ses, 
        data.mmse, 
        data.etiv, 
        data.nwbv, 
        data.asf
    ]
    
    # Convert to a 2D array for the model
    features_array = np.array(features).reshape(1, -1)

    # Make prediction and get probabilities
    prediction_encoded = csv_model.predict(features_array)[0]
    probabilities = csv_model.predict_proba(features_array)[0]

    # Map encoded prediction back to a meaningful label
    prediction_label = "Demented" if prediction_encoded == 1 else "NonDemented"

    return {
        "prediction": prediction_label,
        "probabilities": {
            "NonDemented": probabilities[0],
            "Demented": probabilities[1]
        }
    }

@app.post("/predict/image")
async def predict_image(image: UploadFile = File(...)):
    """
    Receives an MRI image, preprocesses it, and returns a prediction
    from the CNN model.
    """
    if not image_model:
        return {"error": "Image model is not available."}

    # Read and preprocess the image
    contents = await image.read()
    img = Image.open(io.BytesIO(contents)).convert('RGB')
    img = img.resize((128, 128))
    
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Create a batch
    img_array /= 255.0  # Rescale

    # Make prediction
    predictions = image_model.predict(img_array)[0]
    
    # Get the class with the highest probability
    predicted_class_index = np.argmax(predictions)
    class_labels = ['MildDemented', 'ModerateDemented', 'NonDemented', 'VeryMildDemented']
    predicted_class_label = class_labels[predicted_class_index]

    return {
        "prediction": predicted_class_label,
        "probabilities": {
            "MildDemented": float(predictions[0]),
            "ModerateDemented": float(predictions[1]),
            "NonDemented": float(predictions[2]),
            "VeryMildDemented": float(predictions[3])
        }
    }

# --- Server Execution ---
# This allows running the server directly with 'python main.py'
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
