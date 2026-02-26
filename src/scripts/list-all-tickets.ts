import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kidiezyllex:KK38ly92ncUlJ7qI@bengo.5vjwy6h.mongodb.net/?appName=bengo';

async function listAllTickets() {
    try {
        await mongoose.connect(MONGO_URI);
        const tickets = await mongoose.connection.db.collection('supporttickets').find({}).toArray();
        console.log(JSON.stringify(tickets, null, 2));
    } catch (error) {
        console.error('Error listing tickets:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listAllTickets();
