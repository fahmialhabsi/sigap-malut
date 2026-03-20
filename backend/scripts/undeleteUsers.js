import dotenv from "dotenv";
import { sequelize } from "../config/database.js";
import User from "../models/User.js";

dotenv.config({ path: "./.env" });

async function undeleteAll() {
  console.log("Undeleting all soft-deleted users...");
  const [results] = await sequelize.query(
    `UPDATE users
     SET deleted_at = NULL,
         is_active = true,
         failed_login_attempts = 0,
         locked_until = NULL
     WHERE deleted_at IS NOT NULL
     RETURNING id, email;`,
  );
  console.log(`Undeleted ${results.length} user(s)`);
  results.forEach((r) => console.log(r));
}

async function undeleteEmails(emails) {
  console.log("Undeleting users for emails:", emails);
  for (const email of emails) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("  not found:", email);
      continue;
    }
    user.deleted_at = null;
    user.is_active = true;
    user.failed_login_attempts = 0;
    user.locked_until = null;
    await user.save();
    console.log("  undeleted:", email);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    const argv = process.argv.slice(2);
    // Usage: node undeleteUsers.js --all
    // Or:   node undeleteUsers.js --emails=foo@x.com,bar@y.com
    const all = argv.includes("--all");
    const emailsArg = argv.find((a) => a.startsWith("--emails="));
    if (all) {
      await undeleteAll();
    } else if (emailsArg) {
      const emails = emailsArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim());
      await undeleteEmails(emails);
    } else {
      console.log("No action. Use --all or --emails=comma,separated");
    }
  } catch (err) {
    console.error("Error:", err.message || err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

main();
