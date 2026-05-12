# Vialy — DePIN Navigation Network on Solana

Vialy is a DePIN (Decentralized Physical Infrastructure Network) MVP for navigation across roads in Ukraine with real-time road quality awareness.

The project is built as a **Solana dApp (React + Vite)** with wallet-based interaction and a decentralized user-driven road validation system.

---

## 🌐 Problem Statement

Traditional navigation systems:
- do not reflect real-time road quality
- lack decentralized validation of infrastructure data
- do not incentivize users to update or verify infrastructure conditions

---

## 🚀 Solution (DePIN Layer)

Vialy introduces a **decentralized infrastructure data collection and validation model**:

- users confirm road quality conditions
- data is signed via Solana wallet
- contributors are incentivized with rewards ($AUTO simulation)
- aggregated data is used for routing optimization

---

## 🧠 Core Features

### 🗺 Interactive Map Layer
- Real-time visualization of roads in Ukraine
- Road classification:
  - 🟢 Good (M roads)
  - 🟡 Medium (H roads)
  - 🔴 Poor (local roads)

---

### ⚡ Smart Routing Engine

Two routing modes:

- ⚡ **Fast Route**
  - optimized for shortest time
  - uniform edge weights

- 🛣️ **Comfort Route**
  - avoids low-quality roads
  - penalty system applied:
    - poor roads → x5 cost
    - medium roads → x2 cost
    - good roads → baseline

---

### 🔗 Solana Integration (DePIN Core)

- Wallet connection:
  - Phantom
  - Solflare
- Message signing for road validation
- Devnet-ready architecture
- Reward simulation system ($AUTO tokens)

---

### 🎮 Incentive System

- users validate road conditions
- +10 $AUTO for each confirmation
- encourages crowd-sourced infrastructure mapping

---

## 🛠 Tech Stack

- React 19 + Vite — frontend framework
- react-leaflet — geospatial visualization
- @turf/turf — routing and spatial analysis
- @solana/wallet-adapter — blockchain wallet integration
- Tailwind CSS — UI styling system

---

## 📦 Installation

```bash
npm install
npm run dev
````

Application runs at:

```
http://localhost:5173
```

---

## 🎮 User Flow

1. Open the application
2. Connect Solana wallet
3. Choose routing mode:

   * Fast
   * Comfort
4. Interact with roads on the map
5. View road metadata
6. Confirm road quality
7. Receive reward ($AUTO simulation)

---

## 🧭 Routing Algorithm

The routing engine is based on a **modified Dijkstra algorithm**:

* Fast mode → equal weights for all edges
* Comfort mode → weighted penalty system:

  * poor roads → x5 cost
  * medium roads → x2 cost
  * good roads → baseline

This enables adaptive routing based on infrastructure quality.

---

## 🗺 Data Model

Road data is stored in GeoJSON format:

* M (international roads) → high quality
* H (national roads) → medium quality
* local roads → low quality

---

## 🏗 Architecture

```
src/
├── components/
│   ├── Map.jsx
│   ├── Sidebar.jsx
│   └── WalletProvider.jsx
├── utils/
│   └── routing.js
├── App.jsx
├── main.jsx
└── index.css

public/
└── roads.geojson
```

---

## 🔥 DePIN Design Principles

* user-generated infrastructure data
* wallet-based identity layer
* incentivized validation mechanism
* decentralized data contribution model (MVP simulation)

---

## 🚧 Roadmap

* On-chain reward distribution (Solana program)
* Real GPS tracking integration
* Photo-based road verification system
* Real-time infrastructure updates
* Mobile-first PWA version
* Expansion to multi-region road networks

---

## 👥 Development Notes

This project was built iteratively during a hackathon sprint:

* Phase 1: routing engine + map visualization
* Phase 2: UI/UX and interaction layer
* Phase 3: Solana wallet integration
* Phase 4: DePIN incentive system design

---

## ⚠️ Disclaimer

This is an MVP prototype.
Token rewards and economic mechanisms are simulated and not deployed on mainnet.

---

## 📌 Repository Structure Note

For local development, the following repository was used:
- https://github.com/hodoor6/v2

However, the **primary repository for build, deployment, and submission purposes** is:
- https://github.com/nposeo/Vialy

The Vialy repository is considered the main source of truth because it contains the latest production-ready code, deployment configuration, and final integrated backend/frontend setup used for the live demo.
