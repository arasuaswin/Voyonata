# Voyonata - Next-Generation AI Travel Intelligence

Welcome to **Voyonata**, the world's smartest and securely mathematical AI travel planner. Built to curate personalized itineraries, discover hidden gems, and book travel seamlessly—all secured by military-grade, zero-knowledge encryption.

> **Note:** The Login & Registration Page was originally developed by **R Aswin**. The platform has since been expanded to a full-stack application with a complete dashboard, trip planning system, and user management.

---

## 🗺️ Core Features

### 1. Trip Planner & Itinerary Generator
- **Multi-step Planning:** Users can plan trips by specifying destination, exact dates, travel party size, budget (Budget/Moderate/Luxury), and specific interests (Culture, Food, Adventure, Nightlife, etc.).
- **Smart Itineraries:** Automatically generates a structured, day-by-day timeline with categorized activities, estimated times, and descriptions tailored to selected preferences.
- **Trip Management:** A dedicated "My Trips" dashboard to view all upcoming/past trips, including total trip counts, durations, and quick-delete functionality.

### 2. User Dashboard & Experience
- **Glassmorphic UI:** A stunning, modern interface utilizing deep blurs, animated backgrounds, and responsive sidebars powered by Tailwind CSS and Framer Motion.
- **Dark/Light Mode:** Full system-aware theme toggling with localized `localStorage` persistence to prevent hydration flashing.
- **Profile & Settings:** Secure portals for users to update their personal information, manage security settings, and even execute cascade account deletions.

---

## 🔐 The Authentication Fortress

Even without external Cloud firewalls, the application code itself is built like a fortress. The security layer utilizes some of the most mathematically secure features possible in modern software engineering.

### 1. Password Pre-Hashing (Eliminates In-Transit Theft)
When a user types their password, it never leaves their computer in plaintext. The frontend uses the browser's built-in `WebCrypto API` to turn their password into a cryptographic SHA-256 hash before transmission.

### 2. Argon2id Server Hashing (Eliminates Database Breaches)
Once the pre-hashed password arrives at the server, it is hashed *again* using `Argon2id`—the winner of the international Password Hashing Competition, designed to be highly resistant to GPU brute-force attacks.

### 3. Passwordless FIDO2 Passkeys (Eliminates Phishing)
Users can log in using their physical device's built-in biometrics (Apple TouchID, Windows Hello, YubiKey). This uses Public Key Cryptography—the private key never leaves the device's secure hardware enclave.

### 4. Device-Bound JSON Web Tokens (Eliminates Session Hijacking)
JWTs are verified via Next.js 16 Middleware (Proxy) to protect all `/dashboard` routes. The tokens are HTTP-only and cryptographically secure.

### 5. Distributed Redis Rate Limiting (Eliminates Brute Forcing)
A centralized memory system (or local memory fallback during build/dev) tracks every single login attempt, stopping automated credential-stuffing botnets dead in their tracks.

---

## 🛠 Tech Stack
- **Framework**: Next.js 16.1 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 & Framer Motion (Glassmorphism & animated dark-mode UI)
- **Database**: PostgreSQL (managed via Prisma ORM 5.21)
- **Cache**: Redis (via ioredis)
- **Authentication**: JWT (jose), WebAuthn (SimpleWebAuthn), Argon2

## 📦 Getting Started Locally

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Variables**:
Create a `.env` file at the root:
```env
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/voyonata"

# Redis URL for rate limiting (comment out to use in-memory fallback)
# REDIS_URL="redis://localhost:6379"

# JWT Secret Key for securely signing tokens
JWT_SECRET="your_highly_secure_random_string_here"

# Public URL for WebAuthn rpID and origin configuration
NEXT_PUBLIC_URL="http://localhost:3000"
```

3. **Database Migration**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run the Development Server**:
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the AI travel planner and try out the ultimate-security login portal.
