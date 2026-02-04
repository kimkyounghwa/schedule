// 시니어 일정 관리 앱 - 메인 JavaScript

const API_BASE = '/api';
let categories = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    setTodayDate();
    await loadCategories();
    await loadTodaySchedules();
    await loadWeekSchedules();
});

// 오늘 날짜 표시
function setTodayDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('ko-KR', options);
    
    // 날짜 입력 기본값 설정
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('quickDate').value = dateStr;
    document.getElementById('scheduleDate').value = dateStr;
    
    // 날짜/시간 선택 UI 초기화
    initDateTimePickers();
}

// 시니어 친화적 날짜/시간 선택 UI 초기화
function initDateTimePickers() {
    // 빠른 등록 모달 - 날짜 선택
    document.querySelectorAll('#quickModal .date-picker-simple .btn-date-option').forEach(btn => {
        btn.addEventListener('click', function() {
            handleDateSelect(this, 'quick');
        });
    });
    
    // 빠른 등록 모달 - 시간 선택
    document.querySelectorAll('#quickModal .time-picker-simple .btn-time-option').forEach(btn => {
        btn.addEventListener('click', function() {
            handleTimeSelect(this, 'quick');
        });
    });
    
    // 일정 모달 - 날짜 선택
    document.querySelectorAll('#scheduleModal .date-picker-simple .btn-date-option').forEach(btn => {
        btn.addEventListener('click', function() {
            handleDateSelect(this, 'schedule');
        });
    });
    
    // 일정 모달 - 시간 선택
    document.querySelectorAll('#scheduleModal .time-picker-simple .btn-time-option').forEach(btn => {
        btn.addEventListener('click', function() {
            handleTimeSelect(this, 'schedule');
        });
    });
    
    // 직접 선택 날짜 변경 이벤트
    document.getElementById('quickCustomDate')?.addEventListener('change', function() {
        document.getElementById('quickDate').value = this.value;
        updateDateDisplay('quick', this.value);
    });
    
    document.getElementById('scheduleCustomDate')?.addEventListener('change', function() {
        document.getElementById('scheduleDate').value = this.value;
        updateDateDisplay('schedule', this.value);
    });
    
    // 직접 선택 시간 변경 이벤트
    document.getElementById('quickHour')?.addEventListener('change', function() {
        updateCustomTime('quick');
    });
    document.getElementById('quickMinute')?.addEventListener('change', function() {
        updateCustomTime('quick');
    });
    document.getElementById('scheduleHour')?.addEventListener('change', function() {
        updateCustomTime('schedule');
    });
    document.getElementById('scheduleMinute')?.addEventListener('change', function() {
        updateCustomTime('schedule');
    });
    
    // 초기 날짜 표시
    updateDateDisplay('quick', document.getElementById('quickDate').value);
    updateDateDisplay('schedule', document.getElementById('scheduleDate').value);
}

// 날짜 선택 처리
function handleDateSelect(btn, prefix) {
    const container = btn.closest('.date-picker-simple');
    container.querySelectorAll('.btn-date-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const days = btn.dataset.days;
    const customWrap = document.getElementById(`${prefix}CustomDateWrap`);
    
    if (days === 'custom') {
        customWrap.style.display = 'block';
        const customDate = document.getElementById(`${prefix}CustomDate`);
        if (customDate.value) {
            document.getElementById(`${prefix}Date`).value = customDate.value;
            updateDateDisplay(prefix, customDate.value);
        }
    } else {
        customWrap.style.display = 'none';
        const date = new Date();
        date.setDate(date.getDate() + parseInt(days));
        const dateStr = date.toISOString().split('T')[0];
        document.getElementById(`${prefix}Date`).value = dateStr;
        updateDateDisplay(prefix, dateStr);
    }
}

// 시간 선택 처리
function handleTimeSelect(btn, prefix) {
    const container = btn.closest('.time-picker-simple');
    container.querySelectorAll('.btn-time-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const time = btn.dataset.time;
    const customWrap = document.getElementById(`${prefix}CustomTimeWrap`);
    
    if (time === 'custom') {
        customWrap.style.display = 'block';
        updateCustomTime(prefix);
    } else {
        customWrap.style.display = 'none';
        document.getElementById(`${prefix}Time`).value = time;
        updateTimeDisplay(prefix, time);
    }
}

// 직접 선택 시간 업데이트
function updateCustomTime(prefix) {
    const hour = document.getElementById(`${prefix}Hour`).value;
    const minute = document.getElementById(`${prefix}Minute`).value;
    
    if (hour) {
        const timeStr = `${hour}:${minute}`;
        document.getElementById(`${prefix}Time`).value = timeStr;
        updateTimeDisplay(prefix, timeStr);
    }
}

// 날짜 표시 업데이트
function updateDateDisplay(prefix, dateStr) {
    if (!dateStr) return;
    const display = document.getElementById(`${prefix}DateDisplay`);
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    display.textContent = '📅 ' + date.toLocaleDateString('ko-KR', options);
}

// 시간 표시 업데이트
function updateTimeDisplay(prefix, timeStr) {
    const display = document.getElementById(`${prefix}TimeDisplay`);
    if (!timeStr) {
        display.textContent = '';
        return;
    }
    display.textContent = '⏰ ' + formatTime(timeStr);
}

// 카테고리 로드
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const result = await response.json();
        if (result.success) {
            categories = result.data;
            renderCategorySelect();
        }
    } catch (e) {
        console.error('카테고리 로드 실패', e);
    }
}

