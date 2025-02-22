const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, 'data.json');

// Инициализация данных, если файла нет
async function initData() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify({ users: {} }));
  }
}
initData();

// Middleware для проверки Telegram ID
function authMiddleware(req, res, next) {
  const userId = req.headers['x-telegram-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Telegram User ID required' });
  }
  req.userId = userId;
  next();
}

// Получение всех записей пользователя
app.get('/appointments', authMiddleware, async (req, res) => {
  const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  const userAppointments = data.users[req.userId] || [];
  res.json(userAppointments);
});

// Добавление или обновление записи
app.post('/appointments', authMiddleware, async (req, res) => {
  const newAppointment = req.body;
  const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  
  if (!data.users[req.userId]) {
    data.users[req.userId] = [];
  }
  
  const existingIndex = data.users[req.userId].findIndex(app => app.id === newAppointment.id);
  if (existingIndex !== -1) {
    data.users[req.userId][existingIndex] = newAppointment; // Обновление
  } else {
    data.users[req.userId].push(newAppointment); // Добавление
  }
  
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Удаление записи
app.delete('/appointments/:id', authMiddleware, async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  
  if (data.users[req.userId]) {
    data.users[req.userId] = data.users[req.userId].filter(app => app.id !== appointmentId);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Appointments not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
