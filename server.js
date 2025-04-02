const express = require('express');
const app = express();
const port = 3000;

// Middleware для логування запитів
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Маршрут для кореневого GET-запиту
app.get('/', (req, res) => {
    res.send('Привіт, Express!');
});

// GET-запит на /api/info
app.get('/api/info', (req, res) => {
    res.json({ message: "Це GET-запит" });
});

// POST-запит на /api/data
app.post('/api/data', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Ім'я є обов'язковим" });
    }
    res.json({ message: `Привіт, ${name}!` });
});

// GET-запит на /api/inspire
app.get('/api/inspire', (req, res) => {
    res.json({ quote: "Ти можеш все, якщо захочеш!" });
});

// POST-запит на /api/split-word
app.post('/api/split-word', (req, res) => {
    const { word } = req.body;
    if (!word) {
        return res.status(400).json({ error: "Слово є обов'язковим" });
    }
    res.json({ split: word.split('') });
});

// Middleware для обробки помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Помилка на сервері" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
