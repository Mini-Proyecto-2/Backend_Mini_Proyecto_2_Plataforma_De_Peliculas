/**
 * @file User controller.
 * @description Contains functions for user registration, login, logout, password recovery,
 * profile management, and session handling in the application.
 */


import User from "../models/user.model";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { Request, Response, NextFunction } from "express";

const cryptoModule = require("crypto");
const sendEmail = require("../utils/sendEmail");

let loginAttempts: { [key: string]: { count: number; lockedUntil: number | null } } = {};

/**
 * Registers a new user in the database.
 * @function signup
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - User data.
 * @param {string} req.body.firstName - First name.
 * @param {string} req.body.lastName - Last name.
 * @param {number} req.body.age - Age.
 * @param {string} req.body.email - Email address.
 * @param {string} req.body.password - Plain (unencrypted) password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error handling middleware.
 * @returns {JSON} Registration confirmation with `userId`.
 */


export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    if (!firstName || !lastName || !age || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Validación de la contraseña ANTES del hash
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula y un caracter especial",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          message: "Este correo electrónico ya se encuentra registrado",
        });
    }

    console.log("Password before hashing:", password);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
    });

    await user.save();

    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", userId: user._id });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs in a user and generates a JWT stored in a cookie.
 * @function login
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - User credentials.
 * @param {string} req.body.email - Email address.
 * @param {string} req.body.password - Password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error handling middleware.
 * @returns {JSON} Success message and `userId`.
 */


export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 0, lockedUntil: null };
    }

    if (
      loginAttempts[email].lockedUntil &&
      loginAttempts[email].lockedUntil > Date.now()
    ) {
      return res
        .status(423)
        .json({
          message:
            "Demasiados intentos fallidos. Intenta nuevamente más tarde.",
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      loginAttempts[email].count++;
      if (loginAttempts[email].count >= 5) {
        loginAttempts[email].lockedUntil = Date.now() + 15 * 60 * 1000; // Bloquea por 15 minutos
      }
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    loginAttempts[email].count = 0; // Resetea el contador después de bloquear

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Usa 'secure' solo en producción
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Ajusta según tus necesidades (Lax, Strict, None)
      maxAge: 2 * 60 * 60 * 1000, // 2 horas
    });

    res.status(200).json({ message: "Login exitoso", userId: user._id });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs out the user by clearing the authentication token cookie.
 * @function logout
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error handling middleware.
 * @returns {JSON} Logout confirmation.
 */


export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logout exitoso" });
  } catch (error) {
    next(error);
  }
};

/**
 * Sends an email with a link to reset the user's password.
 * @function forgotPassword
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request data.
 * @param {string} req.body.email - User's email address.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error handling middleware.
 * @returns {JSON} Confirmation of the email being sent.
 */


export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar token único
    const resetToken = cryptoModule.randomBytes(32).toString("hex");

    // Guardar en DB con expiración
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // URL de recuperación
    const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Contenido del correo
    const message = `
      <h2>Restablecer contraseña</h2>
      <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetURL}" target="_blank">${resetURL}</a>
      <p>Este enlace expirará en 1 hora.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Recupera tu contraseña - Film Unity",
      html: message,
    });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    next(error);
  }
};

/**
 * Resets the user's password using a valid token.
 * @function resetPassword
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.token - Reset token.
 * @param {Object} req.body - New password data.
 * @param {string} req.body.password - New password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error-handling middleware.
 * @returns {JSON} Confirmation of password update.
 */

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    console.log(token, password);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // válido y no expirado
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar usuario
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the authenticated user's profile.
 * @function getProfile
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user (from the token).
 * @param {string} req.user.userId - User ID.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error-handling middleware.
 * @returns {JSON} User information without sensitive data.
 */

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(req.body.user);
    const user = await User.findById(req.body.user.userId)
      .select("-password -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the authenticated user's profile.
 * @function updateProfile
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Data to update.
 * @param {string} req.body.firstName - First name.
 * @param {string} req.body.lastName - Last name.
 * @param {number} req.body.age - Age.
 * @param {string} req.body.email - Email address.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error-handling middleware.
 * @returns {JSON} Updated user.
 */

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, age, email } = req.body.user;

    // Validaciones
    if (!firstName || !lastName || !age || !email) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.body.user.userId, // ⚡ siempre usa el id del token, no del body
      { firstName, lastName, age, email },
      { new: true, runValidators: true, context: "query" }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado correctamente", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes the authenticated user's profile after password confirmation.
 * @function deleteProfile
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Confirmation data.
 * @param {string} req.body.password - User's current password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Error-handling middleware.
 * @returns {JSON} Confirmation of profile deletion and logout.
 */


export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { password } = req.body.user;

    if (!password) {
      return res.status(400).json({ message: "Debes confirmar tu contraseña para eliminar la cuenta" });
    }

    const user = await User.findById(req.body.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Eliminar usuario
    await User.findByIdAndDelete(req.body.user.userId);

    res.clearCookie("token"); // cerrar sesión
    res.json({ message: "Perfil eliminado y sesión cerrada" });
  } catch (error) {
    next(error);
  }
};

/**
 * Checks if there is an active session using the JWT.
 * @function session
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.cookies - Request cookies.
 * @param {string} [req.cookies.token] - Session JWT.
 * @param {Object} res - Express response object.
 * @returns {JSON} Session status (`loggedIn: true/false`) and user data if authenticated.
 */


export async function session(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
};
