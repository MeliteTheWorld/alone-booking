import jwt from "jsonwebtoken";

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Сессия истекла, войдите снова" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Недостаточно прав доступа" });
    }

    return next();
  };
}
