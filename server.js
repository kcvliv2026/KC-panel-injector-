const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = "KCV_SECRET_CHANGE_THIS";

// ===== MAINTENANCE MODE =====
let maintenanceMode = false;

// ===== DEMO USERS =====
const users = [
  {
    username: "admin1",
    role: "admin",
    key: bcrypt.hashSync("ADMIN-0001", 10)
  },
  {
    username: "reseller1",
    role: "reseller",
    key: bcrypt.hashSync("RESELLER-1001", 10)
  }
];

// ===== TOKEN CHECK =====
function verifyToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ message: "No token" });

  const token = auth.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("✅ KCV PANEL SERVER ONLINE");
});

app.get("/status", (req, res) => {
  res.json({
    server: "ONLINE",
    maintenance: maintenanceMode,
    uptime: Math.floor(process.uptime()) + "s"
  });
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {

  if (maintenanceMode) {
    return res.json({
      success: false,
      message: "⚠️ Server under maintenance"
    });
  }

  const { username, key } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ success: false, message: "Invalid login" });

  const valid = await bcrypt.compare(key, user.key);
  if (!valid) return res.json({ success: false, message: "Invalid login" });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    success: true,
    token,
    data: { role: user.role }
  });
});

// ===== ADMIN ROUTES =====
app.get("/admin/users", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  res.json({
    users: users.map(u => ({
      username: u.username,
      role: u.role
    }))
  });
});

app.post("/admin/maintenance", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  maintenanceMode = !maintenanceMode;
  res.json({ maintenance: maintenanceMode });
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
