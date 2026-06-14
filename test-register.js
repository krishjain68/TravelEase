// test-register.js
const mongoose = require("mongoose");
const User = require("./models/user");

async function run(){
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("Connected to mongo for test");
    console.log("User.register type:", typeof User.register);

    const u = new User({ username: "tempuser", email: "t@t.com" });
    const reg = await User.register(u, "password123");
    console.log("registered OK:", { id: reg._id, username: reg.username, email: reg.email });
    await mongoose.connection.close();
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}
run();
