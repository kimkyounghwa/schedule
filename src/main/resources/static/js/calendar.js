// 달력 페이지 JavaScript

let currentYear;
let currentMonth;
let selectedDate = null;
let schedules = [];
let categories = [];
let currentScheduleId = null;

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;
    
    initCalendar();
    loadCategories();
    
    // 월 네비게이션 이벤트
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        renderCalendar();
        loadMonthSchedules();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        renderCalendar();
        loadMonthSchedules();
    });

    // 시간 선택 버튼 이벤트
    document.querySelectorAll('.btn-time-select').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.btn-time-select').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('addScheduleTime').value = this.dataset.time;
        });
    });
});

function initCalendar() {
    renderCalendar();
    loadMonthSchedules();
}

function loadCategories() {
    fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                categories = data.data;
                renderCategoryButtons();
            }
        })
        .catch(err => console.error('카테고리 로드 실패:', err));
}

function renderCategoryButtons() {
    const container = document.getElementById('categoryButtons');
    const mainCategories = categories.filter(c => c.name === '병원' || c.name === '약 복용' || c.name === '운동');
    
    container.innerHTML = mainCategories.map(cat => `
        <button type="button" class="btn btn-category" data-id="${cat.id}" data-name="${cat.name}">
            ${cat.icon} ${cat.name}
        </button>
    `).join('');

    // 카테고리 버튼 이벤트
    container.querySelectorAll('.btn-category').forEach(btn => {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.btn-category').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('addScheduleCategory').value = this.dataset.id;
        });
    });
}

