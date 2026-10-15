/**
 * Seed script — wipes users, notes and posts, then inserts demo data.
 *
 *   npm run seed
 *
 * Login credentials after seeding:
 *   admin@demo.com / Admin@123   (admin)
 *   alice@demo.com / User@1234   (regular user, same for all others)
 */
import mongoose from "mongoose";
import { env } from "./src/config/env.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import { User } from "./src/models/User.js";
import { Note } from "./src/models/Note.js";
import { Post } from "./src/models/Post.js";

const demoUsers = [
  { name: "Site Admin", email: "admin@demo.com", password: "Admin@123", role: "admin", interests: ["reading", "chess"] },
  { name: "Alice Rahman", email: "alice@demo.com", password: "User@1234", interests: ["chess", "reading", "travel"] },
  { name: "Bob Karim", email: "bob@demo.com", password: "User@1234", interests: ["coding", "chess"] },
  { name: "Carol Ahmed", email: "carol@demo.com", password: "User@1234", interests: ["reading", "music"] },
  { name: "David Hasan", email: "david@demo.com", password: "User@1234", interests: ["travel", "cooking"] },
  { name: "Eve Chowdhury", email: "eve@demo.com", password: "User@1234", interests: ["coding", "music", "reading"] },
  { name: "Frank Islam", email: "frank@demo.com", password: "User@1234", interests: ["chess", "cooking"] },
  { name: "Grace Akter", email: "grace@demo.com", password: "User@1234", interests: ["music", "travel"] },
  { name: "Henry Sarker", email: "henry@demo.com", password: "User@1234", interests: ["coding", "cooking", "chess"] },
];

const noteTemplates = [
  { title: "Grocery list", content: "Rice, lentils, onions, garlic, ginger, and a fresh batch of spices for the weekend." },
  { title: "Book to read next", content: "Finish 'Clean Code', then start 'Designing Data-Intensive Applications'." },
  { title: "Weekend plan", content: "Long walk Saturday morning, chess practice in the evening, family lunch on Sunday." },
  { title: "Study notes: MongoDB indexes", content: "Compound indexes sort by a prefix; equality fields first, sort fields after." },
  { title: "Recipe idea", content: "Slow-cooked beef curry with potatoes — toast the spices first for deeper flavor." },
  { title: "Trip checklist", content: "Passport, adapter, hiking shoes, camera battery, and the concert tickets." },
  { title: "Guitar practice", content: "Practice F barre chord 10 minutes daily and finish learning the fingerpicking pattern." },
  { title: "Work reminders", content: "Reply to the design review thread, update the sprint board, prep the Friday demo." },
  { title: "Chess opening to learn", content: "Italian Game: develop knights before bishops, castle early, control the center." },
];

const postTemplates = [
  { title: "Why I started playing chess", content: "A friend beat me in twelve moves. I bought a board the same evening and have not stopped since." },
  { title: "Best books I read this year", content: "Fiction took a back seat — most of my favorites were engineering and history books this time." },
  { title: "Aggregation pipelines, explained simply", content: "Think of them as an assembly line: documents enter, each stage reshapes them, results come out the end." },
  { title: "Street food tour highlights", content: "Twelve stalls in one evening. The spicy noodles won, and I have the photos to prove it." },
  { title: "How I organize my study notes", content: "One note per topic, tagged by interest, reviewed every Sunday. Simple, but it works." },
  { title: "Cooking is just debugging", content: "You follow a recipe, something tastes off, you isolate the variable, and you fix it next time." },
  { title: "Learning guitar as an adult", content: "Ten clumsy minutes a day beats a two-hour session once a month. Consistency wins." },
  { title: "Planning a budget trip", content: "Flights on Tuesday afternoons, hostels near transit, and one splurge meal per city." },
];

async function seed() {
  await connectDB();

  console.log("[seed] wiping existing data...");
  await Promise.all([User.deleteMany({}), Note.deleteMany({}), Post.deleteMany({})]);

  console.log("[seed] inserting users...");
  const users = await User.create(demoUsers);

  console.log("[seed] inserting notes...");
  const notes = [];
  users.forEach((user, userIndex) => {
    // 2-3 notes per user, round-robin over the templates.
    const count = 2 + (userIndex % 2);
    for (let i = 0; i < count; i++) {
      const template = noteTemplates[(userIndex + i) % noteTemplates.length];
      notes.push({ ...template, owner: user._id });
    }
  });
  await Note.create(notes);

  console.log("[seed] inserting posts...");
  const posts = [];
  users.forEach((user, userIndex) => {
    // 2 posts per user.
    for (let i = 0; i < 2; i++) {
      const template = postTemplates[(userIndex * 2 + i) % postTemplates.length];
      posts.push({ ...template, author: user._id });
    }
  });
  await Post.create(posts);

  console.log(`[seed] done: ${users.length} users, ${notes.length} notes, ${posts.length} posts\n`);
  console.table(
    users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      password: demoUsers.find((d) => d.email === u.email).password,
      interests: u.interests.join(", "),
    }))
  );

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error("[seed] failed:", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
