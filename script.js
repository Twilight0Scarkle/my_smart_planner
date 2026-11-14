// --- 1. ИНИЦИАЛИЗАЦИЯ ---
const now = new Date();
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let water = parseInt(localStorage.getItem('tracker-water')) || 0;
let sport = localStorage.getItem('tracker-sport') === 'true';
let currentMood = localStorage.getItem('tracker-mood') || null;

// Таймер
let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;

// --- 2. НАВИГАЦИЯ ПО ВКЛАДКАМ ---
function showTab(tabName) {
    const tabs = ['tasks', 'progress', 'trackers', 'calendar'];
    tabs.forEach(t => {
        document.getElementById('tab-' + t).style.display = 'none';
        document.getElementById('btn-' + t).classList.remove('active');
    });
    document.getElementById('tab-' + tabName).style.display = 'block';
    document.getElementById('btn-' + tabName).classList.add('active');

    if (tabName === 'progress') updateGlobalProgress();
    if (tabName === 'calendar') renderFullYearCalendar();
}

// --- 3. ПЕРЕКЛЮЧАТЕЛЬ МАСШТАБА В ПЛАНЕРЕ ---
function changeScale(scale, btn) {
    document.querySelectorAll('.scale-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.scale-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('scale-' + scale).style.display = 'block';
    btn.classList.add('active');
}

// --- 4. ЛОГИКА ЗАДАЧ ---
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

function renderTasks() {
    taskList.innerHTML = '';
    let completed = 0;
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) { li.classList.add('completed'); completed++; }

        const colorBar = document.createElement('div');
        colorBar.style.cssText = "width:5px; height:30px; border-radius:5px; margin-right:10px; position:absolute; left:0;";
        colorBar.style.backgroundColor = task.category === 'работа' ? '#A38FBC' : (task.category === 'учеба' ? '#8ECAE6' : '#FFB74D');

        const span = document.createElement('span');
        span.className = 'task-text';
        span.innerText = task.text;
        span.onclick = () => { tasks[index].completed = !tasks[index].completed; renderTasks(); };

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.innerText = '×';
        del.onclick = () => { tasks.splice(index, 1); renderTasks(); };

        li.appendChild(colorBar); li.appendChild(span); li.appendChild(del);
        taskList.appendChild(li);
    });
    localStorage.setItem('myTasks', JSON.stringify(tasks));

    if(document.getElementById('progress-count')) {
        document.getElementById('progress-count').innerText = `${completed} / ${tasks.length}`;
        document.getElementById('progress-fill').style.width = tasks.length === 0 ? '0%' : `${(completed / tasks.length) * 100}%`;
    }
}

function addTask() {
    const text = taskInput.value.trim();
    if (text !== '') {
        tasks.push({ text: text, completed: false, category: document.getElementById('task-category').value });
        taskInput.value = '';
        renderTasks();
    }
}
taskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

// --- 5. ПРОГРЕСС ---
function updateGlobalProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById('prog-day-text').innerText = `${completed} / ${total}`;
    document.getElementById('prog-day-fill').style.width = `${percent}%`;
    // Для примера, остальные прогрессы дублируют дневной
    document.getElementById('prog-week-text').innerText = `${completed} / ${total}`;
    document.getElementById('prog-week-fill').style.width = `${percent}%`;
    document.getElementById('prog-month-text').innerText = `${completed} / ${total}`;
    document.getElementById('prog-month-fill').style.width = `${percent}%`;
    document.getElementById('prog-year-text').innerText = `${completed} / ${total}`;
    document.getElementById('prog-year-fill').style.width = `${percent}%`;
}

// --- 6. ТРЕКЕРЫ И ПОМОДОРО ---
function addWater() { water++; localStorage.setItem('tracker-water', water); document.getElementById('water-count').innerText = water; }
function toggleSport() {
    sport = !sport; localStorage.setItem('tracker-sport', sport);
    const el = document.getElementById('sport-status');
    el.innerText = sport ? "Да ✅" : "Нет ❌";
    el.style.color = sport ? "#8ECAE6" : "#4A4A4A";
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
    document.getElementById('timer-display').innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
function startTimer() {
    const btn = document.getElementById('timer-btn');
    if (isRunning) { clearInterval(timerInterval); btn.innerText = "Продолжить"; isRunning = false; return; }
    isRunning = true; btn.innerText = "Пауза";
    timerInterval = setInterval(() => {
        if (timeLeft > 0) { timeLeft--; updateTimerDisplay(); }
        else { clearInterval(timerInterval); alert("Время вышло!"); startTimer(); resetTimer(); }
    }, 1000);
}
function resetTimer() { clearInterval(timerInterval); isRunning = false; timeLeft = 25 * 60; updateTimerDisplay(); document.getElementById('timer-btn').innerText = "Старт"; }

// --- 7. КАЛЕНДАРЬ НА ГОД ---
function renderFullYearCalendar() {
    const container = document.getElementById('full-year-calendar');
    if (container.innerHTML !== '') return; // Рисуем только один раз

    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const year = now.getFullYear();

    for (let m = 0; m < 12; m++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-card';

        let html = `<h4>${months[m]}</h4><div class="month-days-grid">`;
        // Дни недели
        ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => html += `<div style="font-weight:bold; color:#aaa;">${d}</div>`);

        const firstDay = new Date(year, m, 1).getDay();
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        let emptyCells = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < emptyCells; i++) html += `<div class="empty"></div>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === now.getDate() && m === now.getMonth();
            html += `<div class="${isToday ? 'today' : ''}">${d}</div>`;
        }
        html += `</div>`;
        monthDiv.innerHTML = html;
        container.appendChild(monthDiv);
    }
}

// --- 8. ЗАПУСК ---
renderTasks();
updateTimerDisplay();