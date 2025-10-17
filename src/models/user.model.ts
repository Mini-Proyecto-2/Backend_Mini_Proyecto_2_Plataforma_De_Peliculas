
/**
 * @file userModel.js
 * @description Definition of the User schema and model in MongoDB using Mongoose.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Schema for the `User` collection.
 *
 * Represents a system user with personal information,
 * authentication credentials, and support for password recovery.
 *
 * @typedef {Object} User
 * @property {string} firstName - User's first name (required).
 * @property {string} lastName - User's last name (required).
 * @property {number} age - User's age (minimum 13 years).
 * @property {string} email - Unique and valid email address (required).
 * @property {string} password - Encrypted password, at least 8 characters,
 *                               including uppercase, lowercase, number, and symbol.
 * @property {string} [resetPasswordToken] - Temporary token for password recovery.
 * @property {Date} [resetPasswordExpires] - Expiration of the password recovery token.
 * @property {Date} createdAt - Automatic user creation date.
 */

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: [13, "La edad mínima permitida es 13 años"]
  },
  email: {
    type: String,
    required: true,
    unique: true, // no se permiten correos repetidos
    match: [/^\S+@\S+\.\S+$/, "El email no es válido"]
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
    validate: {
      validator: function (value: string) {
        // Debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 caracter especial
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
      },
      message:
        "La contraseña debe incluir al menos una letra mayúscula, una minúscula y un caracter especial"
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Optional middleware to encrypt the password before saving.
 *
 * ⚠️ Currently commented out. If enabled, it encrypts the password using bcrypt.
 */
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

/**
 * Mongoose model for the `User` collection.
 *
 * @type {mongoose.Model<User>}
 */

const User = mongoose.model('User', userSchema);

export default User; // Export the User model