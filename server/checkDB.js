import mongoose from "mongoose";
import User from "./models/User.js";

const MONGODB_URI = "mongodb+srv://pmsonagara007_db_user:PareshSonagara@cluster0.k7t0jb8.mongodb.net/job_portal?retryWrites=true&w=majority";

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const totalCount = await User.countDocuments();
    const candidateCount = await User.countDocuments({ role: "Candidate" });
    const hrCount = await User.countDocuments({ role: "Hiring-Manager" });
    
    console.log(`📊 Actual Database Count:`);
    console.log(`Total Users: ${totalCount}`);
    console.log(`Candidates: ${candidateCount}`);
    console.log(`HR Managers: ${hrCount}`);

    // Show first 5 users
    const users = await User.find().limit(5);
    console.log("\n👥 Sample Users:");
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) - Status: ${u.status}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
