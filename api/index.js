// Vercel serverless entry: vercel.json rewrites /api/* here, and the Express app handles the original path.
import { createApp } from "../server/src/app.js";
import { storeFromEnv } from "../server/src/store.js";

const app = createApp({ store: await storeFromEnv(), adminToken: process.env.ADMIN_TOKEN, trustProxy: true });
export default app;
