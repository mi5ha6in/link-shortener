const fs = require("fs/promises");
const path = require("path");

const { dbPath } = require("../config");
const { BadRequestError } = require("../modules/error");
const { NotFoundError } = require("../modules/error");

const linksDevFilePath = path.resolve(dbPath, "./links.dev.json");
const linksProdFilePath = path.resolve(dbPath, "./links.prod.json");

const linksFilePath =
  process.env.NODE_ENV === "production" ? linksProdFilePath : linksDevFilePath;

const lastIdFilePath = path.resolve(dbPath, "./last.id.json");

async function getByAlias(alias) {
  const links = require(linksFilePath);

  return links[alias];
}

async function updateVisitedAliasInAliases(alias, aliases) {
  const visited = Number(aliases[alias].visited) + 1;
  aliases[alias].visited = visited;
  await fs.writeFile(linksFilePath, JSON.stringify(aliases, null, 2), "utf-8");
  return aliases[alias].visited;
}

async function getAliasInfo(alias) {
  const aliases = JSON.parse(await fs.readFile(linksFilePath, 'utf-8'));

  if (!aliases[alias]) {
    throw new NotFoundError(`Alias "${alias}" was not found...`);
  }

  if (aliases[alias].isOneTimeLink && aliases[alias].visited >=1) {
    await deleteAlias(alias);
    return 404;
  }

  if (aliases) {
    updateVisitedAliasInAliases(alias, aliases);
    return aliases[alias];
  }
}

async function resetVisited(alias) {
  const aliases = JSON.parse(await fs.readFile(linksFilePath, 'utf-8'));
  const aliasFromFile = aliases[alias]
  if (!aliasFromFile) {
    throw new NotFoundError(`Alias "${alias}" was not found...`);
  }

  aliasFromFile.visited = 0;

  await fs.writeFile(linksFilePath, JSON.stringify(aliases, null, 2), "utf-8");
  return aliasFromFile;
}

async function deleteAlias(alias) {
  const aliases = JSON.parse(await fs.readFile(linksFilePath, 'utf-8'));
  const aliasFromFile = aliases[alias]
  if (!aliasFromFile) {
    throw new NotFoundError(`Alias "${alias}" was not found...`);
  }

  delete aliases[alias];

  await fs.writeFile(linksFilePath, JSON.stringify(aliases, null, 2), "utf-8");
  return aliasFromFile;
}

async function addAlias(alias, link) {
  const links = require(linksFilePath);

  if (links[alias]) {
    throw new BadRequestError("alias-already-exist");
  }

  links[alias] = link;

  await fs.writeFile(linksFilePath, JSON.stringify(links, null, 2), "utf-8");

  return links[alias];
}

async function createAlias() {
  const lastIdFile = JSON.parse(await fs.readFile(lastIdFilePath, 'utf-8'));
  const alias = lastIdFile.lastId.toString(36);
  const newLastId = lastIdFile.lastId + 1;

  await fs.writeFile(
    lastIdFilePath,
    JSON.stringify({ lastId: newLastId }, null, 2),
    "utf-8"
  );

  return alias;
}

async function addLink(link, isOneTimeLink, ttl) {
  const aliases = JSON.parse(await fs.readFile(linksFilePath, 'utf-8'));;
  const alias = await createAlias();

  const aliasInfo = {
    [alias]: {
      alias: alias,
      link: link,
      visited: 0,
      isOneTimeLink: isOneTimeLink,
      ttl: ttl,
    },
  };

  const newAliases = {
    ...aliases,
    ...aliasInfo
  }

  await fs.writeFile(
    linksFilePath,
    JSON.stringify(newAliases, null, 2),
    "utf-8"
  );

  if (ttl) {
    const deleteAliasBind = deleteAlias.bind(this)
    setTimeout(deleteAliasBind, ttl, alias);
  }

  return aliasInfo[alias];

}

module.exports = {
  getByAlias,
  addAlias,
  getAliasInfo,
  addLink,
  resetVisited,
  deleteAlias,
};
