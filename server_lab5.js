const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const PORT = 5000;
const SECRET_KEY = "my_secret_key";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Swagger setup
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger.json", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let users = []; // Temporary in-memory storage
let ads = []; // In-memory ads
let nextAdId = 1; // To generate unique ad IDs

// Register endpoint
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "Користувач вже існує." });
    }
    users.push({ username, password });
    res.status(201).json({ message: "Користувач зареєстрований успішно!" });
});

// Login endpoint
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Невірний логін або пароль." });
    }
    const token = jwt.sign({ username }, SECRET_KEY);
    res.json({ token });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Get all ads
app.get("/api/ads", authenticateToken, (req, res) => {
    res.json(ads);
});

// Post a new ad with duplicate check
app.post("/api/ads", authenticateToken, (req, res) => {
    const { title, description, price } = req.body;

    const existingAd = ads.find(ad => ad.title === title && ad.description === description);
    if (existingAd) {
        return res.status(400).json({ message: "Оголошення з таким заголовком і описом вже існує" });
    }

    const ad = {
        id: nextAdId++,
        title,
        description,
        price,
        username: req.user.username,
    };

    ads.push(ad);

    // io.emit("newAd", ad); // Убираємо emit для уникнення дублювання

    res.status(201).json(ad);
});

// Update an ad
app.put("/api/ads/:id", authenticateToken, (req, res) => {
    const adIndex = ads.findIndex(ad => ad.id === parseInt(req.params.id));
    if (adIndex === -1) return res.status(404).json({ message: "Оголошення не знайдено" });

    // Check if the user is the owner of the ad
    if (ads[adIndex].username !== req.user.username) {
        return res.status(403).json({ message: "Неможливо редагувати це оголошення" });
    }

    // Update the ad
    const updatedAd = { ...ads[adIndex], ...req.body };
    ads[adIndex] = updatedAd;
    res.status(200).json(updatedAd);
});

// Delete an ad
app.delete("/api/ads/:id", authenticateToken, (req, res) => {
    const adIndex = ads.findIndex(ad => ad.id === parseInt(req.params.id));
    if (adIndex === -1) return res.status(404).json({ message: "Оголошення не знайдено" });

    // Check if the user is the owner of the ad
    if (ads[adIndex].username !== req.user.username) {
        return res.status(403).json({ message: "Неможливо видалити це оголошення" });
    }

    // Delete the ad
    ads.splice(adIndex, 1);
    res.status(200).json({ message: "Оголошення видалено" });
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("Socket connected: " + socket.id);
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
