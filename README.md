# JobTrack Pro – Job Application & Interview Tracker

A full-stack web application that helps job seekers manage their job applications, track interview schedules, monitor application progress, and analyze their job search activities through an interactive dashboard.

## 🚀 Live Demo

- **Frontend:** https://jobtrack-pro-frontend.onrender.com
- **Backend API:** https://jobtrack-pro-backend.onrender.com

## ✨ Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Dashboard:** View job application statistics and application progress.
- **Application Management:** Add, view, edit, and delete job applications.
- **Interview Management:** Schedule, update, and manage interviews.
- **Application Status Tracking:** Track Applied, Assessment, Interview, Selected, and Rejected statuses.
- **Analytics:** Visualize job search progress through charts and statistics.
- **CSV Export:** Export job application records.
- **Notifications:** View relevant application and interview updates.
- **Responsive UI:** Modern interface with responsive navigation and interactive components.

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- Axios

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT

### Database
- PostgreSQL (production)
- SQLite (local development fallback)

### Deployment & Tools
- Render
- Git
- GitHub
- VS Code

## 🏗️ Project Architecture

The application follows a frontend-backend architecture:

1. React frontend provides the user interface.
2. Axios sends HTTP requests to the Django REST API.
3. Django REST Framework processes requests and manages application data.
4. JWT handles authentication and protected API access.
5. PostgreSQL stores production data.
6. Render hosts the frontend and backend services.

## 📁 Project Structure

```text
JobTrackPro/
│
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── jobs/
│   ├── manage.py
│   ├── requirements.txt
│   └── Procfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/tk227/JobTrack-Pro.git
cd JobTrackPro
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the backend:

```bash
python manage.py runserver
```

Backend runs at:

`http://127.0.0.1:8000`

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts/register/` | Register a user |
| POST | `/api/accounts/token/` | Obtain JWT tokens |
| POST | `/api/accounts/token/refresh/` | Refresh access token |
| GET, POST | `/api/jobs/` | List and create applications |
| GET, PUT, PATCH, DELETE | `/api/jobs/<id>/` | Manage an application |
| GET, POST | `/api/jobs/interviews/` | List and create interviews |
| GET, PUT, PATCH, DELETE | `/api/jobs/interviews/<id>/` | Manage an interview |

Protected endpoints require authentication.

## 🌐 Deployment

The application is deployed using Render:

- React frontend deployed as a Static Site.
- Django backend deployed as a Web Service.
- PostgreSQL used for production database storage.
- GitHub repository connected for source control and deployment.

## 🔐 Security

- JWT-based authentication.
- Protected API endpoints.
- User-specific application data.
- Environment variables for deployment configuration.
- CORS configuration for frontend-backend communication.

## 👨‍💻 Developer

Developed as a full-stack project to solve the practical problem of organizing job applications and interview activities in one place.

**GitHub:** https://github.com/tk227/JobTrack-Pro

**Live Application:** https://jobtrack-pro-frontend.onrender.com