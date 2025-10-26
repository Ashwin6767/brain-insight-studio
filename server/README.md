# Backend (FastAPI)

This is the FastAPI backend serving predictions for:
- Clinical CSV-style inputs (RandomForest)
- MRI images (CNN)

## Structure

- `server/main.py` — FastAPI app
- `server/models/` — model artifacts
  - `alzheimers_csv_model.joblib` (tracked in Git)
  - `alzheimers_image_model.h5` (tracked via Git LFS)
- `server/requirements.txt` — backend dependencies

## Prereqs

- Python 3.11
- macOS Apple Silicon recommended for TensorFlow packages below.

## Setup

```bash
# from repo root
cd server
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# run
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

If you are not on macOS Apple Silicon, comment out the two TensorFlow lines in `requirements.txt` and install the appropriate TensorFlow for your platform.

## Notes
- If `server/models/alzheimers_image_model.h5` is missing, the image endpoint will return a helpful error. You can generate it using the notebook in `notebooks/`.
