import { execSync } from "node:child_process";

export default function setup() {
  execSync("npx prisma db push --skip-generate --force-reset --accept-data-loss", {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
