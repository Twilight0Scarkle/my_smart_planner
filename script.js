// 1. ПРИВЕТСТВИЕ И ДАТА
const now = new Date();
const hours = now.getHours();
let greetingText = "Доброй ночи!";
if (hours >= 5 && hours < 12) greetingText = "Доброе утро!";
else if (hours >= 12 && hours < 18) greetingText = "Добрый день!";
else if (hours >= 18 && hours < 23) greetingText = "Добрый вечер!";

document.getElementById('greeting').innerText = greetingText;
document.getElementById('current-date').innerText = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
function showTab(tabName) {
    document.getElementById('tab-tasks').style.display = 'none';
    document.getElementById('tab-calendar').style.display = 'none';
    document.getElementById('btn-tasks').classList.remove('active');
    document.getElementById('btn-calendar').classList.remove('active');

    if (tabName === 'tasks') {
        document.getElementById('tab-tasks').style.display = 'block';
        document.getElementById('btn-tasks').classList.add('active');
    } else {
        document.getElementById('tab-calendar').style.display = 'block';
        document.getElementById('btn-calendar').classList.add('active');
    }
}

// 3. ЛОГИКА ЗАДАЧ
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const progressCount = document.getElementById('progress-count');
const progressFill = document.getElementById('progress-fill');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    taskList.innerHTML = '';
    let completedCount = 0;

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) {
            li.classList.add('completed');
            completedCount++;
        }

        // Цветная полоска
        const colorBar = document.createElement('div');
        colorBar.style.width = '5px';
        colorBar.style.height = '30px';
        colorBar.style.borderRadius = '5px';
        colorBar.style.marginRight = '10px';
        colorBar.style.position = 'absolute';
        colorBar.style.left = '0';
        if (task.category === 'работа') colorBar.style.backgroundColor = '#bb86fc';
        else if (task.category === 'учеба') colorBar.style.backgroundColor = '#03dac6';
        else colorBar.style.backgroundColor = '#ffb74d';
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

// Запуск при загрузке
renderTasks(<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мой умный планер</title>
    <!-- Подключаем наши стили -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Меню навигации -->
    <div class="nav-menu">
        <button onclick="showTab('tasks')" id="btn-tasks" class="nav-btn active">📝 Мои задачи</button>
        <button onclick="showTab('calendar')" id="btn-calendar" class="nav-btn">📅 Календарь</button>
    </div>

    <!-- Экран 1: Задачи -->
    <div class="planner-container" id="tab-tasks">
        <h2 id="greeting">Привет!</h2>
        <div class="date-display" id="current-date"></div>

        <!-- Прогресс -->
        <div class="progress-container">
            <div class="progress-text">
                <span>Прогресс дня:</span>
                <span id="progress-count">0 / 0</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" id="progress-fill"></div>
            </div>
        </div>

        <!-- Ввод -->
        <div class="input-group">
            <input type="text" id="task-input" placeholder="Что нужно сделать?" autocomplete="off">
            <select id="task-category">
                <option value="работа">💼 Работа</option>
                <option value="учеба">📚 Учеба</option>
                <option value="личное">🏠 Личное</option>
            </select>
            <button onclick="addTask()">+</button>
        </div>

        <ul id="task-list"></ul>

        <button class="clear-btn" onclick="clearCompleted()">Удалить выполненные</button>
    </div>

       <!-- Экран 2: Календарь -->
    <div class="planner-container" id="tab-calendar" style="max-width: 800px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2>Календарь</h2>
            <div style="font-size: 18px; font-weight: bold; color: #bb86fc;" id="calendar-month-year">Загрузка...</div>
        </div>

        <!-- Сетка календаря -->
        <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center;">
            <!-- Дни недели -->
            <div style="color: #888; font-weight: bold;">Пн</div>
            <div style="color: #888; font-weight: bold;">Вт</div>
            <div style="color: #888; font-weight: bold;">Ср</div>
            <div style="color: #888; font-weight: bold;">Чт</div>
            <div style="color: #888; font-weight: bold;">Пт</div>
            <div style="color: #888; font-weight: bold;">Сб</div>
            <div style="color: #888; font-weight: bold;">Вс</div>
            <!-- Сюда JavaScript вставит сами дни -->
        </div>
    </div>

    <!-- Подключаем наш скрипт в самом конце! -->
    <script src="script.js"></script>
</body>
</html>);