// 카테고리 셀렉트 렌더링
function renderCategorySelect() {
    const select = document.getElementById('scheduleCategory');
    select.innerHTML = '<option value="">카테고리 선택</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
    });
}

// 오늘 일정 로드
async function loadTodaySchedules() {
    try {
        const response = await fetch(`${API_BASE}/schedules/today`);
        const result = await response.json();
        if (result.success) {
            renderScheduleList('todayList', result.data);
            document.getElementById('todayCount').textContent = result.data.length;
        }
    } catch (e) {
        console.error('오늘 일정 로드 실패', e);
    }
}

// 이번 주 일정 로드
async function loadWeekSchedules() {
    try {
        const response = await fetch(`${API_BASE}/schedules/week`);
        const result = await response.json();
        if (result.success) {
            renderScheduleList('weekList', result.data, true);
        }
    } catch (e) {
        console.error('이번 주 일정 로드 실패', e);
    }
}

// 일정 목록 렌더링
function renderScheduleList(containerId, schedules, showDate = false) {
    const container = document.getElementById(containerId);
    
    if (!schedules || schedules.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">일정이 없습니다</div>';
        return;
    }
    
    container.innerHTML = '';
    
    let currentDate = '';
    schedules.forEach(schedule => {
        // 날짜 구분선 (주간 보기에서)
        if (showDate && schedule.scheduleDate !== currentDate) {
            currentDate = schedule.scheduleDate;
            const dateDiv = document.createElement('div');
            dateDiv.className = 'px-3 py-2 bg-light';
            dateDiv.innerHTML = `<span class="date-badge">${formatDate(schedule.scheduleDate)}</span>`;
            container.appendChild(dateDiv);
        }
        
        const item = createScheduleItem(schedule);
        container.appendChild(item);
    });
}

// 일정 아이템 생성
function createScheduleItem(schedule) {
    const div = document.createElement('div');
    div.className = `schedule-item ${schedule.status === 'COMPLETED' ? 'completed' : ''}`;
    div.onclick = () => openScheduleDetail(schedule);
    
    const iconClass = getCategoryIconClass(schedule.categoryName);
    const timeStr = schedule.scheduleTime ? formatTime(schedule.scheduleTime) : '시간 미정';
    
    div.innerHTML = `
        <div class="icon ${iconClass}">${schedule.categoryIcon || '📅'}</div>
        <div class="content">
            <div class="title">${schedule.title}</div>
            <div class="time">${timeStr}</div>
        </div>
        <button class="status-btn" onclick="event.stopPropagation(); toggleStatus('${schedule.id}', '${schedule.status}')">
            ${schedule.status === 'COMPLETED' ? '✓' : ''}
        </button>
    `;
    
    return div;
}

// 카테고리별 아이콘 클래스
function getCategoryIconClass(categoryName) {
    const map = {
        '병원': 'icon-hospital',
        '약 복용': 'icon-medicine',
        '운동': 'icon-exercise',
        '가족': 'icon-family'
    };
    return map[categoryName] || 'icon-other';
}

// 날짜 포맷
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'long', day: 'numeric', weekday: 'short' };
    return date.toLocaleDateString('ko-KR', options);
}

