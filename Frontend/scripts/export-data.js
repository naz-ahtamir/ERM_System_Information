const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Connection string dari MongoDB Atlas
const uri = "mongodb://ac-teemanr-shard-00-01.ohvv5bg.mongodb.net,ac-teemanr-shard-00-00.ohvv5bg.mongodb.net,ac-teemanr-shard-00-02.ohvv5bg.mongodb.net/?tls=true&authMechanism=MONGODB-X509&authSource=%24external&maxIdleTimeMS=45000&minPoolSize=0&replicaSet=atlas-lsh59r-shard-0&compressors=zlib&appName=Data+Explorer--6a267dcf27e85b5a7a04a20d";

async function exportCollection(collectionName, filename) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('qmb-ohs');
    const collection = db.collection(collectionName);
    
    // Find all documents
    const documents = await collection.find({}).toArray();
    
    // Save to JSON file
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf8');
    
    console.log(`✅ Exported ${collectionName}: ${documents.length} documents`);
    console.log(`   Saved to: ${filePath}`);
  } catch (err) {
    console.error(`❌ Error exporting ${collectionName}:`, err.message);
  } finally {
    await client.close();
  }
}

async function main() {
  console.log('Exporting data from MongoDB Atlas...\n');

  // Export collections
  await exportCollection('users', 'backup-users.json');
  await exportCollection('findings', 'backup-findings.json');

  console.log('\n✅ All exports complete!');
  console.log('Files saved in scripts/backup-*.json');
}

main();
