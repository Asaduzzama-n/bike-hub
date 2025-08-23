// import { MongoClient, Db } from 'mongodb';
// import { Collections, DatabaseIndexes } from '../models/admin';
// import bcrypt from 'bcryptjs';

// // Database initialization script
// export async function initializeDatabase(db: Db) {
//   try {
//     console.log('Initializing database...');

//     // Create collections if they don't exist
//     const existingCollections = await db.listCollections().toArray();
//     const existingCollectionNames = existingCollections.map(col => col.name);

//     for (const collectionName of Object.values(Collections)) {
//       if (!existingCollectionNames.includes(collectionName)) {
//         await db.createCollection(collectionName);
//         console.log(`Created collection: ${collectionName}`);
//       }
//     }

//     // Create indexes
//     await createIndexes(db);

//     // Seed initial data
//     await seedInitialData(db);

//     console.log('Database initialization completed successfully!');
//   } catch (error) {
//     console.error('Error initializing database:', error);
//     throw error;
//   }
// }

// // Create database indexes
// async function createIndexes(db: Db) {
//   console.log('Creating database indexes...');

//   for (const [collectionName, indexes] of Object.entries(DatabaseIndexes)) {
//     const collection = db.collection(collectionName);
    
//     for (const index of indexes) {
//       try {
//         await collection.createIndex(index);
//         console.log(`Created index on ${collectionName}:`, index);
//       } catch (error) {
//         // Index might already exist, continue
//         console.log(`Index already exists on ${collectionName}:`, index);
//       }
//     }
//   }
// }

// // Seed initial data
// async function seedInitialData(db: Db) {
//   console.log('Seeding initial data...');

//   // Create default admin user
//   await createDefaultAdmin(db);
  
//   // Create system settings
//   await createSystemSettings(db);
  
//   // Create sample data for development
//   if (process.env.NODE_ENV === 'development') {
//     await createSampleData(db);
//   }
// }

// // Create default admin user
// async function createDefaultAdmin(db: Db) {
//   const adminsCollection = db.collection(Collections.ADMINS);
  
//   const existingAdmin = await adminsCollection.findOne({ email: 'admin@bikehub.com' });
  
//   if (!existingAdmin) {
//     const hashedPassword = await bcrypt.hash('admin123', 12);
    
//     const defaultAdmin = {
//       email: 'admin@bikehub.com',
//       password: hashedPassword,
//       name: 'System Administrator',
//       role: 'super_admin' as const,
//       permissions: [
//         'bikes.create',
//         'bikes.read',
//         'bikes.update',
//         'bikes.delete',
//         'finance.read',
//         'finance.write',
//         'partners.read',
//         'partners.write',
//         'documents.verify',
//         'users.manage',
//         'system.settings'
//       ],
//       isActive: true,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
    
//     await adminsCollection.insertOne(defaultAdmin);
//     console.log('Created default admin user: admin@bikehub.com / admin123');
//   }
// }

// // Create system settings
// async function createSystemSettings(db: Db) {
//   const settingsCollection = db.collection(Collections.SYSTEM_SETTINGS);
  
//   const defaultSettings = [
//     {
//       key: 'site_name',
//       value: 'BikeHub Admin',
//       description: 'Name of the application',
//       category: 'general',
//       isPublic: true
//     },
//     {
//       key: 'default_profit_margin',
//       value: 15,
//       description: 'Default profit margin percentage for bikes',
//       category: 'finance',
//       isPublic: false
//     },
//     {
//       key: 'max_trailing_days',
//       value: 30,
//       description: 'Maximum days before a bike is considered trailing',
//       category: 'general',
//       isPublic: false
//     },
//     {
//       key: 'notification_email',
//       value: 'notifications@bikehub.com',
//       description: 'Email address for system notifications',
//       category: 'notifications',
//       isPublic: false
//     },
//     {
//       key: 'brta_api_enabled',
//       value: true,
//       description: 'Enable BRTA API integration',
//       category: 'integrations',
//       isPublic: false
//     },
//     {
//       key: 'document_auto_verify',
//       value: false,
//       description: 'Enable automatic document verification',
//       category: 'security',
//       isPublic: false
//     },
//     {
//       key: 'partner_min_investment',
//       value: 50000,
//       description: 'Minimum investment amount for partners (BDT)',
//       category: 'finance',
//       isPublic: false
//     },
//     {
//       key: 'session_timeout',
//       value: 3600,
//       description: 'Admin session timeout in seconds',
//       category: 'security',
//       isPublic: false
//     }
//   ];
  
