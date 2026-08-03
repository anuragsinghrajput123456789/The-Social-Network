const authService = require("../services/authService");

class AuthController {
  async signup(req, res) {
    const result = await authService.registerUser(req.body);
    return res.json(result);
  }

  async login(req, res) {
    const result = await authService.loginUser(req.body);
    return res.json(result);
  }
}

module.exports = new AuthController();
