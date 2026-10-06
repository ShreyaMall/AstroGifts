const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://localhost:27017';
const REMOTE_URI = 'mongodb+srv://shreyamall989_db_user:gM4tpUVUJKb5yCFB@cluster0.vqechqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'astrogifts_clone';

async function migrate() {
    const localClient = new MongoClient(LOCAL_URI);
    const remoteClient = new MongoClient(REMOTE_URI);

    try {
        console.log('Connecting to databases...');
        await localClient.connect();
        await remoteClient.connect();

        const localDb = localClient.db(DB_NAME);
        const remoteDb = remoteClient.db(DB_NAME);

        const collections = await localDb.listCollections().toArray();

        for (const colInfo of collections) {
            const colName = colInfo.name;
            console.log(`Migrating collection: ${colName}`);
            
            const localCol = localDb.collection(colName);
            const remoteCol = remoteDb.collection(colName);
            
            const documents = await localCol.find({}).toArray();
            
            if (documents.length > 0) {
                // Clear remote collection first
                await remoteCol.deleteMany({});
                
                // Insert documents
                await remoteCol.insertMany(documents);
                console.log(`- Copied ${documents.length} documents.`);
            } else {
                console.log(`- Collection ${colName} is empty. Skipped.`);
            }
        }
        
        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await localClient.close();
        await remoteClient.close();
    }
}

migrate();
