const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log("📦 Collections found:", collectionNames);

    for (const name of collectionNames) {
      const count = await mongoose.connection.db
        .collection(name)
        .countDocuments();
      if (count > 0) {
        const docs = await mongoose.connection.db
          .collection(name)
          .find({})
          .limit(3)
          .toArray();
        console.log(`📂 ${name} (${count} docs):`, docs);
      }
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testConnection();
