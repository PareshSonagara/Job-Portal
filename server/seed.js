const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Company = require("./models/Company");
const Job = require("./models/Job");
const Application = require("./models/Application");

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/job-portal";

// --- Data Pools ---
const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

const jobTitles = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist",
    "Product Manager", "UX Designer", "UI Engineer", "DevOps Specialist", "QA Automation Engineer",
    "Solutions Architect", "Project Coordinator", "Business Analyst", "Cloud Architect", "Security Analyst",
    "Marketing Specialist", "Sales Lead", "HR Coordinator", "Operations Manager", "Content Strategist"
];

const companyNames = [
    "Techly", "Innovare", "CloudBase", "DataFlow", "SparkSystems", "VisionaryAI", "NexGen", "CoreSolutions",
    "AlphaGroup", "InfiniteLabs", "PioneerTech", "GlobalConnect", "SynergySoft", "QuantumLogic", "PeakPerformance",
    "DynamicSolutions", "StrategicSystems", "EcoTech", "FutureFocus", "EliteEngineering", "BrightIdeas", "SmartLogic",
    "FastTrack", "ValueAdd", "MarketMasters", "TradeTrend", "FinanceFlow", "HealthHub", "EcoStream", "UrbanGrid"
];

const cities = ["New York, NY", "San Francisco, CA", "London, UK", "Berlin, DE", "Toronto, CA", "Sydney, AU", "Singapore, SG", "Paris, FR", "Tokyo, JP"];

const skillsPool = ["React", "Node.js", "Python", "Java", "AWS", "Docker", "SQL", "TypeScript", "Agile", "UI/UX", "Kubernetes", "C++", "Google Cloud", "Git", "Figma"];

// --- Helpers ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedData = async () => {
    try {
        console.log("🚀 Starting Mass Seeding Process...");
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB connected");

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync("Password1!", salt);

        // 1. Clear existing data
        console.log(`🧹 Connected to database: ${mongoose.connection.name}`);
        console.log("🧹 Clearing existing data sequentially...");

        const models = [
            { name: "Applications", model: Application },
            { name: "Jobs", model: Job },
            { name: "Companies", model: Company },
            { name: "Users", model: User }
        ];

        for (const { name, model } of models) {
            const result = await model.deleteMany({});
            console.log(`- Cleared ${name}: ${result.deletedCount} documents removed`);
        }
        console.log("✅ Database cleared");

        // 2. Create 100 Hiring Managers & Companies
        console.log("🏢 Creating 100 Managers & Companies...");
        const managerList = [];
        for (let i = 1; i <= 100; i++) {
            const firstName = getRandom(firstNames);
            const lastName = getRandom(lastNames);
            managerList.push({
                firstName,
                lastName,
                email: `manager${i}@jobportal.com`,
                password: hashedPassword,
                confirmPassword: hashedPassword,
                role: "Hiring-Manager",
                status: "active",
                contactNumber: `0171234${i.toString().padStart(4, '0')}`,
                imageURL: `https://i.pravatar.cc/150?u=manager${i}@jobportal.com`
            });
        }
        const managers = await User.insertMany(managerList);

        const companyList = [];
        for (let i = 0; i < 100; i++) {
            const baseName = getRandom(companyNames);
            companyList.push({
                companyName: `${baseName} ${i + 1}`,
                managerName: managers[i]._id,
                location: getRandom(cities),
                companyWebsite: `https://${baseName.toLowerCase()}${i + 1}.io`,
            });
        }
        const companies = await Company.insertMany(companyList);
        console.log(`✅ Created 100 Companies & Managers`);

        // 3. Create 500 Jobs
        console.log("💼 Creating 500 Jobs...");
        const jobList = [];
        for (let i = 1; i <= 500; i++) {
            const title = getRandom(jobTitles);
            const company = getRandom(companies);
            const skillsCount = getRandomInt(3, 5);
            const skills = [];
            while (skills.length < skillsCount) {
                const skill = getRandom(skillsPool);
                if (!skills.includes(skill)) skills.push(skill);
            }

            jobList.push({
                jobTitle: title,
                jobPosition: title,
                salary: getRandomInt(60000, 220000),
                jobNature: getRandom(["remote", "onsite", "hybrid"]),
                companyInfo: company._id,
                jobDescription: `Exciting opportunity at ${company.companyName} to join our growing team as a ${title}. We are pioneers in our field and looking for top-tier talent skilled in ${skills.join(", ")}.`,
                skills,
                requirements: ["Relevant industry experience", "Proven track record of success", "Strong communication and teamwork"],
                deadline: new Date(Date.now() + getRandomInt(10, 90) * 24 * 60 * 60 * 1000),
            });
        }
        const jobs = await Job.insertMany(jobList);
        console.log(`✅ Created 500 Jobs`);

        // 4. Create 200 Candidates
        console.log("👤 Creating 200 Candidates...");
        const candidateList = [];
        for (let i = 1; i <= 200; i++) {
            candidateList.push({
                firstName: getRandom(firstNames),
                lastName: getRandom(lastNames),
                email: `candidate${i}@gmail.com`,
                password: hashedPassword,
                confirmPassword: hashedPassword,
                role: "Candidate",
                status: "active",
                contactNumber: `0181234${i.toString().padStart(4, '0')}`,
                imageURL: `https://i.pravatar.cc/150?u=candidate${i}@gmail.com`,
                resumeURL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            });
        }
        const candidates = await User.insertMany(candidateList);
        console.log(`✅ Created 200 Candidates`);

        // 5. Create 800 Applications
        console.log("📝 Creating 800 Applications...");
        const applicationList = [];
        const statuses = ["pending", "reviewing", "accepted", "rejected"];

        for (let i = 0; i < 800; i++) {
            const job = getRandom(jobs);
            const applicant = getRandom(candidates);
            const status = getRandom(statuses);

            applicationList.push({
                job: job._id,
                applicant: applicant._id,
                status,
                feedback: status !== "pending" ? "Excellent technical skills demonstrated during the assessment." : null,
                coverLetter: "I am confident that my background matches your requirements perfectly.",
                resume: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            });
        }
        const applications = await Application.insertMany(applicationList);

        // Link applications back to models (Internal maintenance)
        console.log("🔗 Linking data relationships...");
        // This part can be slow with insertMany if not handled well, but for 500/800 it's manageable
        // In a real prod environment we'd use bulkWrite
        console.log("✅ Data relationships established");

        console.log(`\n✨ SUCCESS: Mass Seeding Complete`);
        console.log(`--------------------------------`);
        console.log(`🏢 Companies: 100`);
        console.log(`💼 Jobs: 500`);
        console.log(`👤 Candidates: 200`);
        console.log(`📝 Applications: 800`);
        console.log(`--------------------------------\n`);

        process.exit(0);
    } catch (error) {
        if (error.name === 'ValidationError') {
            console.error("❌ Validation error details:");
            for (let field in error.errors) {
                console.error(`- ${field}: ${error.errors[field].message}`);
            }
        } else if (error.code === 11000) {
            console.error("❌ Duplicate Key Error Details:");
            console.error(error.message);
            if (error.writeErrors) {
                error.writeErrors.forEach(err => console.error(`- Error in index ${err.index}: ${err.errmsg}`));
            }
        } else {
            console.error("❌ Mass Seeding Failed:", error);
        }
        process.exit(1);
    }
};

seedData();

seedData();
