const { NotFoundError } = require("../modules/error");
const linksService = require("../services/links");

async function resetVisited(request, response, next) {
  try {
    const { alias } = request.params;
    console.log('alias:' + alias);

    if (alias.length === 0 || /^[a-zA-Z0-9]+$/.test(alias) === false) {
      return next();
    }

    const aliasInfo = await linksService.resetVisited(alias);

    if (!aliasInfo) {
      throw new NotFoundError(`Alias "${alias}" was not found...`);
    }

      response.send({status: 'ok'});
  } catch (err) {
    next(err);
  }
}

module.exports = { resetVisited };
