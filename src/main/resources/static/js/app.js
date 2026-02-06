// 시니어 일정 관리 앱 - 메인 JavaScript

const API_BASE = '/api';
let categories = [];
let weekListCollapsed = false;

// 이번 주 일정 접기/펼치기
function toggleWeekList() {
    const weekList = document.getElementById('weekList');
    const toggleBtn = document.getElementById('weekToggle');
    
    weekListCollapsed = !weekListCollapsed;
    
    if (weekListCollapsed) {
        weekList.classList.add('collapsed');
        toggleBtn.textContent = '펼치기 ▼';
    } else {
        weekList.classList.remove('collapsed');
        toggleBtn.textContent = '접기 ▲';
    }
}

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
    // 빠른 등록 모달 - 날짜 선택 (btn-group-compact)
    document.querySelectorAll('#quickModal .btn-group-compact .btn-date-option').forEach(btn => {
        btn.addEventListener('click', function() {
            handleDateSelect(this, 'quick');
        });
    });
    
    // 빠른 등록 모달 - 시간 선택 (약복용: 중복 선택, 병원: 단일 선택)
    document.querySelectorAll('#quickModal .btn-group-compact .btn-time-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = document.getElementById('quickType').value;
            if (type === 'medicine') {
                // 약복용: 중복 선택 (토글)
                this.classList.toggle('active');
            } else {
                // 병원 등: 단일 선택
                handleTimeSelectCompact(this, 'quick');
            }
        });
    });
    
    // 빠른 등록 모달 - 반복 옵션
    document.querySelectorAll('#quickModal .btn-repeat-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#quickModal .btn-repeat-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const repeat = this.dataset.repeat;
            if (repeat === 'NONE') {
                document.getElementById('quickRecurring').value = 'false';
                document.getElementById('quickRecurringType').value = '';
            } else {
                document.getElementById('quickRecurring').value = 'true';
                document.getElementById('quickRecurringType').value = repeat;
            }
        });
    });
    
    // 일정 모달 - 날짜 선택 (btn-group-compact)
    document.querySelectorAll('#scheduleModal .btn-group-compact .btn-date-option').forEach(btn => {
        btn.addEventListener('click', function() {
            handleDateSelect(this, 'schedule');
        });
    });
    
    // 일정 모달 - 시간 선택 (중복 선택 가능)
    document.querySelectorAll('#scheduleModal .btn-group-compact .btn-time-option').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // 직접 선택 날짜 변경 이벤트
    document.getElementById('quickCustomDate')?.addEventListener('change', function() {
        document.getElementById('quickDate').value = this.value;
    });
    
    document.getElementById('scheduleCustomDate')?.addEventListener('change', function() {
        document.getElementById('scheduleDate').value = this.value;
    });
}

