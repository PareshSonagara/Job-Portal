import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const MONGODB_URI = "mongodb+srv://pmsonagara007_db_user:PareshSonagara@cluster0.k7t0jb8.mongodb.net/job_portal?retryWrites=true&w=majority";

async function testSeed() {
  try {
    console.time("Connection");
    await mongoose.connect(MONGODB_URI);
    console.timeEnd("Connection");
    console.log("✅ Connected to MongoDB Atlas");

    // Clear existing users
    console.time("Clear");
    await User.deleteMany({});
    console.timeEnd("Clear");
    console.log("🗑️  Cleared existing users");

    // Test: Insert just 10 users
    console.log("📝 Generating 10 test users...");
    const users = [];
    
    console.time("Generation");
    for (let i = 1; i <= 10; i++) {
      const hashedPassword = bcrypt.hashSync("Test123!", 10);
      users.push({
        email: `user${i}@example.com`,
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        role: "Candidate",
        contactNumber: "+11234567890",
        dateOfBirth: new Date("1990-01-01"),
        location: "New York, USA",
        bio: "Test bio",
        skills: ["JavaScript", "React"],
        experience: "5 years",
        imageURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        resumeURL: `/uploads/sample-resume-${i}.pdf`,
        status: "active"
      });
    }
    console.timeEnd("Generation");
    
    console.time("Insertion");
    const result = await User.collection.insertMany(users);
    console.timeEnd("Insertion");
    console.log(`✅ Successfully inserted ${result.insertedCount} users!`);

    const totalCount = await User.countDocuments();
    console.log(`📊 Total Users in DB: ${totalCount}`);

    await mongoose.connection.close();
    console.log("✅ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testSeed();
