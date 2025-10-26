# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8486fb14-d48a-406f-920f-f74304a95749

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8486fb14-d48a-406f-920f-f74304a95749) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Run the full project (frontend + backend)

This repo now includes both the React frontend and a FastAPI backend.

- Frontend: Vite app (this folder)
- Backend: `server/` (FastAPI)
- Notebook: `notebooks/alzheimers.ipynb` (to reproduce models and EDA)

### 1) Backend

Requirements: Python 3.11. On macOS Apple Silicon, TensorFlow uses Metal.

```sh
cd server
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# start API at http://localhost:8000
python main.py
# or
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Notes:
- `server/models/alzheimers_image_model.h5` is stored via Git LFS. If you cannot fetch LFS files, install Git LFS and re-pull:
	- macOS: `brew install git-lfs && git lfs install`
	- Then `git pull` again to download the `.h5`
- If the `.h5` is missing, the image endpoint will be disabled gracefully. You can regenerate it from the notebook.

### 2) Frontend

Requirements: Node.js 18+.

```sh
npm i
npm run dev
# App runs at http://localhost:5173 (or the port Vite prints)
```

### 3) Configure the frontend to call the backend

The frontend is already configured to call the backend at `http://localhost:8000`.

### 4) Reproducing models with the notebook

Open `notebooks/alzheimers.ipynb` in VS Code or Jupyter and run cells to download data, train, and export models.

## Git LFS

This repo uses Git LFS for large model files (`*.h5`). If you see a pointer file instead of the actual model, install LFS locally and run `git lfs install`, then re-pull.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8486fb14-d48a-406f-920f-f74304a95749) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
