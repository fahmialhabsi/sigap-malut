import sequelize from "../config/database.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const [[{ maxid }]] = await sequelize.query(
      "SELECT MAX(id) AS maxid FROM users",
    );
    let nextId = maxid && Number(maxid) ? Number(maxid) + 1 : 1;

    const [rows] = await sequelize.query(
      "SELECT rowid, username, email FROM users WHERE id IS NULL OR id = ''",
    );
    if (!rows || rows.length === 0) {
      console.log("No users with null id found.");
      process.exit(0);
    }

    console.log("Assigning ids starting at", nextId, "to", rows.length, "rows");
    for (const r of rows) {
      const rid = r.rowid;
      console.log(
        " -> setting id=",
        nextId,
        "for rowid=",
        rid,
        "username=",
        r.username,
      );
      await sequelize.query("UPDATE users SET id = :id WHERE rowid = :rid", {
        replacements: { id: nextId, rid },
      });
      nextId++;
    }

    console.log("Done assigning ids.");
    process.exit(0);
  } catch (err) {
    console.error("assignUserIds error:", err);
    process.exit(1);
  }
})();