function loadMonthSchedules() {
    fetch(`/api/schedules/month?year=${currentYear}&month=${currentMonth}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                schedules = data.data;
                renderCalendar();
                
                // 선택된 날짜가 있으면 해당 날짜 일정도 업데이트
                if (selectedDate) {
                    showDateSchedules(selectedDate);
                }
            }
        })
        .catch(err => console.error('일정 로드 실패:', err));
}

function renderCalendar() {
    // 월 표시 업데이트
    document.getElementById('currentMonth').textContent = `${currentYear}년 ${currentMonth}월`;
    
    const grid = document.getElementById('calendarGrid');
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const today = new Date();
    const todayStr = formatDate(today);
    
    let html = '';
    
    // 이전 달 날짜
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        html += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
    }
    
    // 현재 달 날짜
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
        
        let classes = ['calendar-day'];
        if (dateStr === todayStr) classes.push('today');
        if (selectedDate === dateStr) classes.push('selected');
        if (dayOfWeek === 0) classes.push('sunday');
        if (dayOfWeek === 6) classes.push('saturday');
        
        // 해당 날짜의 일정
        const daySchedules = schedules.filter(s => s.scheduleDate === dateStr);
        
        let dotsHtml = '';
        let countHtml = '';
        
        if (daySchedules.length > 0) {
            const hasHospital = daySchedules.some(s => s.categoryName === '병원');
            const hasMedicine = daySchedules.some(s => s.categoryName === '약 복용');
            
            dotsHtml = '<div class="day-dots">';
            if (hasHospital) dotsHtml += '<span class="day-dot hospital"></span>';
            if (hasMedicine) dotsHtml += '<span class="day-dot medicine"></span>';
            if (daySchedules.some(s => s.categoryName !== '병원' && s.categoryName !== '약 복용')) {
                dotsHtml += '<span class="day-dot other"></span>';
            }
            dotsHtml += '</div>';
            
            if (daySchedules.length > 1) {
                countHtml = `<span class="day-count">${daySchedules.length}</span>`;
            }
        }
        
        html += `
            <div class="${classes.join(' ')}" onclick="selectDate('${dateStr}')">
                <span class="day-number">${day}</span>
                ${dotsHtml}
                ${countHtml}
            </div>
        `;
    }
    
    // 다음 달 날짜
    const totalCells = startDayOfWeek + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
        html += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
    }
    
    grid.innerHTML = html;
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
    showDateSchedules(dateStr);
}

function showDateSchedules(dateStr) {
    const section = document.getElementById('selectedDateSection');
    const titleEl = document.getElementById('selectedDateTitle');
    const listEl = document.getElementById('selectedDateList');
    
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    titleEl.textContent = `${month}월 ${day}일 (${weekday})`;
    
    const daySchedules = schedules.filter(s => s.scheduleDate === dateStr);
    
    if (daySchedules.length === 0) {
        listEl.innerHTML = '<div class="text-center text-muted py-4">일정이 없습니다</div>';
    } else {
        listEl.innerHTML = daySchedules.map(schedule => `
            <div class="schedule-item" onclick="openScheduleDetail('${schedule.id}')">
                <div class="icon">${schedule.categoryIcon || '📅'}</div>
                <div class="info">
                    <div class="title">${schedule.title}</div>
                    <div class="time">${formatTime(schedule.scheduleTime)}</div>
                </div>
                <div class="status-btn ${schedule.status === 'COMPLETED' ? 'completed' : ''}" 
                     onclick="event.stopPropagation(); toggleStatus('${schedule.id}', '${schedule.status}')">
                    ${schedule.status === 'COMPLETED' ? '✓' : '○'}
                </div>
            </div>
        `).join('');
    }
    
    section.style.display = 'block';
    document.getElementById('addScheduleDate').value = dateStr;
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    if (hour < 12) {
        return `오전 ${hour}시${minutes !== '00' ? ' ' + minutes + '분' : ''}`;
    } else if (hour === 12) {
        return `낮 12시${minutes !== '00' ? ' ' + minutes + '분' : ''}`;
    } else {
        return `오후 ${hour - 12}시${minutes !== '00' ? ' ' + minutes + '분' : ''}`;
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function openScheduleDetail(scheduleId) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    currentScheduleId = scheduleId;
    
    document.getElementById('detailIcon').textContent = schedule.categoryIcon || '📅';
    document.getElementById('detailTitle').textContent = schedule.title;
    document.getElementById('detailTime').textContent = formatTime(schedule.scheduleTime);
    document.getElementById('detailDesc').textContent = schedule.description || '';
    
    // 완료 버튼 상태
    const completeBtn = document.getElementById('btnCompleteDetail');
    if (schedule.status === 'COMPLETED') {
        completeBtn.textContent = '완료됨';
        completeBtn.disabled = true;
        completeBtn.classList.remove('btn-success');
        completeBtn.classList.add('btn-secondary');
    } else {
        completeBtn.textContent = '완료';
        completeBtn.disabled = false;
        completeBtn.classList.remove('btn-secondary');
        completeBtn.classList.add('btn-success');
    }
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleDetailModal'));
    modal.show();
}

function openScheduleModalForDate() {
    if (!selectedDate) return;
    
    // 폼 초기화
    document.getElementById('addScheduleTitle').value = '';
    document.getElementById('addScheduleCategory').value = '';
    document.getElementById('addScheduleTime').value = '';
    document.querySelectorAll('.btn-category').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.btn-time-select').forEach(b => b.classList.remove('active'));
    
    const modal = new bootstrap.Modal(document.getElementById('addScheduleModal'));
    modal.show();
}

function submitAddSchedule() {
    const categoryId = document.getElementById('addScheduleCategory').value;
    const title = document.getElementById('addScheduleTitle').value.trim();
    const scheduleDate = document.getElementById('addScheduleDate').value;
    const scheduleTime = document.getElementById('addScheduleTime').value;
    
    if (!categoryId) {
        alert('종류를 선택해주세요');
        return;
    }
    if (!title) {
        alert('제목을 입력해주세요');
        return;
    }
    
    const data = {
        categoryId: categoryId,
        title: title,
        scheduleDate: scheduleDate,
        scheduleTime: scheduleTime || null
    };
    
    fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('addScheduleModal')).hide();
            loadMonthSchedules();
        } else {
            alert(result.message || '등록에 실패했습니다');
        }
    })
    .catch(err => {
        console.error('등록 실패:', err);
        alert('등록에 실패했습니다');
    });
}

function toggleStatus(scheduleId, currentStatus) {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    
    fetch(`/api/schedules/${scheduleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            loadMonthSchedules();
        }
    })
    .catch(err => console.error('상태 변경 실패:', err));
}

function deleteScheduleFromDetail() {
    if (!currentScheduleId) return;
    
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;
    
    fetch(`/api/schedules/${currentScheduleId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('scheduleDetailModal')).hide();
            loadMonthSchedules();
        } else {
            alert(result.message || '삭제에 실패했습니다');
        }
    })
    .catch(err => {
        console.error('삭제 실패:', err);
        alert('삭제에 실패했습니다');
    });
}

function deleteAllSchedules() {
    if (!confirm('정말 모든 일정을 삭제하시겠습니까?\n삭제된 일정은 복구할 수 없습니다.')) return;
    if (!confirm('⚠️ 한 번 더 확인합니다.\n모든 일정이 영구 삭제됩니다. 계속하시겠습니까?')) return;
    
    fetch('/api/schedules/all', {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('모든 일정이 삭제되었습니다.');
            loadMonthSchedules();
            document.getElementById('selectedDateSection').style.display = 'none';
        } else {
            alert(result.message || '삭제에 실패했습니다');
        }
    })
    .catch(err => {
        console.error('전체 삭제 실패:', err);
        alert('삭제에 실패했습니다');
    });
}

function completeScheduleFromDetail() {
    if (!currentScheduleId) return;
    
    fetch(`/api/schedules/${currentScheduleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('scheduleDetailModal')).hide();
            loadMonthSchedules();
        }
    })
    .catch(err => console.error('완료 처리 실패:', err));
}
