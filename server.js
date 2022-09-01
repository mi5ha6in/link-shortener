const express = require('express');
const { resolveAlias } = require('./controllers/resolveAlias');

const { addAlias } = require("./controllers/addAlias");
const { addLinks } = require("./controllers/addLinks");
const { resetVisited } = require("./controllers/resetVisited");
const { deleteAlias } = require("./controllers/deleteAlias");

const { notFound } = require("./middlewares/notFound");

const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.get('/:alias', resolveAlias);
app.post('/alias', addAlias);
app.post('/links', addLinks);
app.put('/:alias/reset', resetVisited);
app.delete('/:alias', deleteAlias);
app.use(notFound);
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
