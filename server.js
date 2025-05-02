const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PlayerSchema = new mongoose.Schema({
  name: String,
  rating: String,
  nationality: String,
  position: String,
  value: Number,
});

const Player = mongoose.model("Player", PlayerSchema);
const SeasonDataSchema = new mongoose.Schema({
  season: String,
  competition: String,
  apps: Number,
  goals: Number,
  assists: Number,
  avgrating: Number,
  team: String,
});

const SeasonData = mongoose.model("SeasonData", SeasonDataSchema);
const YearlyDataSchema = new mongoose.Schema({
  year: String,
  goals: Number,
  assists: Number,
});

const YearlyData = mongoose.model("YearlyData", YearlyDataSchema);
const SeasonTrophySchema = new mongoose.Schema({
  season: String,
  competition: String,
});
const SeasonTrophy = mongoose.model("SeasonTrophy", SeasonTrophySchema);
const IntDataSchema = new mongoose.Schema({
  season: String,
  competition: String,
  apps: Number,
  goals: Number,
  assists: Number,
  avgrating: Number,
});

const IntData = mongoose.model("IntData", IntDataSchema);
const IntTrophySchema = new mongoose.Schema({
  season: String,
  competition: String,
});
const IntTrophy = mongoose.model("IntTrophy", IntTrophySchema);

const SeasonAwardsSchema = new mongoose.Schema({
  season: String,
  award: String,
});
const SeasonAwards = mongoose.model("SeasonAwards", SeasonAwardsSchema);
const TransferSchema = new mongoose.Schema({
  season: String,
  from: String,
  to: String,
  value: String,
});
const Transfer = mongoose.model("Transfer", TransferSchema);
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
createCrudRoutes(Player, "players");
createCrudRoutes(SeasonData, "season-data");
createCrudRoutes(YearlyData, "yearly-data");
createCrudRoutes(SeasonTrophy, "season-trophies");
createCrudRoutes(IntData, "int-data");
createCrudRoutes(IntTrophy, "int-trophies");
createCrudRoutes(SeasonAwards, "season-awards");
createCrudRoutes(Transfer, "transfer");

app.use("/api", router);
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
