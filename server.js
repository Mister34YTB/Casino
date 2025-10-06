import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_FILE = "casino_data.json";

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return {};
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// --- API joueurs ---

app.get("/api/solde/:discordId", (req, res) => {
  const data = loadData();
  const id = req.params.discordId;
  const player = data[id] || { balance: 0 };
  res.json(player);
});

app.post("/api/update_balance/:discordId", (req, res) => {
  const id = req.params.discordId;
  const { amount } = req.body;
  if (typeof amount !== "number") return res.status(400).json({ error: "Montant invalide" });

  const data = loadData();
  if (!data[id]) data[id] = { balance: 0 };
  data[id].balance += amount;
  saveData(data);

  res.json({ success: true, new_balance: data[id].balance });
});

// --- Serve les pages HTML ---
app.get("/", (req, res) => res.sendFile("public/joueur.html", { root: "." }));
app.get("/admin", (req, res) => res.sendFile("public/admin.html", { root: "." }));

// --- Lancement ---
app.listen(PORT, () => console.log(`🎰 Serveur lancé sur http://localhost:${PORT}`));
