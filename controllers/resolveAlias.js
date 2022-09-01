const { NotFoundError } = require("../modules/error");
const linksService = require("../services/links");

async function resolveAlias(request, response, next) {
  try {
    const { alias } = request.params;

    if (alias.length === 0 || /^[a-zA-Z0-9]+$/.test(alias) === false) {
      return next();
    }

    const aliasInfo = await linksService.getAliasInfo(alias);

    if (!aliasInfo) {
      throw new NotFoundError(`Alias "${alias}" was not found...`);
    }

    if (aliasInfo === 404) {
      response.status(404).send(aliasInfo);
    }
      response.send(aliasInfo);
  } catch (err) {
    next(err);
  }
}

module.exports = { resolveAlias };
