require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const validator = require("validator");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me-in-production";
const dbFile = path.join(__dirname, "users.db");
const uploadDir = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error("Failed to open database:", err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error("Failed to inspect users table:", err.message);
            return;
        }

        const hasAvatar = rows.some((row) => row.name === "avatar_path");
        if (!hasAvatar) {
            db.run("ALTER TABLE users ADD COLUMN avatar_path TEXT", (alterErr) => {
                if (alterErr) {
                    console.error("Failed to add avatar_path column:", alterErr.message);
                }
            });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS oes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text_content TEXT,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Use sessions for lightweight authentication after a successful login.
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));
console.log("SQLite data store:", dbFile);
console.log("Oe images and uploads are stored in:", uploadDir);

// Protect auth endpoints from brute-force abuse.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." }
});

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname) || ".jpg";
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, uniqueName);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = /\.(jpe?g|png|webp)$/i;
        if (!allowed.test(file.originalname)) {
            return cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
        }
        cb(null, true);
    }
});

app.get("/api", (req, res) => {
    res.json({
        message: "Hello from my API!"
    });
});

app.post("/signup", authLimiter, (req, res, next) => {
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "Please fill in all fields." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    bcrypt.hash(password, 12, (err, hashedPassword) => {
        if (err) {
            return next(err);
        }

        db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], function (dbErr) {
            if (dbErr) {
                if (dbErr.code === "SQLITE_CONSTRAINT") {
                    return res.status(409).json({ error: "A user with that email already exists." });
                }
                return next(dbErr);
            }

            return res.json({ success: true, redirect: "/thankyou.html" });
        });
    });
});

app.post("/login", authLimiter, (req, res, next) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide both email and password." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
    }

    db.get("SELECT id, username, email, password FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials." });
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            return res.json({ success: true, redirect: "/feed.html", message: "Logged in successfully." });
        } catch (compareErr) {
            return next(compareErr);
        }
    });
});

app.post("/oes", upload.single("image"), (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Please log in to create an Oe." });
    }

    const textContent = (req.body.text_content || "").trim();
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!textContent && !imagePath) {
        return res.status(400).json({ error: "An Oe must include text or an image." });
    }

    if (textContent.length > 280) {
        return res.status(400).json({ error: "Oe text must be 280 characters or less." });
    }

    db.run("INSERT INTO oes (user_id, text_content, image_path) VALUES (?, ?, ?)", [req.session.userId, textContent || null, imagePath], function (insertErr) {
        if (insertErr) {
            return next(insertErr);
        }

        db.get(
            "SELECT oes.id, oes.user_id, oes.text_content, oes.image_path, oes.created_at, users.username, users.avatar_path FROM oes LEFT JOIN users ON users.id = oes.user_id WHERE oes.id = ?",
            [this.lastID],
            (selectErr, post) => {
                if (selectErr) {
                    return next(selectErr);
                }

                return res.status(201).json({ success: true, post });
            }
        );
    });
});

app.get("/oes", (req, res, next) => {
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;

    db.all(
        `SELECT oes.id, oes.user_id, oes.text_content, oes.image_path, oes.created_at, users.username, users.avatar_path
         FROM oes
         LEFT JOIN users ON users.id = oes.user_id
         ORDER BY oes.created_at DESC
         LIMIT ?`,
        [limit],
        (err, rows) => {
            if (err) {
                return next(err);
            }

            return res.json(rows);
        }
    );
});

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    if (err instanceof Error && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image must be 5MB or smaller." });
    }
    if (err instanceof Error && err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Only one image upload is supported." });
    }
    if (err instanceof Error && err.message && err.message.includes("Only JPG")) {
        return res.status(400).json({ error: err.message });
    }

    console.error(err.message);
    res.status(err.status || 500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});