// 시간 포맷
function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour < 12 ? '오전' : '오후';
    const hour12 = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return `${ampm} ${hour12}:${m}`;
}

// 상태 토글
async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    
    try {
        const response = await fetch(`${API_BASE}/schedules/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        if (result.success) {
            await loadTodaySchedules();
            await loadWeekSchedules();
        } else {
            alert('상태 변경에 실패했습니다.');
        }
    } catch (e) {
        console.error('상태 변경 실패', e);
        alert('상태 변경에 실패했습니다.');
    }
}

// 빠른 등록 모달 열기
function openQuickModal(type) {
    const titles = {
        'hospital': '🏥 병원 일정 등록',
        'medicine': '💊 약 복용 등록',
        'exercise': '🏃 운동 일정 등록'
    };
    const placeholders = {
        'hospital': '예: 내과 진료, 건강검진',
        'medicine': '예: 혈압약, 당뇨약',
        'exercise': '예: 산책, 체조'
    };
    
    document.getElementById('quickModalTitle').textContent = titles[type];
    document.getElementById('quickTitle').placeholder = placeholders[type];
    document.getElementById('quickType').value = type;
    document.getElementById('quickTitle').value = '';
    document.getElementById('quickRecurring').checked = type === 'medicine';
    
    // 날짜/시간 선택 초기화
    resetDateTimePicker('quick');
    
    const modal = new bootstrap.Modal(document.getElementById('quickModal'));
    modal.show();
}

// 날짜/시간 선택 UI 초기화
function resetDateTimePicker(prefix) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // 날짜 초기화 - 오늘 선택
    document.getElementById(`${prefix}Date`).value = dateStr;
    const dateContainer = document.querySelector(`#${prefix}Modal .date-picker-simple`);
    if (dateContainer) {
        dateContainer.querySelectorAll('.btn-date-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.days === '0') btn.classList.add('active');
        });
    }
    document.getElementById(`${prefix}CustomDateWrap`).style.display = 'none';
    updateDateDisplay(prefix, dateStr);
    
    // 시간 초기화 - 선택 안함
    document.getElementById(`${prefix}Time`).value = '';
    const timeContainer = document.querySelector(`#${prefix}Modal .time-picker-simple`);
    if (timeContainer) {
        timeContainer.querySelectorAll('.btn-time-option').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    document.getElementById(`${prefix}CustomTimeWrap`).style.display = 'none';
    document.getElementById(`${prefix}TimeDisplay`).textContent = '';
}

// 빠른 등록 제출
async function submitQuickForm() {
    const type = document.getElementById('quickType').value;
    const title = document.getElementById('quickTitle').value.trim();
    const date = document.getElementById('quickDate').value;
    const time = document.getElementById('quickTime').value;
    const isRecurring = document.getElementById('quickRecurring').checked;
    
    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    const data = {
        title: title,
        scheduleDate: date,
        scheduleTime: time || null,
        isRecurring: isRecurring,
        recurringType: isRecurring ? 'DAILY' : null
    };
    
    try {
        const response = await fetch(`${API_BASE}/schedules/quick/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('quickModal')).hide();
            await loadTodaySchedules();
            await loadWeekSchedules();
            alert('일정이 등록되었습니다!');
        } else {
            alert(result.message || '등록에 실패했습니다.');
        }
    } catch (e) {
        console.error('빠른 등록 실패', e);
        alert('등록에 실패했습니다.');
    }
}

// 일정 등록 모달 열기
function openScheduleModal() {
    document.getElementById('scheduleModalTitle').textContent = '일정 등록';
    document.getElementById('scheduleId').value = '';
    document.getElementById('scheduleCategory').value = '';
    document.getElementById('scheduleTitle').value = '';
    document.getElementById('scheduleDesc').value = '';
    document.getElementById('btnDeleteSchedule').style.display = 'none';
    
    // 날짜/시간 선택 초기화
    resetDateTimePicker('schedule');
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
}

// 일정 상세 보기
function openScheduleDetail(schedule) {
    document.getElementById('scheduleModalTitle').textContent = '일정 수정';
    document.getElementById('scheduleId').value = schedule.id;
    document.getElementById('scheduleCategory').value = schedule.categoryId;
    document.getElementById('scheduleTitle').value = schedule.title;
    document.getElementById('scheduleDate').value = schedule.scheduleDate;
    document.getElementById('scheduleTime').value = schedule.scheduleTime || '';
    document.getElementById('scheduleDesc').value = schedule.description || '';
    document.getElementById('btnDeleteSchedule').style.display = 'block';
    
    // 날짜/시간 선택 UI 업데이트
    setDateTimePickerValue('schedule', schedule.scheduleDate, schedule.scheduleTime);
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
}

// 날짜/시간 선택 UI에 값 설정 (수정 시)
function setDateTimePickerValue(prefix, dateStr, timeStr) {
    // 날짜 설정
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(dateStr);
    scheduleDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((scheduleDate - today) / (1000 * 60 * 60 * 24));
    
    const dateContainer = document.querySelector(`#${prefix}Modal .date-picker-simple`);
    if (dateContainer) {
        dateContainer.querySelectorAll('.btn-date-option').forEach(btn => {
            btn.classList.remove('active');
            if (diffDays >= 0 && diffDays <= 2 && btn.dataset.days === String(diffDays)) {
                btn.classList.add('active');
            } else if ((diffDays < 0 || diffDays > 2) && btn.dataset.days === 'custom') {
                btn.classList.add('active');
            }
        });
    }
    
    // 직접 선택인 경우 날짜 입력 표시
    if (diffDays < 0 || diffDays > 2) {
        document.getElementById(`${prefix}CustomDateWrap`).style.display = 'block';
        document.getElementById(`${prefix}CustomDate`).value = dateStr;
    } else {
        document.getElementById(`${prefix}CustomDateWrap`).style.display = 'none';
    }
    updateDateDisplay(prefix, dateStr);
    
    // 시간 설정
    const timeContainer = document.querySelector(`#${prefix}Modal .time-picker-simple`);
    if (timeContainer) {
        timeContainer.querySelectorAll('.btn-time-option').forEach(btn => {
            btn.classList.remove('active');
            if (timeStr && btn.dataset.time === timeStr) {
                btn.classList.add('active');
            }
        });
        
        // 프리셋에 없는 시간인 경우 직접 선택
        const presetTimes = ['08:00', '12:00', '18:00'];
        if (timeStr && !presetTimes.includes(timeStr)) {
            timeContainer.querySelector('[data-time="custom"]')?.classList.add('active');
            document.getElementById(`${prefix}CustomTimeWrap`).style.display = 'block';
            const [hour, minute] = timeStr.split(':');
            document.getElementById(`${prefix}Hour`).value = hour;
            document.getElementById(`${prefix}Minute`).value = minute;
        } else {
            document.getElementById(`${prefix}CustomTimeWrap`).style.display = 'none';
        }
    }
    
    if (timeStr) {
        updateTimeDisplay(prefix, timeStr);
    } else {
        document.getElementById(`${prefix}TimeDisplay`).textContent = '';
    }
}

// 일정 저장
async function submitScheduleForm() {
    const id = document.getElementById('scheduleId').value;
    const categoryId = document.getElementById('scheduleCategory').value;
    const title = document.getElementById('scheduleTitle').value.trim();
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const desc = document.getElementById('scheduleDesc').value.trim();
    
    if (!categoryId || !title || !date) {
        alert('카테고리, 제목, 날짜는 필수입니다.');
        return;
    }
    
    const data = {
        categoryId: categoryId,
        title: title,
        scheduleDate: date,
        scheduleTime: time || null,
        description: desc || null,
        remindBefore: 30,
        isRecurring: false
    };
    
    try {
        const url = id ? `${API_BASE}/schedules/${id}` : `${API_BASE}/schedules`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
            await loadTodaySchedules();
            await loadWeekSchedules();
            alert(id ? '일정이 수정되었습니다!' : '일정이 등록되었습니다!');
        } else {
            alert(result.message || '저장에 실패했습니다.');
        }
    } catch (e) {
        console.error('일정 저장 실패', e);
        alert('저장에 실패했습니다.');
    }
}

// 일정 삭제
async function deleteSchedule() {
    const id = document.getElementById('scheduleId').value;
    
    if (!confirm('이 일정을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/schedules/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
            await loadTodaySchedules();
            await loadWeekSchedules();
            alert('일정이 삭제되었습니다.');
        } else {
            alert(result.message || '삭제에 실패했습니다.');
        }
    } catch (e) {
        console.error('일정 삭제 실패', e);
        alert('삭제에 실패했습니다.');
    }
}
