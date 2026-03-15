# Voyonata - Next-Generation AI Travel Intelligence

Welcome to **Voyonata**, the world's smartest and securely mathematical AI travel planner. Built to curate personalized itineraries, discover hidden gems, and book travel seamlessly—all secured by military-grade, zero-knowledge encryption.

> **Note:** The Login & Registration Page was developed by **R Aswin**.

---

## 🔐 The Authentication Fortress

Even without external Cloud firewalls, the application code itself is built like a fortress. The Login & Registration pages are utilizing some of the most mathematically secure features possible in modern software engineering.

### 1. Password Pre-Hashing (Eliminates In-Transit Theft)
*   **The Feature:** When a user types their password, it never leaves their computer in plaintext.
*   **How it works:** The instant they click "Sign In," the frontend uses the browser's built-in `WebCrypto API` to turn their password into a cryptographic SHA-256 hash. 
*   **Security Benefit:** Even if a hacker managed to intercept the Wi-Fi connection, they would only steal the *hash*, not the password itself. The server never receives the real password, meaning it can't accidentally log or leak it.

### 2. Argon2id Server Hashing (Eliminates Database Breaches)
*   **The Feature:** Once the pre-hashed password arrives at the server, it is hashed *again* before being saved to PostgreSQL.
*   **How it works:** It uses `Argon2id`—the winner of the international Password Hashing Competition. It is specifically designed to be highly resistant to brute-force attacks by graphics cards (GPUs).
*   **Security Benefit:** If a hacker were to somehow download your entire PostgreSQL database, they still wouldn't have the passwords. Because of Argon2id, it would take them thousands of years to mathematically guess even a single user's password from the hashes.

### 3. Passwordless FIDO2 Passkeys (Eliminates Phishing)
*   **The Feature:** Users can log in using their physical device's built-in biometrics (like Apple TouchID, Windows Hello Face Recognition, or a YubiKey).
*   **How it works:** This uses Public Key Cryptography. During registration, the user's phone/laptop generates a mathematical pair of keys. The "Private Key" is locked inside the phone's secure hardware chip and can never be extracted. Only the "Public Key" is sent to your database.
*   **Security Benefit:** Because the user never types a password, they can't be tricked into giving it away to a fake phishing website. Even if your database was completely hacked and all the Public Keys were stolen, the attackers still couldn't log in—they need the physical phone/laptop.

### 4. Device-Bound JSON Web Tokens (Eliminates Session Hijacking)
*   **The Feature:** When a user logs in, they are given a digital "ticket" (JWT) to keep them logged in. Your tickets are tied specifically to their computer.
*   **How it works:** When the JWT is created, the backend takes their IP address and their specific browser type (`User-Agent`) and creates a cryptographic fingerprint of it. This fingerprint is embedded directly into the token's digital signature.
*   **Security Benefit:** A common attack is stealing a user's session cookie to log in as them without needing their password. In Voyonata, if a hacker steals a token and tries to use it from a different location, the server will instantly reject the token because the hacker's IP address won't match the cryptographic fingerprint embedded in the stolen token.

### 5. Distributed Redis Rate Limiting (Eliminates Brute Forcing)
*   **The Feature:** A centralized memory system that tracks every single login attempt.
*   **How it works:** If someone tries to guess passwords rapidly, the Redis cache counts the attempts against that specific IP address.
*   **Security Benefit:** Once the threshold is hit (e.g., 5 failed attempts in a row), the API completely blocks that IP address from trying again, stopping automated credential-stuffing botnets dead in their tracks.

### 6. Visual Password Strength Meter (Improves UX & Security)
*   **The Feature:** An animated, real-time UI component on the Registration page.
*   **How it works:** As the user types their new password, the meter changes colors based on the complexity and entropy of their string.
*   **Security Benefit:** It trains the user to organically choose robust master passwords without frustrating them with annoying popup rules.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS & Framer Motion (Glassmorphism & animated dark-mode UI)
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Cache**: Redis
- **Authentication**: JWT, WebAuthn, Argon2

## 📦 Getting Started Locally

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Variables**:
Create a `.env` file at the root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/voyonata"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_highly_secure_random_string_here"
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
