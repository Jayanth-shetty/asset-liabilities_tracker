import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_key_change_in_production_12345";

export function createToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  return token;
}
