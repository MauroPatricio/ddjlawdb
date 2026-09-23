import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('DB:', mongoose.connection.db.databaseName);
const db = mongoose.connection.db;

// Check 'information' (singular) collection
const infoSingCount = await db.collection('information').countDocuments();
const rago = await db.collection('information').findOne({ brand: 'RAGO' });
console.log('information collection count:', infoSingCount);
console.log('RAGO in information:', rago?._id, '| diuDate:', rago?.diuDate);

// Update RAGO directly in 'information' collection
const updateResult = await db.collection('information').updateOne(
  { brand: 'RAGO' },
  { $set: { diuDate: new Date('2031-07-10'), renewalDate: new Date('2035-01-01') } }
);
console.log('Update result:', updateResult.matchedCount, 'matched,', updateResult.modifiedCount, 'modified');

const ragoAfter = await db.collection('information').findOne({ brand: 'RAGO' });
console.log('RAGO diuDate after direct write:', ragoAfter?.diuDate);
console.log(ragoAfter?.diuDate ? '✅ DIRECT WRITE TO information WORKS' : '❌ FAILED');

await mongoose.disconnect();
