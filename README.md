# BedBox Hostel Management Platform (v2.1 Enterprise)

BedBox is a high-performance, full-stack hostel property management platform built on the MERN paradigm, configured with a native mobile wrapper via Capacitor for Android deployment.

## 📂 Repository Structure
- **/backend**: NodeJS + Express runtime gateway powered by MongoDB Atlas.
- **/frontend**: React 18 + Tailwind UI layer compiled for native mobile systems.

## 🌐 Live Infrastructure Configuration
- **Backend API Engine**: Hosted on Render cloud infrastructure.
- **Database Pipeline**: Synchronized directly with a live MongoDB Atlas cluster.
- **Mobile Client**: Capacitor Android Runtime target bundle (`app-debug.apk`).

## 🛠️ Tech Stack & Architecture
- **Frontend Core**: React, Vite, Tailwind CSS, Lucide React Icons
- **Native Wrapper**: Ionic Capacitor Core + Android Studio SDK Build Tools
- **Backend Infrastructure**: Node.js, Express, JSON Web Tokens (JWT), BcryptJS
- **Database**: MongoDB (Mongoose ODM)

## 🔐 Compliance & Security Parameters
- Full cryptographic password hashing utilizing salt rounds.
- Polymorphic account visibility layers strictly enforced (Warden Admin vs Resident Student).
- Isolation matrices map active session routing paths securely.

## 🚀 Local Installation & Execution Strategy

### 🟢 Backend Setup
1. Navigate to the server root environment: `cd backend`
2. Install dependencies: `npm install`
3. Configure your local runtime parameters in a `.env` environment layout file.
4. Launch the staging gateway: `npm start`

### 🔵 Frontend & Native Android Emulation
1. Navigate to the client environment interface: `cd frontend`
2. Install layout package scripts: `npm install`
3. Execute the local Vite HMR server pipeline: `npm run dev`
4. Sync compiled assets directly to native studio layers:
   ```bash
   npm run build
   npx cap sync android
