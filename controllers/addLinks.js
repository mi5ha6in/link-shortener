const linksService = require("../services/links");

async function addLinks(request, response, next) {
  try {
    const { link, isOneTimeLink, ttl } = request.body;

    const infoAboutAlias = await linksService.addLink(link, isOneTimeLink, ttl);
    return response.send(infoAboutAlias);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addLinks,
};
