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
 *
 * @function signup
 * @async
 * @param {Request} req - Express request object.
 * @param {string} req.body.firstName - First name.
 * @param {string} req.body.lastName - Last name.
 * @param {number} req.body.age - Age.
 * @param {string} req.body.email - Email address.
 * @param {string} req.body.password - Plain (unencrypted) password.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Validates required fields.
 * - Enforces password complexity (≥ 8 chars, at least one uppercase, one lowercase and one special character).
 * - Responds with HTTP 201 and `{ userId }` on success.
 */

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    if (!firstName || !lastName || !age || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Validate password BEFORE hashing
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
 * Logs in a user and issues a JWT stored in an HTTP-only cookie.
 *
 * @function login
 * @async
 * @param {Request} req - Express request object.
 * @param {string} req.body.email - Email address.
 * @param {string} req.body.password - Password.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Requires `process.env.JWT_SECRET`.
 * - Locks the account for 15 minutes after 5 failed attempts (per email).
 * - Sets cookie `token` with `httpOnly`, and `secure/sameSite` based on `NODE_ENV`.
 * - Responds with HTTP 200 and `{ userId }` on success.
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
        loginAttempts[email].lockedUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    loginAttempts[email].count = 0; // Reset counter after a successful login

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use 'secure' only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust according to your needs (Lax, Strict, None)
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({ message: "Login exitoso", userId: user._id });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs out the user by clearing the authentication cookie.
 *
 * @function logout
 * @async
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Clears the `token` cookie using `httpOnly`, and `secure/sameSite` based on `NODE_ENV`.
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
 * Sends a password reset email with a one-time link.
 *
 * @function forgotPassword
 * @async
 * @param {Request} req - Express request object.
 * @param {string} req.body.email - User email address.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Requires `process.env.FRONTEND_URL` to build the reset link.
 * - Persists `resetPasswordToken` and `resetPasswordExpires` (1 hour).
 */


export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generate unique token
    const resetToken = cryptoModule.randomBytes(32).toString("hex");

    // Store in DB with expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Recovery URL
    const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Email content
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
 * Resets the user's password using a valid, non-expired token.
 *
 * @function resetPassword
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.token - Reset token.
 * @param {Object} req.body - Body payload.
 * @param {string} req.body.password - New password to set.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Hashes the new password and clears `resetPasswordToken` and `resetPasswordExpires`.
 */

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    console.log(token, password);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // valid and not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};

export async function changePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña actual incorrecta" });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        res.json({ message: "Contraseña cambiada exitosamente" });
    } catch (error) {
        next(error);
    }
}

/**
 * Retrieves the authenticated user's profile.
 *
 * @function getProfile
 * @async
 * @param {Request} req - Express request object (expects `req.user.userId` injected by auth middleware).
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Omits sensitive fields: `password`, `resetPasswordToken`, `resetPasswordExpires`.
 * - Responds with HTTP 404 if the user is not found, 401 if unauthenticated.
 */

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user.userId)
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
 *
 * @function updateProfile
 * @async
 * @param {Request} req - Express request object (expects `req.user.userId`).
 * @param {string} req.body.firstName - First name.
 * @param {string} req.body.lastName - Last name.
 * @param {number} req.body.age - Age.
 * @param {string} req.body.email - Email address.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Uses the ID from the JWT (not from the body) to update the user.
 * - Returns the updated user without sensitive fields.
 */

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, age, email } = req.body;

    // Validations
    if (!firstName || !lastName || !age || !email) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, // always use the id from the token, not from the body
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
 * Deletes the authenticated user's account after confirming the current password.
 *
 * @function deleteProfile
 * @async
 * @param {Request} req - Express request object (expects `req.user.userId`).
 * @param {string} req.body.password - Current password for confirmation.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Error handling middleware.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Verifies the provided password, deletes the user, and clears the `token` cookie.
 */


export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Debes confirmar tu contraseña para eliminar la cuenta" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Delete user
    await User.findByIdAndDelete(req.user.userId);

    res.clearCookie("token"); // end session
    res.json({ message: "Perfil eliminado y sesión cerrada" });
  } catch (error) {
    next(error);
  }
};

/**
 * Checks if a session is active by validating the JWT stored in cookies.
 *
 * @function session
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.cookies - Parsed cookies object.
 * @param {string} [req.cookies.token] - Session JWT.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Requires `process.env.JWT_SECRET`.
 * - Returns `{ loggedIn: true, user }` when valid, otherwise `{ loggedIn: false }` with HTTP 401.
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
