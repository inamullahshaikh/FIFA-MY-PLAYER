const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

// ✅ Connect to Atlas and Local MongoDB
const atlasConn = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: "FifaMyPlayer",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const localConn = mongoose.createConnection("mongodb://127.0.0.1:27017", {
  dbName: "FifaMyPlayer",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Schema Definitions
const schemas = {
  players: {
    name: String,
    rating: String,
    nationality: String,
    position: String,
    value: Number,
  },
  season_data: {
    season: String,
    competition: String,
    apps: Number,
    goals: Number,
    assists: Number,
    avgrating: Number,
    team: String,
  },
  yearly_data: {
    year: String,
    goals: Number,
    assists: Number,
  },
  season_trophies: {
    season: String,
    competition: String,
  },
  int_data: {
    season: String,
    competition: String,
    apps: Number,
    goals: Number,
    assists: Number,
    avgrating: Number,
  },
  int_trophies: {
    season: String,
    competition: String,
  },
  season_awards: {
    season: String,
    award: String,
    quantity: Number,
  },
  transfers: {
    season: String,
    from: String,
    to: String,
    value: String,
  },
};

// ✅ Model Registration (for Atlas and Local both)
const defineModel = (conn, name, schemaDef, collection) =>
  conn.model(name, new mongoose.Schema(schemaDef), collection);

const models = {};
for (const [name, schema] of Object.entries(schemas)) {
  models[name] = {
    atlas: defineModel(atlasConn, name, schema, name),
    local: defineModel(localConn, name, schema, name),
  };
}

// ✅ API Generator with full sync (POST, GET, PUT, DELETE)
const router = express.Router();

function createDualCrudRoutes(routeName, modelAtlas, modelLocal) {
  router.post(`/${routeName}`, async (req, res) => {
    try {
      const data = req.body;
      const docAtlas = new modelAtlas(data);
      const docLocal = new modelLocal(data);
      await Promise.all([docAtlas.save(), docLocal.save()]);
      res.status(201).json(docAtlas);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get(`/${routeName}`, async (req, res) => {
    try {
      const docs = await modelAtlas.find({});
      res.json(docs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get(`/${routeName}/:id`, async (req, res) => {
    try {
      const doc = await modelAtlas.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put(`/${routeName}/:id`, async (req, res) => {
    try {
      const data = req.body;
      const [updatedAtlas, updatedLocal] = await Promise.all([
        modelAtlas.findByIdAndUpdate(req.params.id, data, { new: true }),
        modelLocal.findByIdAndUpdate(req.params.id, data, { new: true }),
      ]);
      if (!updatedAtlas) return res.status(404).json({ error: "Not found" });
      res.json(updatedAtlas);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete(`/${routeName}/:id`, async (req, res) => {
    try {
      const [deletedAtlas, deletedLocal] = await Promise.all([
        modelAtlas.findByIdAndDelete(req.params.id),
        modelLocal.findByIdAndDelete(req.params.id),
      ]);
      if (!deletedAtlas) return res.status(404).json({ error: "Not found" });
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ✅ Register all CRUD routes
for (const [route, model] of Object.entries(models)) {
  createDualCrudRoutes(route, model.atlas, model.local);
}

app.use("/api", router);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
