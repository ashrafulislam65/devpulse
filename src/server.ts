import app from "./app";
import { env } from "./config/env";
import initDB from "./config/initDB";

const startServer = async () => {
  await initDB();

  app.listen(env.port, () => {
    console.log(
      `Server running on port ${env.port}`
    );
  });
};

startServer();