//   for (const setting of defaultSettings) {
//     const existing = await settingsCollection.findOne({ key: setting.key });
//     if (!existing) {
//       await settingsCollection.insertOne({
//         ...setting,
//         lastModifiedBy: null,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       });
//     }
//   }
  
//   console.log('Created system settings');
// }

// // Create sample data for development
// async function createSampleData(db: Db) {
//   console.log('Creating sample data for development...');
  
//   // Sample bikes
//   await createSampleBikes(db);
  
//   // Sample partners
//   await createSamplePartners(db);
  
//   // Sample transactions
//   await createSampleTransactions(db);
  
//   // Sample documents
//   await createSampleDocuments(db);
// }

// // Create sample bikes
// async function createSampleBikes(db: Db) {
//   const bikesCollection = db.collection(Collections.BIKES);
  
//   const existingBikes = await bikesCollection.countDocuments();
//   if (existingBikes > 0) return;
  
//   const sampleBikes = [
//     {
//       brand: 'Honda',
//       model: 'CB Shine',
//       year: 2020,
//       cc: 125,
//       mileage: 15000,
//       buyPrice: 85000,
//       sellPrice: 95000,
//       profit: 10000,
//       description: 'Well maintained Honda CB Shine in excellent condition',
//       images: ['/images/bikes/honda-cb-shine-1.jpg'],
//       status: 'available',
//       condition: 'excellent',
//       freeWash: true,
//       repairs: [],
//       partnerInvestments: [],
//       listedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
//       createdAt: new Date(),
//       updatedAt: new Date()
//     },
//     {
//       brand: 'Yamaha',
//       model: 'FZ-S',
//       year: 2019,
//       cc: 150,
//       mileage: 22000,
//       buyPrice: 120000,
//       sellPrice: 135000,
//       profit: 15000,
//       description: 'Sporty Yamaha FZ-S with good performance',
//       images: ['/images/bikes/yamaha-fz-s-1.jpg'],
//       status: 'sold',
//       condition: 'good',
//       freeWash: true,
//       repairs: [
//         {
//           description: 'Engine oil change',
//           cost: 1500,
//           date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
//         }
//       ],
//       partnerInvestments: [],
//       listedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
//       soldDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
//       buyerInfo: {
//         name: 'Ahmed Rahman',
//         phone: '+8801712345678',
//         email: 'ahmed@example.com',
//         nid: '1234567890123'
//       },
//       createdAt: new Date(),
//       updatedAt: new Date()
//     },
//     {
//       brand: 'Bajaj',
//       model: 'Pulsar 150',
//       year: 2018,
//       cc: 150,
//       mileage: 35000,
//       buyPrice: 95000,
//       sellPrice: 110000,
//       profit: 15000,
//       description: 'Popular Bajaj Pulsar 150 with high mileage',
//       images: ['/images/bikes/bajaj-pulsar-150-1.jpg'],
//       status: 'available',
//       condition: 'good',
//       freeWash: false,
//       repairs: [],
//       partnerInvestments: [],
//       listedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago (trailing)
//       createdAt: new Date(),
//       updatedAt: new Date()
//     }
//   ];
  
//   await bikesCollection.insertMany(sampleBikes);
//   console.log('Created sample bikes');
// }

// // Create sample partners
// async function createSamplePartners(db: Db) {
//   const partnersCollection = db.collection(Collections.PARTNERS);
  
//   const existingPartners = await partnersCollection.countDocuments();
//   if (existingPartners > 0) return;
  
//   const samplePartners = [
//     {
//       name: 'Karim Ahmed',
//       email: 'karim@example.com',
//       phone: '+8801712345678',
//       nid: '1234567890123',
//       address: 'Dhanmondi, Dhaka',
//       totalInvestment: 200000,
//       totalReturns: 25000,
//       activeInvestments: 1,
//       pendingPayout: 5000,
//       roi: 12.5,
//       joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
//       status: 'active',
//       bankDetails: {
//         accountName: 'Karim Ahmed',
//         accountNumber: '1234567890',
//         bankName: 'Dutch Bangla Bank',
//         branchName: 'Dhanmondi Branch',
//         routingNumber: '090260323'
//       },
//       investments: [],
//       payouts: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     },
//     {
//       name: 'Fatima Begum',
//       email: 'fatima@example.com',
//       phone: '+8801812345678',
//       nid: '9876543210987',
//       address: 'Gulshan, Dhaka',
//       totalInvestment: 150000,
//       totalReturns: 18000,
//       activeInvestments: 2,
//       pendingPayout: 3000,
//       roi: 12.0,
//       joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
//       status: 'active',
//       bankDetails: {
//         accountName: 'Fatima Begum',
//         accountNumber: '9876543210',
//         bankName: 'BRAC Bank',
//         branchName: 'Gulshan Branch',
//         routingNumber: '060270101'
//       },
//       investments: [],
//       payouts: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     }
//   ];
  
