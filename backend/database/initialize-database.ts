import Sqlite3 from "sqlite3";
import { migrations } from "./migration.js";
import path from "path";
import { rootDirectoryPath } from "../server.js";
import fs from "fs";
import { Logger } from "../logger/logger.js";
import { bankStorage } from "../storage/bank-storage.js";
import { accountStorage } from "../storage/account-storage.js";

const logger: Logger = new Logger("DatabaseProvider");

class DatabaseProvider {
  database: Sqlite3.Database | undefined;

  initDatabase() {
    if (!fs.existsSync(path.resolve(rootDirectoryPath, "database-data")))
      fs.mkdirSync(path.resolve(rootDirectoryPath, "database-data"));
    this.database = new Sqlite3.Database(
      path.resolve(rootDirectoryPath, "database-data", "wallet.db"),
      Sqlite3.OPEN_READWRITE | Sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          console.error(err.message);
          return;
        }
        logger.info("SQLite Connection Established");
      },
    );
    this.database.on("open", () => {
      this.database?.serialize(() => {
        this.database?.run(
          `CREATE TABLE IF NOT EXISTS migration
           (
               id  TEXT PRIMARY KEY NOT NULL,
               sql TEXT             NOT NULL
           );`,
        );
        this.database?.all<{ id: string; sql: string }>(
          `SELECT id
           FROM migration`,
          (error, rows) => {
            let ids: string[] = [];
            if (rows.length) {
              for (const row of rows) {
                ids.push(row.id);
              }
            }
            this.runMigrations(ids);
            logger.debug("Migrations Successfully Applied");
          },
        );
        this.database?.get<number>(
          `SELECT COUNT(*) as count
           FROM bank`,
          (error, row) => {
            if (error) return;
            bankStorage.setCurrentRowIndex(row + 1);
          },
        );
        this.database?.get<number>(
          `SELECT COUNT(*) as count
           FROM accounts`,
          (error, row) => {
            if (error) return;
            accountStorage.setCurrentRowIndex(row + 1);
          },
        );
      });
    });
    this.database.on("error", (error: Error) => {
      logger.error(`Following Error while running Query ${error.message}`);
    });
  }

  runMigrations(ids: string[]) {
    if (!this.database) return;
    this.database.serialize(() => {
      Object.keys(migrations).forEach((key: string) => {
        if (ids.includes(key)) return;
        this.database?.run(migrations[key]);
        const statement = this.database?.prepare(
          `INSERT INTO migration(id, sql)
           VALUES (?, ?);`,
        );
        statement?.run(key, migrations[key]);
        logger.debug(`Migrations Successful for ${key}`);
      });
    });
  }

  closeDatabase() {
    this.database?.close((error) => {
      logger.info("SQLite Connection Closed");
    });
  }
}

export const sqlDatabaseProvider = new DatabaseProvider();
export const sqlDatabase = sqlDatabaseProvider.database;
