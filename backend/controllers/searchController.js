const searchService = require("../services/searchService");

class SearchController {
  async search(req, res) {
    const currentUserId = req.user?.userId;
    const { query } = req.body;
    const result = await searchService.search(query, currentUserId);
    return res.json(result);
  }
}

module.exports = new SearchController();