// 컴팩트 시간 선택 처리 (직접 선택 없음)
function handleTimeSelectCompact(btn, prefix) {
    const container = btn.closest('.btn-group-compact');
    container.querySelectorAll('.btn-time-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${prefix}Time`).value = btn.dataset.time;
}

// 날짜 선택 처리
function handleDateSelect(btn, prefix) {
    const container = btn.closest('.date-picker-simple') || btn.closest('.btn-group-compact');
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
    if (!display) return;
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    display.textContent = '📅 ' + date.toLocaleDateString('ko-KR', options);
}

// 시간 표시 업데이트
function updateTimeDisplay(prefix, timeStr) {
    const display = document.getElementById(`${prefix}TimeDisplay`);
    if (!display) return;
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
    
    if (showDate) {
        // 주간 보기: 날짜별로 그룹화하여 한 줄씩 표시
        const grouped = {};
        schedules.forEach(s => {
            if (!grouped[s.scheduleDate]) grouped[s.scheduleDate] = [];
            grouped[s.scheduleDate].push(s);
        });
        
        Object.keys(grouped).sort().forEach(date => {
            const daySchedules = grouped[date];
            const row = document.createElement('div');
            row.className = 'week-day-row';
            
            const dateLabel = formatDate(date);
            const icons = daySchedules.map(s => s.categoryIcon || '📅').join(' ');
            const titles = daySchedules.map(s => s.title).join(', ');
            const count = daySchedules.length;
            
            row.innerHTML = `
                <span class="week-date">${dateLabel}</span>
                <span class="week-icons">${icons}</span>
                <span class="week-titles">${titles}</span>
                <span class="week-count">${count}건</span>
            `;
            row.onclick = () => showDayDetail(date, daySchedules);
            container.appendChild(row);
        });
    } else {
        // 오늘 일정: 기존 방식
        schedules.forEach(schedule => {
            const item = createScheduleItem(schedule);
            container.appendChild(item);
        });
    }
}

// 날짜 클릭 시 해당 날짜 일정 상세 표시
function showDayDetail(date, daySchedules) {
    const container = document.getElementById('weekList');
    
    // 이미 상세가 열려있으면 다시 주간 목록으로
    if (container.querySelector('.day-detail-view')) {
        loadWeekSchedules();
        return;
    }
    
    const detailDiv = document.createElement('div');
    detailDiv.className = 'day-detail-view';
    detailDiv.innerHTML = `<div class="day-detail-header">
        <span class="day-detail-date">${formatDate(date)}</span>
        <button class="btn-toggle" onclick="loadWeekSchedules()">← 목록</button>
    </div>`;
    
    daySchedules.forEach(schedule => {
        const item = createScheduleItem(schedule);
        detailDiv.appendChild(item);
    });
    
    container.innerHTML = '';
    container.appendChild(detailDiv);
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
    
    // 시간 힌트: 약복용은 중복 선택 가능
    const timeHint = document.getElementById('quickTimeHint');
    if (timeHint) {
        timeHint.textContent = type === 'medicine' ? '(중복 선택 가능)' : '';
    }
    
    // 반복 섹션: 약 복용일 때만 표시
    const recurringSection = document.getElementById('quickRecurringSection');
    if (type === 'medicine') {
        recurringSection.style.display = 'block';
        // 기본값: 3일 반복
        document.getElementById('quickRecurring').value = 'true';
        document.getElementById('quickRecurringType').value = 'DAILY_3';
        document.querySelectorAll('#quickModal .btn-repeat-option').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.repeat === 'DAILY_3') b.classList.add('active');
        });
    } else {
        recurringSection.style.display = 'none';
        document.getElementById('quickRecurring').value = 'false';
        document.getElementById('quickRecurringType').value = '';
    }
    
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
    const dateContainer = document.querySelector(`#${prefix}Modal .date-picker-simple`) 
                       || document.querySelector(`#${prefix}Modal .btn-group-compact`);
    if (dateContainer) {
        dateContainer.querySelectorAll('.btn-date-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.days === '0') btn.classList.add('active');
        });
    }
    const customDateWrap = document.getElementById(`${prefix}CustomDateWrap`);
    if (customDateWrap) customDateWrap.style.display = 'none';
    const dateDisplay = document.getElementById(`${prefix}DateDisplay`);
    if (dateDisplay) updateDateDisplay(prefix, dateStr);
    
    // 시간 초기화 - 선택 안함
    document.getElementById(`${prefix}Time`).value = '';
    const timeContainer = document.querySelector(`#${prefix}Modal .time-picker-simple`);
    if (timeContainer) {
        timeContainer.querySelectorAll('.btn-time-option').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    // 컴팩트 시간 버튼 초기화
    document.querySelectorAll(`#${prefix}Modal .btn-group-compact .btn-time-option`).forEach(btn => {
        btn.classList.remove('active');
    });
    const customTimeWrap = document.getElementById(`${prefix}CustomTimeWrap`);
    if (customTimeWrap) customTimeWrap.style.display = 'none';
    const timeDisplay = document.getElementById(`${prefix}TimeDisplay`);
    if (timeDisplay) timeDisplay.textContent = '';
}

