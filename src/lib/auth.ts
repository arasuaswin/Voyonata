import { SignJWT, jwtVerify } from 'jose';

// Get the secret from environment variables
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: any, fingerprint?: string) {
  try {
    const finalPayload = fingerprint ? { ...payload, deviceFingerprint: fingerprint } : payload;

    const token = await new SignJWT(finalPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // High security short-lived token
      .sign(getJwtSecretKey());
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw new Error('Failed to sign token');
  }
}

export async function verifyToken(token: string, expectedFingerprint?: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    // Enforce Device Fingerprinting
    if (expectedFingerprint && payload.deviceFingerprint && payload.deviceFingerprint !== expectedFingerprint) {
      throw new Error('Device fingerprint mismatch: Token compromised.');
    }

    return payload;
  } catch (error) {
    return null;
  }
}
