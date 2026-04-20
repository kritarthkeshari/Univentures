# 🚀 UniVentures – A Collaborative Pitching Platform

> A platform where ideas meet the people who can build them.

UniVentures is a frontend-based web application designed to help **entrepreneurs, developers, designers, and investors** connect, collaborate, and grow startup ideas together.

---

## 🌟 Overview

Many students and early-stage founders have great ideas but lack:

- A team to build the product
- Access to investors
- Early feedback on their ideas

**UniVentures solves this by providing:**

✔ Idea showcasing platform  
✔ Team formation opportunities  
✔ Networking with like-minded people  
✔ Early-stage collaboration  

---

## 🎯 Problem Statement

- ❌ No proper platform for student startup collaboration  
- ❌ Difficulty in finding team members (devs/designers/marketers)  
- ❌ Limited access to early feedback  
- ❌ Lack of visibility for new ideas  

---

## 💡 Solution

A web platform where users can:

- 🚀 Upload startup ideas (pitch)
- 🔍 Explore other startup ideas
- 🤝 Connect with collaborators
- 📊 Manage ideas via dashboard

---

## 👥 User Roles

- 👨‍💼 Entrepreneur  
- 💰 Investor  
- 👨‍💻 Developer  
- 🎨 Designer  
- 📢 Marketer  

---

## 🔥 Features

### 1️⃣ Startup Pitch Creation
- Title
- Problem statement
- Solution
- Market details
- Team info
- Funding requirement
- Pitch video / PDF (UI placeholder)

### 2️⃣ Explore Startups
- Filter by domain:
  - AI
  - Fintech
  - Health
  - EdTech
  - E-commerce

### 3️⃣ Collaboration System
- Follow startups
- Send collaboration requests
- Save ideas

### 4️⃣ Dashboard
- My Ideas
- Requests
- Saved startups

### 5️⃣ Authentication UI (Frontend)
- Login / Signup pages

---

## 🛠️ Tech Stack

### Frontend
- HTML  
- CSS  
- JavaScript  
- React  

### Tools
- Figma (UI Design)  
- Git & GitHub (Version Control)  
- LocalStorage / Mock JSON (Data Simulation)

---

## 🧱 Project Structure


univentures/
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       └── icons/
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── StartupCard.jsx
│   │   ├── FilterBar.jsx
│   │   ├── SearchBar.jsx
│   │   └── Loader.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Explore.jsx
│   │   ├── CreatePitch.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useLocalStorage.js
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── data/
│   │   └── mockData.json
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   │
│   ├── utils/
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── index.js
│   └── reportWebVitals.js
│
├── .gitignore
├── package.json
├── README.md
└── package-lock.json

## ⚙️ How to Run the Project

```bash
# Clone the repository
git clone https://github.com/your-username/univentures.git

# Go into the project folder
cd univentures

# Install dependencies
npm install

# Run the app
npm start