// 빠른 등록 제출
async function submitQuickForm() {
    const type = document.getElementById('quickType').value;
    const title = document.getElementById('quickTitle').value.trim();
    const date = document.getElementById('quickDate').value;
    const isRecurring = document.getElementById('quickRecurring').value === 'true';
    const recurringType = document.getElementById('quickRecurringType').value || null;
    
    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    // 약복용: 선택된 시간들 수집 (중복 선택)
    const selectedTimes = [];
    if (type === 'medicine') {
        document.querySelectorAll('#quickTimeSection .btn-time-option.active').forEach(btn => {
            selectedTimes.push(btn.dataset.time);
        });
        if (selectedTimes.length === 0) {
            alert('시간을 하나 이상 선택해주세요.');
            return;
        }
    } else {
        const time = document.getElementById('quickTime').value;
        selectedTimes.push(time || null);
    }
    
    try {
        let successCount = 0;
        for (const time of selectedTimes) {
            const data = {
                title: title,
                scheduleDate: date,
                scheduleTime: time,
                isRecurring: isRecurring,
                recurringType: isRecurring ? recurringType : null
            };
            
            const response = await fetch(`${API_BASE}/schedules/quick/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (result.success) successCount++;
        }
        
        if (successCount > 0) {
            bootstrap.Modal.getInstance(document.getElementById('quickModal')).hide();
            await loadTodaySchedules();
            await loadWeekSchedules();
            alert('일정이 등록되었습니다!');
        } else {
            alert('등록에 실패했습니다.');
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
    
    const dateContainer = document.querySelector(`#${prefix}Modal .btn-group-compact`)
                       || document.querySelector(`#${prefix}Modal .date-picker-simple`);
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
    const customDateWrap = document.getElementById(`${prefix}CustomDateWrap`);
    if (diffDays < 0 || diffDays > 2) {
        if (customDateWrap) customDateWrap.style.display = 'block';
        const customDate = document.getElementById(`${prefix}CustomDate`);
        if (customDate) customDate.value = dateStr;
    } else {
        if (customDateWrap) customDateWrap.style.display = 'none';
    }
    
    // 시간 설정 - btn-group-compact 우선
    const timeContainer = document.querySelector(`#${prefix}Modal #${prefix}TimePicker`);
    if (timeContainer) {
        // scheduleTime이 "08:00:00" 형태일 수 있으므로 앞 5자리만 비교
        const timeShort = timeStr ? timeStr.substring(0, 5) : '';
        timeContainer.querySelectorAll('.btn-time-option').forEach(btn => {
            btn.classList.remove('active');
            if (timeShort && btn.dataset.time === timeShort) {
                btn.classList.add('active');
            }
        });
        document.getElementById(`${prefix}Time`).value = timeShort;
    }
    
}

// 일정 저장
async function submitScheduleForm() {
    const id = document.getElementById('scheduleId').value;
    const categoryId = document.getElementById('scheduleCategory').value;
    const title = document.getElementById('scheduleTitle').value.trim();
    const date = document.getElementById('scheduleDate').value;
    const desc = document.getElementById('scheduleDesc').value.trim();
    
    if (!categoryId || !title || !date) {
        alert('카테고리, 제목, 날짜는 필수입니다.');
        return;
    }
    
    // 선택된 시간들 수집 (중복 선택)
    const selectedTimes = [];
    document.querySelectorAll('#scheduleTimePicker .btn-time-option.active').forEach(btn => {
        selectedTimes.push(btn.dataset.time);
    });
    
    // 수정 모드: 기존 일정 업데이트 (첫 번째 시간 사용)
    if (id) {
        const data = {
            categoryId: categoryId,
            title: title,
            scheduleDate: date,
            scheduleTime: selectedTimes.length > 0 ? selectedTimes[0] : null,
            description: desc || null,
            remindBefore: 30,
            isRecurring: false
        };
        
        try {
            const response = await fetch(`${API_BASE}/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (result.success) {
                bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
                await loadTodaySchedules();
                await loadWeekSchedules();
                alert('일정이 수정되었습니다!');
            } else {
                alert(result.message || '저장에 실패했습니다.');
            }
        } catch (e) {
            console.error('일정 저장 실패', e);
            alert('저장에 실패했습니다.');
        }
        return;
    }
    
    // 등록 모드: 선택된 시간마다 별도 일정 생성
    if (selectedTimes.length === 0) selectedTimes.push(null);
    
    try {
        let successCount = 0;
        for (const time of selectedTimes) {
            const data = {
                categoryId: categoryId,
                title: title,
                scheduleDate: date,
                scheduleTime: time,
                description: desc || null,
                remindBefore: 30,
                isRecurring: false
            };
            
            const response = await fetch(`${API_BASE}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (result.success) successCount++;
        }
        
        if (successCount > 0) {
            bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
            await loadTodaySchedules();
            await loadWeekSchedules();
            alert('일정이 등록되었습니다!');
        } else {
            alert('저장에 실패했습니다.');
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
