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
    if (progressCount) progressCount.innerText = `${completedCount} / ${total}`;
    const percent = total === 0 ? 0 : (completedCount / total) * 100;
    if (progressFill) progressFill.style.width = `${percent}%`;
}

function addTask() {
    const text = taskInput.value.trim();
    const category = document.getElementById('task-category').value;
    const date = document.getElementById('task-date').value; // Новая строчка

    if (text !== '') {
        tasks.push({ text: text, completed: false, category: category, date: date }); // Добавили date
        taskInput.value = '';
        renderTasks();
    }
}

if(taskInput) {
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTask();
    });
}

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

// 4. ЛОГИКА КАЛЕНДАРЯ
function generateCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearDisplay = document.getElementById('calendar-month-year');

    if (!grid) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    if (monthYearDisplay) monthYearDisplay.innerText = `${months[currentMonth]} ${currentYear}`;

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

// ЗАПУСК ПРИ ЗАГРУЗКЕ
renderTasks();
generateCalendar();