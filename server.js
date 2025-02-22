const express = require('express');
const app = express();
app.use(express.json());

let bookings = {};

app.get('/bookings', (req, res) => {
    res.json(bookings);
});

app.post('/book', (req, res) => {
    const { date, masseur, hour } = req.body;
    if (!bookings[date]) bookings[date] = {};
    if (!bookings[date][masseur]) bookings[date][masseur] = [];
    bookings[date][masseur].push(hour);
    res.status(200).json(bookings);
});

app.post('/remove', (req, res) => {
    const { date, masseur, hour } = req.body;
    if (bookings[date]?.[masseur]) {
        bookings[date][masseur] = bookings[date][masseur].filter(h => h !== hour);
        if (bookings[date][masseur].length === 0) delete bookings[date][masseur];
        if (Object.keys(bookings[date]).length === 0) delete bookings[date];
    }
    res.status(200).json(bookings);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));