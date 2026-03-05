const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Seed data
const defaultData = {
    version: "2.2",
    users: {
        "1010101010": { password: "password123", name: "Ahmed Al-Saud", role: "patient", bloodType: "O+", age: "32", surgeries: "Appendectomy (2015)" },
        "2020202020": { password: "password123", name: "Fatima Al-Rashid", role: "patient", bloodType: "A+", age: "28" },
        "3030303030": { password: "password123", name: "Omar Tariq", role: "patient", bloodType: "B-", age: "45", surgeries: "Knee Replacement (2020)" },
        "9090909090": { password: "password123", name: "System Admin", role: "admin" }
    },
    doctors: [
        { id: '5151515151', name_en: 'Dr. Sara Al-Saud', specialty_en: 'Neurology', hospital_id: 1 },
        { id: '5050505050', name_en: 'Dr. Faisal Al-Harbi', specialty_en: 'Cardiology', hospital_id: 2 }
    ],
    appointments: []
};

// Ensure database file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/all', (req, res) => {
    const db = readDB();
    res.json(db);
});

app.get('/api/collection/:name', (req, res) => {
    const db = readDB();
    res.json(db[req.params.name] || []);
});

app.get('/api/doc/:collection/:id', (req, res) => {
    const db = readDB();
    const collection = db[req.params.collection];
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection[req.params.id] || null);
});

app.post('/api/doc/:collection/:id', (req, res) => {
    const db = readDB();
    if (!db[req.params.collection]) db[req.params.collection] = {};
    db[req.params.collection][req.params.id] = {
        ...db[req.params.collection][req.params.id],
        ...req.body,
        updated_at: new Date().toISOString()
    };
    writeDB(db);
    res.json({ success: true, data: db[req.params.collection][req.params.id] });
});

app.post('/api/add/:collection', (req, res) => {
    const db = readDB();
    if (!Array.isArray(db[req.params.collection])) db[req.params.collection] = [];
    const newItem = {
        ...req.body,
        id: '_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
    };
    db[req.params.collection].push(newItem);
    writeDB(db);
    res.json({ success: true, data: newItem });
});

app.post('/api/set_collection/:name', (req, res) => {
    const db = readDB();
    db[req.params.name] = req.body;
    writeDB(db);
    res.json({ success: true });
});

app.get('/api/ping', (req, res) => {
    res.json({ pong: true });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});
