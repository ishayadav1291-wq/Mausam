<div align="center">

# 🌤️ Mausam (मौसम)
### Intelligent, Persona-Driven Weather Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge&logo=vite)](https://github.com/ishayadav1291-wq/hkjdfnskjs)
[![Tests Status](https://img.shields.io/badge/Tests-40%2F40%20Passing-brightgreen?style=for-the-badge&logo=node.js)](https://github.com/ishayadav1291-wq/hkjdfnskjs)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express%20v4-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)

<br/>

**Mausam** transforms generic meteorological metrics into actionable, hyper-personalized daily guidance. Whether you are managing asthma triggers, scheduling marathon training, navigating coastal high tides, commuting through urban waterlogging, or scheduling agricultural pesticide spraying, Mausam contextualizes the weather for **who you are** and **what you do**.

[Explore Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Test Suite](#-automated-testing) • [API Docs](#-api-endpoints) • [Deployment](#-deployment)

</div>

---

## 🌟 Key Features

### 1. 🎯 8 Persona-Specific Intelligence Engines
Generic weather apps show numbers; Mausam provides contextual decisions:
- 🫁 **Health & Wellness**: Continuous real-time AQI tracking (PM2.5, PM10, NO₂, Ozone), respiratory impact alerts, hourly allergen/pollen forecast, and peak UV burn windows.
- 🏃 **Fitness & Athletics**: Algorithmic morning & evening optimal running windows based on ambient temperature, humidity strain, stamina index, and heat exhaustion risk.
- 🌊 **Coastal & Beach**: Tidal schedule (high/low tides), sea water temperature, swell height, rip current hazard analysis, and lifeguard flag safety status.
- 🚗 **Urban Commuter**: Live weather-traffic correlation, highway flash-flood hazard alerts, windshield visibility index, and smart departure time recommendations.
- 👨‍👩‍👧 **Parent & Family**: School bus drop-off and afternoon pick-up weather conditions, playground rain probability, and pediatric thermal comfort guidance.
- 🌾 **Agronomy & Farming**: ICAR-backed crop advisories, evapotranspiration indices, optimal pesticide spray timing, and soil moisture forecasts.
- ✈️ **Travel & Transit**: Destination turbulence risk, packing checklist generation based on destination weather, and delay probabilities.
- 🎪 **Events & Outdoor**: Microclimate stability indicators, outdoor banquet rain risk, and golden-hour photography windows.

### 2. 🤖 Gemini AI with Google Maps Grounding
- Natural language query interface powered by **Google Gemini 3.8 Flash**.
- Live Google Maps tool grounding connects real-time weather with physical venues (e.g., *"Where is a shaded park to jog right now in Bengaluru?"* returns concrete parks with direct Google Maps routes).
- In-memory response caching and automatic offline fallback guarantee instantaneous responses even under API rate limits.

### 3. 🌐 Native Multi-Language Localization
- Full native translation across four languages:
  - 🇬🇧 **English**
  - 🇮🇳 **हिन्दी (Hindi)**
  - 🇮🇳 **தமிழ் (Tamil)**
  - 🇮🇳 **বাংলা (Bengali)**
- Real-time instant switching without page reloads.

### 4. ⚡ Dual-Source Telemetry & Offline Resilience
- **Live Data**: Hybrid telemetry from Open-Meteo high-resolution APIs (hourly temperature, apparent heat index, wind, pressure) and atmospheric air quality stations.
- **Offline First**: Service Worker caching (`public/sw.js`) and client-side fallback ensure total usability without internet connectivity.

### 5. ☁️ Firebase Cloud Sync
- Cross-device profile synchronization, saved favorite locations (Home, Office, Gym, Travel), and user preference persistence via Google Firestore.

---

## 🏗️ Architecture

```
                       ┌─────────────────────────┐
                       │     Browser / Client    │
                       │  (React 19 + Tailwind)  │
                       └────────────┬────────────┘
                                    │
                        HTTP / JSON REST Requests
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   Node.js / Express     │
                       │     (server.ts)         │
                       └─────┬──────────────┬────┘
                             │              │
           ┌─────────────────┴──────┐       └──────────────────┐
           ▼                        ▼                          ▼
┌──────────────────────┐  ┌───────────────────┐  ┌───────────────────────┐
│ Google Gemini 3.8    │  │  Open-Meteo &     │  │  Firebase Firestore   │
│ (with Maps Grounding)│  │  Atmospheric APIs │  │  (Saved Places & Sync)│
└──────────────────────┘  └───────────────────┘  └───────────────────────┘
```

### Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Maps & Charts** | Leaflet, Recharts |
| **Backend** | Node.js, Express, tsx |
| **Artificial Intelligence** | `@google/genai` (Gemini 3.8 Flash + Google Maps Grounding) |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |
| **Build & Tooling** | Vite 8, Docker, ESLint, TypeScript Compiler |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher recommended)
- [npm](https://www.npmjs.com/) 

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ishayadav1291-wq/hkjdfnskjs.git
   cd hkjdfnskjs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="your-google-ai-studio-api-key"
   PORT=3000
   NODE_ENV="development"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

The project includes an end-to-end automated test suite verifying persona calculations, geolocation resolvers, translation dictionaries, and all backend API routes.

To run the test suite:
```bash
npm test
```

### Test Suite Coverage (40/40 Passing):
```
🧪 RUNNING MAUSAM TEST SUITE
--- 1. City Configuration & Geolocation ---
  ✅ PASS: Popular cities contains 12 cities
  ✅ PASS: Mumbai is identified as a coastal city
  ✅ PASS: Delhi is identified as non-coastal city

--- 2. Persona Data Generation ---
  ✅ PASS: Mumbai has sea condition & water temperature
  ✅ PASS: Mumbai has AQI metrics
  ✅ PASS: Delhi commuter visibility is calculated
  ✅ PASS: Delhi agriculture crop advisories generated
  ✅ PASS: Fitness activity ratings generated
  ✅ PASS: Parent school hour safety metrics present

--- 3. Multi-language Translation Dictionaries ---
  ✅ PASS: Translation dictionary exists for en / hi / ta / bn
  ✅ PASS: Health, Fitness & UI keys verified across all 4 locales

--- 4. Backend HTTP API Endpoints ---
  ✅ PASS: GET /api/health returned 200 with location payload
  ✅ PASS: GET /api/fitness returned 200 with location payload
  ✅ PASS: GET /api/beach returned 200 with location payload
  ✅ PASS: GET /api/traveller returned 200 with location payload
  ✅ PASS: GET /api/parent returned 200 with location payload
  ✅ PASS: GET /api/commuter returned 200 with location payload
  ✅ PASS: GET /api/agriculture returned 200 with location payload
  ✅ PASS: GET /api/events returned 200 with location payload

--- 5. POST /api/feed Aggregator ---
  ✅ PASS: Multi-persona composition & primary card tagging verified

--- 6. POST /api/gemini/maps-weather Grounding ---
  ✅ PASS: Natural language query grounding with Maps chunks verified

TOTAL RESULTS: 40 Passed, 0 Failed
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/feed` | Generates a combined, prioritized persona feed for a given city and list of active personas. |
| `GET` | `/api/health` | Real-time AQI, PM2.5, PM10, UV index, and respiratory health advisory. |
| `GET` | `/api/fitness` | Optimal morning/evening running windows, heat-strain alerts, and sport ratings. |
| `GET` | `/api/beach` | Tidal high/low timetable, water temperature, wave height, and lifeguard safety flags. |
| `GET` | `/api/commuter` | Visibility distance, traffic delay correlation, and highway flash-hazard alerts. |
| `GET` | `/api/parent` | School transit windows, playground safety index, and pediatric advisories. |
| `GET` | `/api/agriculture`| Sowing recommendations, evapotranspiration index, and spraying advisories. |
| `GET` | `/api/events` | Microclimate stability indicators, outdoor banquet rain probability. |
| `POST` | `/api/gemini/maps-weather` | Gemini 3.8 Flash AI weather assistant with Google Maps location grounding. |

---

## 🚢 Deployment

### Deploy with Docker
Build and run the container locally:
```bash
docker build -t mausam-weather .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" mausam-weather
```

### Deploy to Google Cloud Run
```bash
gcloud run deploy mausam-weather \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_key",NODE_ENV="production"
```

### Deploy to Render / Railway
1. Connect this GitHub repository.
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `npm start`
4. Add environment variable: `GEMINI_API_KEY`

---

## 📄 License
This project is open-source and licensed under the [Apache License 2.0](LICENSE).

<div align="center">
  <sub>Built with ❤️ for resilient, human-centered weather intelligence.</sub>
</div>
