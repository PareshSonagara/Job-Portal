import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const MONGODB_URI = "mongodb+srv://pmsonagara007_db_user:PareshSonagara@cluster0.k7t0jb8.mongodb.net/job_portal?retryWrites=true&w=majority";

const firstNames = [
  "John", "Jane", "Michael", "Sarah", "David", "Emma", "Robert", "Lisa", "James", "Maria",
  "William", "Anna", "Richard", "Jennifer", "Joseph", "Patricia", "Thomas", "Linda", "Charles", "Barbara",
  "Christopher", "Elizabeth", "Daniel", "Susan", "Matthew", "Jessica", "Anthony", "Sarah", "Mark", "Karen"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const locations = [
  "New York, USA", "San Francisco, USA", "London, UK", "Toronto, Canada", "Sydney, Australia",
  "Berlin, Germany", "Paris, France", "Tokyo, Japan", "Dubai, UAE", "Singapore",
  "Mumbai, India", "Bangkok, Thailand", "Mexico City, Mexico", "São Paulo, Brazil", "Moscow, Russia"
];

const bios = [
  "Passionate developer with expertise in full-stack development.",
  "Creative designer focused on user experience and interface design.",
  "Data scientist enthusiast working with machine learning projects.",
  "DevOps engineer with cloud infrastructure experience.",
  "Mobile app developer specializing in React Native.",
  "Backend engineer with microservices architecture knowledge.",
  "Frontend developer passionate about modern web technologies.",
  "Full-stack developer with 5+ years of experience.",
  "Tech lead who mentors junior developers.",
  "Software architect designing scalable systems."
];

const skillSets = [
  ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
  ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
  ["Java", "Spring Boot", "Microservices", "Kubernetes", "MySQL"],
  ["TypeScript", "Vue.js", "GraphQL", "Firebase", "Tailwind CSS"],
  ["Go", "Rust", "System Design", "Linux", "CI/CD"],
  ["C++", "Data Structures", "Algorithms", "STL", "Competitive Programming"],
  ["HTML", "CSS", "JavaScript", "Figma", "UI Design"],
  ["PHP", "Laravel", "Vue.js", "MySQL", "Apache"],
  ["Swift", "iOS Development", "Objective-C", "Xcode", "CocoaPods"],
  ["Android", "Kotlin", "Java", "Firebase", "Material Design"]
];

const experiences = [
  "5 years of software development experience in fintech and e-commerce.",
  "3 years working with startups on MVP development.",
  "10+ years in enterprise software development.",
  "2 years as a junior developer, now transitioning to full-stack.",
  "Freelance developer with diverse project portfolio.",
  "Experience in building scalable microservices architectures.",
  "Background in computer science with practical industry experience.",
  "Self-taught developer with strong problem-solving skills.",
  "Led teams of 5-10 developers in agile environments.",
  "Open source contributor with published npm packages."
];

let emailCounter = 1;
let hashedPassword; // Pre-hash password once

function generateRandomEmail() {
  return `user${emailCounter++}@example.com`;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDummyUser(role) {
  const userId = emailCounter; // Use counter for unique IDs
  
  return {
    email: generateRandomEmail(),
    password: hashedPassword,
    firstName: getRandomElement(firstNames),
    lastName: getRandomElement(lastNames),
    role: role,
    contactNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    location: getRandomElement(locations),
    bio: getRandomElement(bios),
    skills: getRandomElement(skillSets),
    experience: getRandomElement(experiences),
    // Add random profile pictures from Avatar API
    imageURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    // Add sample resume URLs
    resumeURL: `/uploads/sample-resume-${userId % 10 + 1}.pdf`,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Pre-hash password once
    hashedPassword = bcrypt.hashSync("Test123!", 10);

    // Clear existing users
    await User.deleteMany({});
    console.log("🗑️  Cleared existing users");

    // Generate dummy data
    const users = [];
    
    // Generate 800 candidates
    console.log("📝 Generating 800 candidates...");
    for (let i = 0; i < 800; i++) {
      users.push(generateDummyUser("Candidate"));
      if ((i + 1) % 100 === 0) {
        console.log(`  Generated ${i + 1} candidates...`);
      }
    }

    // Generate 200 HR managers
    console.log("📝 Generating 200 HR managers...");
    for (let i = 0; i < 200; i++) {
      users.push(generateDummyUser("Hiring-Manager"));
      if ((i + 1) % 50 === 0) {
        console.log(`  Generated ${i + 1} HR managers...`);
      }
    }

    // Insert all users
    console.log("💾 Inserting 1000 users into database...");
    const result = await User.collection.insertMany(users);
    console.log(`✅ Successfully inserted ${result.insertedCount} users!`);

    // Verification
    const candidateCount = await User.countDocuments({ role: "Candidate" });
    const hrCount = await User.countDocuments({ role: "Hiring-Manager" });
    const totalCount = await User.countDocuments();

    console.log("\n📊 Database Summary:");
    console.log(`Total Users: ${totalCount}`);
    console.log(`Candidates: ${candidateCount}`);
    console.log(`HR Managers: ${hrCount}`);

    await mongoose.connection.close();
    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
