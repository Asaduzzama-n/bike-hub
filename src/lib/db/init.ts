import { MongoClient, Db } from "mongodb";
import bcrypt from "bcryptjs";
import { Collections } from "../models";


// Database config
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "bikehub";

// Collections

// Connect to MongoDB
export async function connectDB(): Promise<Db> {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log("✅ Connected to MongoDB");
  return client.db(DB_NAME);
}

// Create default admin if not exists
export async function createDefaultAdmin(db: Db) {
  const adminsCollection = db.collection(Collections.ADMINS);

  const existingAdmin = await adminsCollection.findOne({ email: process.env.ADMIN_EMAIL });
  if (existingAdmin) {
    console.log("⚡ Admin already exists:", existingAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS!, 12);
  const defaultAdmin = {
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    name: "System Administrator",
    role: "super_admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await adminsCollection.insertOne(defaultAdmin);
  console.log("✅ Default admin created: ");
}

// Run setup (commented out to prevent auto-execution)
// async function main() {
//   try {
//     const db = await connectDB();
//     await createDefaultAdmin(db);
//     console.log("🎉 Database setup completed");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error initializing database:", err);
//     process.exit(1);
//   }
// }

// main();
