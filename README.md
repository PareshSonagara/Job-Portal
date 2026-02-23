# Professional Job Portal

A full-stack, professional-grade job portal featuring robust Google OAuth authentication and a clean, responsive UI.

## 🚀 Key Features
- **Google OAuth**: One-click login and signup, seamlessly integrated with Mongoose.
- **Professional Branding**: Custom logo and refined UI for a premium experience.
- **Role-Based Access**: Specialized dashboards for Candidates (Job Seekers) and Hiring Managers.

---

## 🛠️ GitHub Push Instructions

If you are seeing this locally and want to push the project to your own GitHub repository, follow these steps:

### 1. Create a Repository on GitHub
- Go to [github.com/new](https://github.com/new)
- Name your repository (e.g., `Job-Portal`)
- Keep it public or private as you prefer
- **Do not** initialize with a README (one is already here)

### 2. Connect and Push
Open your terminal in this directory and run:

```bash
# Add your GitHub repository as the remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Ensure you are on the main branch
git branch -M main

# Push the code
git push -u origin main
```

---

## ⚙️ Project Setup

### 1. Environment Variables
You must create `.env` files in both the `server` and `client` folders. Use the included `.env.example` files as templates.

**Server (`/server/.env`):**
```text
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

**Client (`/client/.env`):**
```text
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your_id
```

### 2. Installation & Running
In two separate terminals:

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

---


