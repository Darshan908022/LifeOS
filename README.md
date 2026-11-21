\# LifeOS 🚀



\*\*Your Life. Your Goals. Your Productivity.\*\*



LifeOS is an AI-powered personal productivity and life management platform designed to help users organize their daily activities, track goals, build habits, and improve their productivity through an intelligent AI assistant.



\## ✨ Features



\- \*\*Dashboard\*\* — Overview of your productivity and activities.

\- \*\*Task Management\*\* — Create, organize, and track daily tasks.

\- \*\*Goal Tracking\*\* — Set personal goals and monitor progress.

\- \*\*Habit Tracking\*\* — Build consistent habits and track daily activity.

\- \*\*Calendar\*\* — Organize and visualize your schedule.

\- \*\*Analytics\*\* — Understand your productivity through insights.

\- \*\*AI Assistant\*\* — Get intelligent assistance through an integrated AI chat.

\- \*\*User Profile\*\* — Manage personal information and profile images.

\- \*\*Settings\*\* — Customize application preferences and notifications.

\- \*\*Authentication\*\* — Secure user registration and login.

\- \*\*Responsive UI\*\* — Designed for desktop and mobile screens.



\## 🛠️ Tech Stack



\### Frontend

\- React

\- TypeScript

\- Vite

\- CSS

\- Lucide React

\- Axios



\### Backend

\- Python

\- FastAPI

\- SQLAlchemy

\- Alembic

\- PostgreSQL

\- JWT Authentication



\## 📁 Project Structure



```text

LifeOS/

├── backend/

│   ├── alembic/

│   ├── app/

│   │   ├── api/

│   │   ├── core/

│   │   ├── db/

│   │   ├── models/

│   │   ├── schemas/

│   │   └── services/

│   ├── requirements.txt

│   └── alembic.ini

│

├── frontend/

│   ├── public/

│   ├── src/

│   ├── package.json

│   └── vite.config.ts

│

├── docker-compose.yml

├── .gitignore

└── README.md

```



\## ⚙️ Local Development



\### 1. Clone the repository



```bash

git clone https://github.com/Darshan908022/LifeOS.git

cd LifeOS

```



\### 2. Backend Setup



```bash

cd backend



python -m venv .venv

```



Activate the environment on Windows:



```bash

.venv\\Scripts\\activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Configure your backend environment variables in `backend/.env` according to the application configuration.



Make sure PostgreSQL is running and your database configuration is correct.



Run database migrations:



```bash

alembic upgrade head

```



Start the backend:



```bash

uvicorn app.main:app --reload

```



Backend API documentation:



`http://localhost:8000/docs`



\### 3. Frontend Setup



Open another terminal:



```bash

cd frontend



npm install



npm run dev

```



Open the local frontend URL displayed by Vite, usually:



`http://localhost:5173`



\## 🔐 Security



\- Environment variables and credentials should never be committed.

\- API secrets must remain on the backend.

\- Authentication is protected using JWT.

\- Passwords are securely hashed.

\- Production deployments should use HTTPS and properly configured CORS.



\## 🚀 Deployment



LifeOS is being prepared for production deployment.



Planned deployment architecture:



\- Frontend: Vercel

\- Backend: Render

\- Database: Managed PostgreSQL



\## 👨‍💻 Author



\*\*Darshan\*\*



GitHub: https://github.com/Darshan908022



\---



⭐ If you find this project interesting, consider giving it a star!



\*\*LifeOS — Build Better Habits. Achieve Bigger Goals. Live Smarter.\*\*

