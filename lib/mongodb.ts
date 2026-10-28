
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "gallery_of_arts";

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise =
  globalForMongo.mongoClientPromise ??
  new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClientPromise = clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}