//   await partnersCollection.insertMany(samplePartners);
//   console.log('Created sample partners');
// }

// // Create sample transactions
// async function createSampleTransactions(db: Db) {
//   const transactionsCollection = db.collection(Collections.TRANSACTIONS);
  
//   const existingTransactions = await transactionsCollection.countDocuments();
//   if (existingTransactions > 0) return;
  
//   const sampleTransactions = [
//     {
//       type: 'sale',
//       amount: 135000,
//       profit: 15000,
//       bikeName: 'Yamaha FZ-S 2019',
//       description: 'Sale of Yamaha FZ-S to Ahmed Rahman',
//       paymentMethod: 'bank_transfer',
//       reference: 'TXN001',
//       status: 'completed',
//       createdBy: null,
//       createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
//       updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
//     },
//     {
//       type: 'purchase',
//       amount: 120000,
//       bikeName: 'Yamaha FZ-S 2019',
//       description: 'Purchase of Yamaha FZ-S from dealer',
//       paymentMethod: 'cash',
//       reference: 'PUR001',
//       status: 'completed',
//       createdBy: null,
//       createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
//       updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
//     },
//     {
//       type: 'cost',
//       amount: 1500,
//       description: 'Engine oil change for Yamaha FZ-S',
//       category: 'maintenance',
//       paymentMethod: 'cash',
//       status: 'completed',
//       createdBy: null,
//       createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
//       updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
//     }
//   ];
  
//   await transactionsCollection.insertMany(sampleTransactions);
//   console.log('Created sample transactions');
// }

// // Create sample documents
// async function createSampleDocuments(db: Db) {
//   const documentsCollection = db.collection(Collections.DOCUMENTS);
  
//   const existingDocuments = await documentsCollection.countDocuments();
//   if (existingDocuments > 0) return;
  
//   const sampleDocuments = [
//     {
//       userId: null,
//       userName: 'Ahmed Rahman',
//       userPhone: '+8801712345678',
//       type: 'nid',
//       documentNumber: '1234567890123',
//       frontImage: '/uploads/documents/nid-front-1.jpg',
//       backImage: '/uploads/documents/nid-back-1.jpg',
//       status: 'verified',
//       verificationNotes: 'Document verified successfully',
//       verifiedBy: null,
//       verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
//       uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
//       extractedData: {
//         name: 'Ahmed Rahman',
//         fatherName: 'Abdul Rahman',
//         motherName: 'Rashida Begum',
//         dateOfBirth: new Date('1990-05-15'),
//         address: 'Dhanmondi, Dhaka',
//         bloodGroup: 'B+'
//       },
//       confidence: 95,
//       flags: [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     },
//     {
//       userId: null,
//       userName: 'Fatima Begum',
//       userPhone: '+8801812345678',
//       type: 'driving_license',
//       documentNumber: 'DL9876543210',
//       frontImage: '/uploads/documents/dl-front-1.jpg',
//       status: 'pending',
//       uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
//       extractedData: {
//         name: 'Fatima Begum',
//         licenseNumber: 'DL9876543210',
//         issueDate: new Date('2020-01-15'),
//         expiryDate: new Date('2025-01-15'),
//         vehicleClass: 'Motorcycle'
//       },
//       confidence: 88,
//       flags: ['low_quality_image'],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     }
//   ];
  
//   await documentsCollection.insertMany(sampleDocuments);
//   console.log('Created sample documents');
// }

// // Utility function to drop all collections (for testing)
// export async function dropAllCollections(db: Db) {
//   console.log('Dropping all collections...');
  
//   const collections = await db.listCollections().toArray();
  
//   for (const collection of collections) {
//     await db.collection(collection.name).drop();
//     console.log(`Dropped collection: ${collection.name}`);
//   }
  
//   console.log('All collections dropped');
// }

// // Utility function to reset database
// export async function resetDatabase(db: Db) {
//   await dropAllCollections(db);
//   await initializeDatabase(db);
// }

// export default {
//   initializeDatabase,
//   createIndexes,
//   seedInitialData,
//   dropAllCollections,
//   resetDatabase
// };