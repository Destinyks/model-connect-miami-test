const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- photographer, model, stylist
      description TEXT,
      image TEXT
    )
  `);
});

// Получить все профили
app.get("/api/profiles", (req, res) => {
  db.all("SELECT * FROM profiles", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Создать профиль
app.post("/api/profiles", (req, res) => {
  const { name, role, description, image } = req.body;
  db.run(
    "INSERT INTO profiles (name, role, description, image) VALUES (?, ?, ?, ?)",
    [name, role, description, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Обновить профиль
app.put("/api/profiles/:id", (req, res) => {
  const { id } = req.params;
  const { name, role, description, image } = req.body;
  db.run(
    "UPDATE profiles SET name=?, role=?, description=?, image=? WHERE id=?",
    [name, role, description, image, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Удалить профиль
app.delete("/api/profiles/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM profiles WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`✅ The server has started: http://localhost:${PORT}`);
});
