const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

class AuthService {
  async registerUser({ username, name, email, pwd, password }) {
    const userPassword = pwd || password;
    if (!username || !name || !email || !userPassword) {
      return { success: false, msg: "All fields are required" };
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, msg: "Email already exists" };
    }

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return { success: false, msg: "Username is already taken" };
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(userPassword, salt);

    await userModel.create({
      username,
      name,
      email: email.toLowerCase(),
      password: hash
    });

    return {
      success: true,
      msg: "User created successfully"
    };
  }

  async loginUser({ email, pwd, password }) {
    const userPassword = pwd || password;
    if (!email || !userPassword) {
      return { success: false, msg: "Email and password are required" };
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const isMatch = await bcrypt.compare(userPassword, user.password);
    if (!isMatch) {
      return { success: false, msg: "Invalid password" };
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      env.JWT_SECRET
    );

    return {
      success: true,
      msg: "User logged in successfully",
      token,
      userId: user._id,
      theme: user.theme || "dark"
    };
  }
}

module.exports = new AuthService();
