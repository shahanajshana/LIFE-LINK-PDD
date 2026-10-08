const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting LifeLink Backend (Port 5000) & Frontend (Port 3000)...\n");

// 1. Start Backend Server
const backend = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

// 2. Start Frontend Dev Server
const frontend = spawn("npm", ["start"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
  shell: true,
});

process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
