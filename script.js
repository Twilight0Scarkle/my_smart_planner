// --- 1. ИНИЦИАЛИЗАЦИЯ ---
const now = new Date();
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let trackers = JSON.parse(localStorage.getItem('myTrackers')) || [];

document.getElementById('greeting').innerText = now.getHours() < 12 ? "Доброе утро!" : (now.getHours() < 18 ? "Добрый день!" : "Добрый вечер!");
document.getElementById('current-date').innerText = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// --- 2. НАВИГАЦИЯ ---
function showTab(tabName) {
    ['tasks', 'progress', 'trackers', 'calendar'].forEach(t => {
        document.getElementById('tab-' + t).style.display = 'none';
        document.getElementById('btn-' + t).classList.remove('active');
    });
    document.getElementById('tab-' + tabName).style.display = 'block';
    document.getElementById('btn-' + tabName).classList.add('active');

    if (tabName === 'progress') renderCharts();
    if (tabName === 'calendar') renderFullYearCalendar();
    if (tabName === 'trackers') renderTrackers();
}

function changeScale(scale, btn) {
    document.querySelectorAll('.scale-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.scale-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('scale-' + scale).style.display = 'block';
    btn.classList.add('active');
}

// --- 3. ЗАДАЧИ ---
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

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

// --- 4. ДИАГРАММЫ ПРОГРЕССА ---
let charts = {};

function renderCharts() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const chartConfig = (id, label, color) => {
        if (charts[id]) charts[id].destroy();
        const ctx = document.getElementById(id).getContext('2d');
        charts[id] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Выполнено', 'Осталось'],
                datasets: [{ data: [percent, 100 - percent], backgroundColor: [color, '#EAE6F0'], borderWidth: 0, cutout: '75%' }]
            },
            options: { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateScale: true } }
        });
    };

    chartConfig('chart-day', 'День', '#A38FBC');
    chartConfig('chart-week', 'Неделя', '#8ECAE6');
    chartConfig('chart-month', 'Месяц', '#FFB74D');
    chartConfig('chart-year', 'Год', '#D1A8B7');

    setTimeout(() => {
        document.querySelectorAll('.chart-card').forEach(card => {
            if(!card.querySelector('.percent-text')) {
                const txt = document.createElement('div');
                txt.className = 'percent-text';
                txt.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:20px; font-weight:bold; color:var(--primary); pointer-events:none;';
                txt.innerText = percent + '%';
                card.appendChild(txt);
            } else {
                card.querySelector('.percent-text').innerText = percent + '%';
            }
        });
    }, 100);
}

// --- 5. КАСТОМНЫЕ ТРЕКЕРЫ ---
function renderTrackers() {
    const container = document.getElementById('custom-trackers-container');
    container.innerHTML = '';

    if (trackers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; width:100%;">У тебя пока нет трекеров.</p>';
        return;
    }

    trackers.forEach((tracker, index) => {
        const card = document.createElement('div');
        card.className = 'custom-tracker-card';
        card.innerHTML = `
            <h3>${tracker.name}</h3>
            <div class="progress-text">${tracker.current} / ${tracker.goal}</div>
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${(tracker.current/tracker.goal)*100}%; background-color: var(--primary);"></div></div>
            <div class="tracker-controls">
                <button onclick="updateTracker(${index}, -1)">-</button>
                <button onclick="updateTracker(${index}, 1)">+</button>
            </div>
            <button class="delete-tracker" style="background:none; border:none; color:#D1A8B7; cursor:pointer; margin-top:10px; font-size:12px;" onclick="deleteTracker(${index})">Удалить</button>
        `;
        container.appendChild(card);
    });
}

function createTracker() {
    const name = document.getElementById('new-tracker-name').value.trim();
    const goal = parseInt(document.getElementById('new-tracker-goal').value);
    if (name && goal > 0) {
        trackers.push({ name: name, goal: goal, current: 0 });
        localStorage.setItem('myTrackers', JSON.stringify(trackers));
        document.getElementById('new-tracker-name').value = '';
        document.getElementById('new-tracker-goal').value = '';
        renderTrackers();
    }
}

function updateTracker(index, amount) {
    trackers[index].current += amount;
    if (trackers[index].current < 0) trackers[index].current = 0;
    if (trackers[index].current > trackers[index].goal) trackers[index].current = trackers[index].goal;
    localStorage.setItem('myTrackers', JSON.stringify(trackers));
    renderTrackers();
}

function deleteTracker(index) {
    trackers.splice(index, 1);
    localStorage.setItem('myTrackers', JSON.stringify(trackers));
    renderTrackers();
}

// --- 6. КАЛЕНДАРЬ НА ГОД ---
function renderFullYearCalendar() {
    const container = document.getElementById('full-year-calendar');
    if (container.innerHTML !== '') return;

    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const year = now.getFullYear();

    for (let m = 0; m < 12; m++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-card';
        let html = `<h4>${months[m]}</h4><div class="month-days-grid">`;
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

// Запуск
renderTasks();
renderTrackers();