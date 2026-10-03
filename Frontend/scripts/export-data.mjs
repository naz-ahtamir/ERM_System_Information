import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connection string dari MongoDB Atlas (username/password)
const uri = "mongodb+srv://nasaruddinahtamir_db_user:n8pM44td13Gxc7AI@cluster0.ohvv5bg.mongodb.net/qmb-ohs?retryWrites=true&w=majority&appName=Cluster0";

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
