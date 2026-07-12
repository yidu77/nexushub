<div align="center">

# ⚡ NexusHub

### **The Ultimate Team Management Platform**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Connect. Collaborate. Create.** 🌟

[Live Demo](https://nexushub-bay.vercel.app) · [Report Bug](https://github.com/yidu77/nexushub/issues) · [Request Feature](https://github.com/yidu77/nexushub/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**NexusHub** is a modern, full-stack team management platform designed to streamline organizational workflows. Built with the PERN stack (PostgreSQL, Express, React, Node.js), it provides a seamless experience for managing team members, work requests, resources, and real-time notifications.

Whether you're a small startup or a growing enterprise, NexusHub adapts to your needs with role-based access control, powerful search capabilities, and an intuitive dark-mode interface.

🔗 **Live app:** [nexushub-bay.vercel.app](https://nexushub-bay.vercel.app)
🔗 **Live API:** [nexushub-backend-985p.onrender.com](https://nexushub-backend-985p.onrender.com)

> ⚠️ Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after some idle time may take 30–50 seconds to respond while it wakes up.

### 🎓 Academic Project
This project was developed as a capstone project at **Adama Science and Technology University**, showcasing enterprise-grade software development practices.

---

## ✨ Features

### 🔐 Authentication & Security
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, Manager, Staff, Viewer)
- ✅ Protected routes and API endpoints

### 👥 Team Management
- ✅ Add, edit, and delete team members
- ✅ Automatic user account creation
- ✅ Department-based filtering
- ✅ Status tracking (Active/Inactive)

### 📝 Work Requests
- ✅ Create and track work requests
- ✅ Priority levels (Low, Medium, High)
- ✅ Status management (Pending, In Progress, Completed)
- ✅ Staff members see only their own requests

### 📦 Resource Management
- ✅ Track company resources with unique codes
- ✅ Categorize resources (IT, Electronics, Furniture, Vehicles)
- ✅ Monitor resource status (Available, In Use, Maintenance)

### 🔔 Real-Time Notifications
- ✅ Instant notifications for important events
- ✅ Unread count badge
- ✅ Mark all as read functionality
- ✅ Auto-refresh every 10 seconds

### 🔍 Global Search
- ✅ Search across members, requests, and resources
- ✅ Instant results with highlighting
- ✅ Keyboard shortcut (Enter to search)

### 📊 Statistics & Analytics
- ✅ Interactive charts and graphs
- ✅ Real-time data visualization
- ✅ Department-wise breakdowns

### 🎨 User Experience
- ✅ Beautiful dark/light mode toggle
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ SweetAlert2 confirmation dialogs
- ✅ Toast notifications for actions
- ✅ Modern glassmorphism login page
- ✅ Smooth animations and transitions

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **SweetAlert2** - Beautiful alerts
- **React Hot Toast** - Notifications
- **Chart.js** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

### DevOps
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **Git & GitHub** - Version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yidu77/nexushub.git
cd nexushub
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up the database**
```bash
# Create PostgreSQL database
createdb nexushub

# The tables will be created automatically on first run
```

5. **Configure environment variables**
See [Environment Variables](#-environment-variables) section below.

6. **Start the development servers**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. **Open your browser**
Navigate to `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/nexushub

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000
```

### Frontend (`frontend/.env`)
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

> In production, `VITE_API_URL` is set in the Vercel project's Environment Variables to point at the live Render backend instead of localhost.

---

## 📡 API Documentation

Base URL (production): `https://nexushub-backend-985p.onrender.com`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/profile/password` | Change password |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members |
| POST | `/api/members` | Create member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |

### Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | Get all requests |
| POST | `/api/requests` | Create request |
| PUT | `/api/requests/:id` | Update request |
| DELETE | `/api/requests/:id` | Delete request |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get all resources |
| POST | `/api/resources` | Create resource |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Global Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search members, requests, and resources |

---

## 🌐 Deployment

### Frontend (Vercel) — Live
- **URL:** [nexushub-bay.vercel.app](https://nexushub-bay.vercel.app)
- Root directory: `frontend`
- Environment variable `VITE_API_URL` set to the live Render backend URL

### Backend (Render) — Live
- **URL:** [nexushub-backend-985p.onrender.com](https://nexushub-backend-985p.onrender.com)
- Root directory: `backend`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`
- Database: PostgreSQL (hosted on Neon)

**To redeploy from scratch:**
1. Push code to GitHub
2. **Frontend:** Import repo on [vercel.com](https://vercel.com), set root directory to `frontend`, add `VITE_API_URL`, deploy
3. **Backend:** Create a new Web Service on [render.com](https://render.com), set root directory to `backend`, add environment variables, deploy

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

### **Yididiya Solomon**
- 🎓 Software Engineering Student, Adama Science and Technology University
- 💻 Full-Stack Developer
- 📧 [yididiyasolomon1@gmail.com](mailto:yididiyasolomon1@gmail.com)
- 🐙 [GitHub: @yidu77](https://github.com/yidu77)

---

## 🙏 Acknowledgments

- [React Documentation](https://reactjs.org/)
- [Node.js Documentation](https://nodejs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Adama Science and Technology University](https://www.astu.edu.et/)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🌟 Show your support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Built by Yididiya Solomon**

[⬆ Back to Top](#-nexushub)

</div>
