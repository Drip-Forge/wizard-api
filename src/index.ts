import { buildApp } from "./app.js";
import { getHost, getPort } from "./config.js";

const app = buildApp();
const port = getPort();
const host = getHost();

const start = async () => {
  try {
    await app.listen({ port, host });
    app.log.info(`Wizard API listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
