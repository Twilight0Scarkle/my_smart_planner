// ==========================================
// 1. ПРИВЕТСТВИЕ И ДАТА
// ==========================================
const now = new Date();
const hours = now.getHours();
let greetingText = "Доброй ночи!";
if (hours >= 5 && hours < 12) greetingText = "Доброе утро!";
else if (hours >= 12 && hours < 18) greetingText = "Добрый день!";
else if (hours >= 18 && hours < 23) greetingText = "Добрый вечер!";

document.getElementById('greeting').innerText = greetingText;
document.getElementById('current-date').innerText = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ==========================================
// 2. ПЕРЕМЕННЫЕ И ЭЛЕМЕНТЫ
// ==========================================
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const progressCount = document.getElementById('progress-count');
const progressFill = document.getElementById('progress-fill');

// Переменные для трекеров
let water = parseInt(localStorage.getItem('tracker-water')) || 0;
let sport = localStorage.getItem('tracker-sport') === 'true';
let sleep = parseInt(localStorage.getItem('tracker-sleep')) || 0;

// Переменные для Помодоро и Настроения
let timerInterval;
let timeLeft = 25 * 60; // 25 минут в секундах
let isRunning = false;
let currentMood = localStorage.getItem('tracker-mood') || null;

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

// ==========================================
// 3. ЛОГИКА ЗАДАЧ
// ==========================================
function renderTasks() {
    taskList.innerHTML = '';
    let completedCount = 0;

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) {
            li.classList.add('completed');
            completedCount++;
        }

        // Цветная полоска категории
        const colorBar = document.createElement('div');
        colorBar.style.width = '5px';
        colorBar.style.height = '30px';
        colorBar.style.borderRadius = '5px';
        colorBar.style.marginRight = '10px';
        colorBar.style.position = 'absolute';
        colorBar.style.left = '0';
        if (task.category === 'работа') colorBar.style.backgroundColor = '#A38FBC'; // Лавандовый
        else if (task.category === 'учеба') colorBar.style.backgroundColor = '#8ECAE6'; // Голубой
        else colorBar.style.backgroundColor = '#FFB74D'; // Оранжевый
        li.appendChild(colorBar);

        // Текст
        const span = document.createElement('span');
        span.className = 'task-text';
        span.innerText = task.text;
        span.onclick = () => toggleTask(index);

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerText = '×';
        deleteBtn.onclick = () => deleteTask(index);

        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    localStorage.setItem('myTasks', JSON.stringify(tasks));

    // Обновляем прогресс
    const total = tasks.length;
    progressCount.innerText = `${completedCount} / ${total}`;
    const percent = total === 0 ? 0 : (completedCount / total) * 100;
    progressFill.style.width = `${percent}%`;
}

function addTask() {
    const text = taskInput.value.trim();
    const category = document.getElementById('task-category').value;
    if (text !== '') {
        tasks.push({ text: text, completed: false, category: category });
        taskInput.value = '';
        renderTasks();
    }
}

taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTask();
});

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
}

// ==========================================
// 4. ЛОГИКА КАЛЕНДАРЯ
// ==========================================
function generateCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('calendar-month-year');

    if (!grid) return; // Защита, если элемент не найден

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    monthYearDisplay.innerText = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const dayNames = Array.from(grid.children).slice(0, 7);
    grid.innerHTML = '';
    dayNames.forEach(day => grid.appendChild(day));

    let emptyCells = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < emptyCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        grid.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = i;
        if (i === today.getDate()) {
            dayDiv.classList.add('today');
        }
        grid.appendChild(dayDiv);
    }
}

// ==========================================
// 5. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ==========================================
function showTab(tabName) {
    // Скрываем все экраны
    document.getElementById('tab-tasks').style.display = 'none';
    document.getElementById('tab-calendar').style.display = 'none';
    document.getElementById('tab-trackers').style.display = 'none';

    // Убираем активный класс со всех кнопок
    document.getElementById('btn-tasks').classList.remove('active');
    document.getElementById('btn-calendar').classList.remove('active');
    document.getElementById('btn-trackers').classList.remove('active');

    // Показываем нужный
    if (tabName === 'tasks') {
        document.getElementById('tab-tasks').style.display = 'block';
        document.getElementById('btn-tasks').classList.add('active');
    } else if (tabName === 'calendar') {
        document.getElementById('tab-calendar').style.display = 'block';
        document.getElementById('btn-calendar').classList.add('active');
    } else if (tabName === 'trackers') {
        document.getElementById('tab-trackers').style.display = 'block';
        document.getElementById('btn-trackers').classList.add('active');
        updateTrackersUI(); // Обновляем цифры при открытии
    }
}

// ==========================================
// 6. ЛОГИКА ТРЕКЕРОВ
// ==========================================
function updateTrackersUI() {
    // Вода
    document.getElementById('water-count').innerText = water;

    // Спорт
    const sportStatus = document.getElementById('sport-status');
    if (sport) {
        sportStatus.innerText = "Выполнено ✅";
        sportStatus.style.color = "#8ECAE6";
    } else {
        sportStatus.innerText = "Нет ❌";
        sportStatus.style.color = "#4A4A4A";
    }

    // Сон
    document.getElementById('sleep-count').innerText = sleep;

    // Настроение
    if (currentMood) {
        document.getElementById('mood-display').innerText = currentMood;
        // Ищем нужный смайлик и делаем его цветным
        document.querySelectorAll('.mood-emoji').forEach(el => {
            if (el.innerText === currentMood) el.classList.add('active');
        });
    }
}

function addWater() {
    water++;
    localStorage.setItem('tracker-water', water);
    updateTrackersUI();
}

function toggleSport() {
    sport = !sport;
    localStorage.setItem('tracker-sport', sport);
    updateTrackersUI();
}

function addSleep() {
    sleep++;
    localStorage.setItem('tracker-sleep', sleep);
    updateTrackersUI();
}

function resetSleep() {
    sleep = 0;
    localStorage.setItem('tracker-sleep', sleep);
    updateTrackersUI();
}

// ==========================================
// 7. ЛОГИКА ПОМОДОРО
// ==========================================
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = document.getElementById('timer-display');
    if (display) {
        display.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startTimer() {
    const btn = document.getElementById('timer-btn');
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerText = "Продолжить";
        btn.style.backgroundColor = "#8ECAE6"; // Голубой при паузе
        return;
    }

    isRunning = true;
    btn.innerText = "Пауза";
    btn.style.backgroundColor = "#E6A8B7"; // Розовый при работе

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            btn.innerText = "Старт";
            btn.style.backgroundColor = "#A38FBC";
            alert("Время вышло! Пора отдохнуть 🌿");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    const btn = document.getElementById('timer-btn');
    if (btn) {
        btn.innerText = "Старт";
        btn.style.backgroundColor = "#A38FBC";
    }
}

// ==========================================
// 8. ЛОГИКА НАСТРОЕНИЯ
// ==========================================
function setMood(emoji, element) {
    currentMood = emoji;
    localStorage.setItem('tracker-mood', currentMood);
    document.getElementById('mood-display').innerText = currentMood;

    // Убираем выделение со всех, ставим на выбранный
    document.querySelectorAll('.mood-emoji').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}

// ==========================================
// 9. ЗАПУСК ПРИ ЗАГРУЗКЕ
// ==========================================
renderTasks();
generateCalendar();
updateTrackersUI();
updateTimerDisplay();