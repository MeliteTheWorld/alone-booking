import { Router } from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const router = Router();
const VALID_AVATAR_KEYS = [
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4"
];

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_key: user.avatar_key || null,
    role: user.role
  };
}

function buildToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Имя, email и пароль обязательны" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Пароль должен содержать минимум 6 символов" });
    }

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase()
    ]);

    if (existingUser.rowCount) {
      return res.status(409).json({ message: "Пользователь уже существует" });
    }

    const result = await query(
      `
        INSERT INTO users (name, email, password_hash, avatar_key, role)
        VALUES ($1, $2, $3, $4, 'client')
        RETURNING id, name, email, avatar_key, role
      `,
      [name, email.toLowerCase(), hashPassword(password), null]
    );

    const user = result.rows[0];

    return res.status(201).json({
      token: buildToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось зарегистрироваться" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Введите email и пароль" });
    }

    const result = await query(
      `
        SELECT id, name, email, password_hash, role
             , avatar_key
        FROM users
        WHERE email = $1
      `,
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const safeUser = sanitizeUser(user);

    return res.json({
      token: buildToken(safeUser),
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось войти в систему" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        SELECT id, name, email, role, created_at
             , avatar_key
        FROM users
        WHERE id = $1
      `,
      [req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось загрузить профиль" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, email, current_password, new_password, avatar_key } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Имя и email обязательны" });
    }

    const currentUserResult = await query(
      `
        SELECT id, name, email, password_hash, role
             , avatar_key
        FROM users
        WHERE id = $1
      `,
      [req.user.id]
    );

    const currentUser = currentUserResult.rows[0];

    if (!currentUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedAvatarKey =
      avatar_key === undefined || avatar_key === null || avatar_key === ""
        ? null
        : String(avatar_key).trim();

    if (
      normalizedAvatarKey &&
      !VALID_AVATAR_KEYS.includes(normalizedAvatarKey)
    ) {
      return res.status(400).json({ message: "Выбрана некорректная аватарка" });
    }

    const duplicateUser = await query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [normalizedEmail, req.user.id]
    );

    if (duplicateUser.rowCount) {
      return res.status(409).json({ message: "Этот email уже занят" });
    }

    let nextPasswordHash = currentUser.password_hash;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          message: "Введите текущий пароль, чтобы задать новый"
        });
      }

      if (!verifyPassword(current_password, currentUser.password_hash)) {
        return res.status(401).json({ message: "Текущий пароль указан неверно" });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          message: "Новый пароль должен содержать минимум 6 символов"
        });
      }

      nextPasswordHash = hashPassword(new_password);
    }

    const result = await query(
      `
        UPDATE users
        SET name = $1,
            email = $2,
            password_hash = $3,
            avatar_key = $4
        WHERE id = $5
        RETURNING id, name, email, avatar_key, role, created_at
      `,
      [
        name.trim(),
        normalizedEmail,
        nextPasswordHash,
        normalizedAvatarKey,
        req.user.id
      ]
    );

    const updatedUser = sanitizeUser(result.rows[0]);

    return res.json({
      token: buildToken(updatedUser),
      user: {
        ...updatedUser,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось обновить профиль" });
  }
});

export default router;
