const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Optional: fallback for SPA routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// Load env vars
dotenv.config();

// App setup
app.use(express.json());
app.use(cors()); // You can configure with origin: "https://your-frontend.com" if needed

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "mydatabase", // Optional
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ========== Schemas ==========
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  name: String,
  rating: String,
  nationality: String,
  position: String,
  value: Number,
});
const Player = mongoose.model("Player", PlayerSchema);

const SeasonData = mongoose.model(
  "SeasonData",
  new Schema({
    season: String,
    competition: String,
    apps: Number,
    goals: Number,
    assists: Number,
    avgrating: Number,
    team: String,
  })
);

const YearlyData = mongoose.model(
  "YearlyData",
  new Schema({
    year: String,
    goals: Number,
    assists: Number,
  })
);

const SeasonTrophy = mongoose.model(
  "SeasonTrophy",
  new Schema({
    season: String,
    competition: String,
  })
);

const IntData = mongoose.model(
  "IntData",
  new Schema({
    season: String,
    competition: String,
    apps: Number,
    goals: Number,
    assists: Number,
    avgrating: Number,
  })
);

const IntTrophy = mongoose.model(
  "IntTrophy",
  new Schema({
    season: String,
    competition: String,
  })
);

const SeasonAwards = mongoose.model(
  "SeasonAwards",
  new Schema({
    season: String,
    award: String,
    quantity: Number,
  })
);

const Transfer = mongoose.model(
  "Transfer",
  new Schema({
    season: String,
    from: String,
    to: String,
    value: String,
  })
);

// ========== CRUD Generator ==========
const router = express.Router();

function createCrudRoutes(model, routeName) {
  router.post(`/${routeName}`, async (req, res) => {
    try {
      const doc = new model(req.body);
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get(`/${routeName}`, async (req, res) => {
    try {
      const docs = await model.find();
      res.json(docs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get(`/${routeName}/:id`, async (req, res) => {
    try {
      const doc = await model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put(`/${routeName}/:id`, async (req, res) => {
    try {
      const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete(`/${routeName}/:id`, async (req, res) => {
    try {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Register routes (fixed: snake_case)
createCrudRoutes(Player, "players");
createCrudRoutes(SeasonData, "season_data");
createCrudRoutes(YearlyData, "yearly_data");
createCrudRoutes(SeasonTrophy, "season_trophies");
createCrudRoutes(IntData, "int_data");
createCrudRoutes(IntTrophy, "int_trophies");
createCrudRoutes(SeasonAwards, "season_awards");
createCrudRoutes(Transfer, "transfers");

app.use("/api", router);

// Port from environment (Render will provide one)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
