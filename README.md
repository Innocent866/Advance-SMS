# Nigerian School SaaS Platform (MVP)

A comprehensive digital school management platform designed for Nigerian secondary schools (JSS & SSS).

## Features

- **Multi-Tenant Architecture**: Supports multiple schools on a single platform.
- **Role-Based Access**: Super Admin, School Admin, Teachers, Students.
- **Academic Management**: Manage Classes (JSS/SSS) and Subjects.
- **AI Teaching Assistant**: Generate WAEC/NECO aligned lesson plans instantly.
- **Video Learning & Quizzes**: Upload video lessons and assign quizzes to students.
- **Modern UI**: Built with React & Tailwind CSS.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Auth**: JWT, BCrypt

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or cloud URI)

### Installation

1. **Install Dependencies** (Root folder)
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Environment Setup**
   Check `server/.env` and ensure `MONGO_URI` is correct.

3. **Seed Database** (Optional but recommended for testing)
   ```bash
   cd server
   node seed.js
   ```
   **Default Logins:**
   - **Admin**: `admin@excelhigh.edu.ng` / `password123`
   - **Teacher**: `adebayo@excelhigh.edu.ng` / `password123`
   - **Student**: `chinedu@student.com` / `password123`

4. **Run Project**
   You need to run both client and server.

   **Terminal 1 (Server):**
   ```bash
   cd server
   npm run dev (or node server.js)
   ```

   **Terminal 2 (Client):**
   ```bash
   cd client
   npm run dev
   ```

   Access the app at `http://localhost:5173`.

## Folder Structure

- `/client`: React Frontend
- `/server`: Node.js Backend API
- `/docs`: Documentation (Artifacts)
