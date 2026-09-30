import "dotenv/config";
import { initializeGymStoreFromDatabase } from "./gymSqlPersistence";

initializeGymStoreFromDatabase()
  .then(enabled => console.log(enabled ? "GymFlow MariaDB data is ready" : "DATABASE_URL is missing; MariaDB import was skipped"))
  .catch(error => { console.error("GymFlow database initialization failed", error); process.exitCode = 1; });
