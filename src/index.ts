import { buildApp } from "./app.js";

const app = buildApp();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const host = "0.0.0.0";

const start = async () => {
  try {
    await app.listen({ port, host });
    console.log(`Wizard API Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
