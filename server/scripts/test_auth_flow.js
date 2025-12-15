import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  if (!process.env.PORT) process.env.PORT = 5000;
  await mongoose.connect(process.env.MONGO_URI);

  const base = `http://localhost:${process.env.PORT}`;

  const email = `testuser+${Date.now()}@example.com`;
  const password = "password123";
  const username = "testuser";

  console.log("Registering user...");
  let res = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  console.log("Register status", res.status);

  console.log("Logging in...");
  res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  console.log("Login response", data);

  if (!data.token) {
    console.error("Login failed");
    process.exit(1);
  }

  const token = data.token;

  console.log("Calling protected habits endpoint...");
  res = await fetch(`${base}/api/habits`, { headers: { Authorization: `Bearer ${token}` } });
  console.log("Habits status", res.status);

  console.log("Logging out...");
  res = await fetch(`${base}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  console.log("Logout status", res.status);

  console.log("Calling protected endpoint after logout (should be 401)...");
  res = await fetch(`${base}/api/habits`, { headers: { Authorization: `Bearer ${token}` } });
  console.log("Post-logout habits status", res.status);

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
