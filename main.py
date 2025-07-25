from pymongo import MongoClient
import re

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["FifaMyPlayer"]
collection = db["seasonawards"]

# Update documents
for doc in collection.find():
    # Skip if quantity already exists
    if "quantity" in doc:
        continue

    award = doc["award"]
    match = re.search(r"(\d+)[xX]", award)
    if match:
        quantity = int(match.group(1))
        new_award = re.sub(r"\d+[xX]\s*", "", award).strip()
    else:
        quantity = 1
        new_award = award

    # Apply update
    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"award": new_award, "quantity": quantity}}
    )
