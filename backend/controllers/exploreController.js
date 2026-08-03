const exploreService = require("../services/exploreService");

class ExploreController {
  async getExploreData(req, res) {
    const result = await exploreService.getExploreData();
    return res.json(result);
  }
}

module.exports = new ExploreController();
