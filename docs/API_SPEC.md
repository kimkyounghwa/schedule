# 시니어 일정 관리 앱 - REST API 명세

## 기본 정보
- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **인증**: JWT Bearer Token

---

## 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

### 에러 응답
```json
{
  "success": false,
  "data": null,
  "message": "에러 메시지"
}
```

---

## 1. 인증 API (`/api/auth`)

### 1.1 회원가입
```
POST /api/auth/join
```

**Request Body:**
```json
{
  "username": "hong123",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "hong123",
    "name": "홍길동"
  }
}
```

### 1.2 로그인
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "hong123",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "name": "홍길동"
    }
  }
}
```

### 1.3 토큰 갱신
```
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### 1.4 로그아웃
```
POST /api/auth/logout
```

---

## 2. 사용자 API (`/api/users`)

### 2.1 내 정보 조회
```
GET /api/users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "hong123",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "createdAt": "2026-02-04T10:00:00"
  }
}
```

### 2.2 내 정보 수정
```
PUT /api/users/me
```

**Request Body:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

### 2.3 비밀번호 변경
```
PUT /api/users/me/password
```

**Request Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

---

## 3. 카테고리 API (`/api/categories`)

### 3.1 카테고리 목록 조회
```
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "병원",
      "icon": "🏥",
      "color": "#E53935",
      "isDefault": true,
      "sortOrder": 1
    },
    {
      "id": "uuid",
      "name": "약 복용",
      "icon": "💊",
      "color": "#43A047",
      "isDefault": true,
      "sortOrder": 2
    }
  ]
}
```

---

## 4. 일정 API (`/api/schedules`)

### 4.1 일정 목록 조회
```
GET /api/schedules
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| date | String | N | 특정 날짜 (yyyy-MM-dd) |
| startDate | String | N | 시작일 |
| endDate | String | N | 종료일 |
| status | String | N | 상태 필터 |
| categoryId | String | N | 카테고리 필터 |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "categoryName": "병원",
      "categoryIcon": "🏥",
      "categoryColor": "#E53935",
      "title": "내과 정기검진",
      "description": "혈압약 처방전 받기",
      "scheduleDate": "2026-02-10",
      "scheduleTime": "10:00",
      "status": "PENDING",
      "remindBefore": 60,
      "isRecurring": false,
      "createdAt": "2026-02-04T10:00:00"
    }
  ]
}
```

### 4.2 오늘 일정 조회
```
GET /api/schedules/today
```

### 4.3 이번 주 일정 조회
```
GET /api/schedules/week
```

### 4.4 이번 달 일정 조회
```
GET /api/schedules/month?year=2026&month=2
```

### 4.5 일정 상세 조회
```
GET /api/schedules/{id}
```

### 4.6 일정 생성
```
POST /api/schedules
```

**Request Body:**
```json
{
  "categoryId": "uuid",
  "title": "내과 정기검진",
  "description": "혈압약 처방전 받기",
  "scheduleDate": "2026-02-10",
  "scheduleTime": "10:00",
  "remindBefore": 60,
  "isRecurring": false,
  "recurringType": null,
  "recurringEndDate": null
}
```

### 4.7 일정 수정
```
PUT /api/schedules/{id}
```

**Request Body:** (일정 생성과 동일)

### 4.8 일정 상태 변경
```
PATCH /api/schedules/{id}/status
```

**Request Body:**
```json
{
  "status": "COMPLETED",
  "note": "완료함"
}
```

### 4.9 일정 삭제
```
DELETE /api/schedules/{id}
```

---

## 5. 빠른 일정 등록 API (`/api/schedules/quick`)

시니어 사용자를 위한 단축 등록 API

### 5.1 병원 일정 빠른 등록
```
POST /api/schedules/quick/hospital
```

**Request Body:**
```json
{
  "title": "내과",
  "scheduleDate": "2026-02-10",
  "scheduleTime": "10:00"
}
```

### 5.2 약 복용 일정 빠른 등록
```
POST /api/schedules/quick/medicine
```

**Request Body:**
```json
{
  "title": "혈압약",
  "scheduleTime": "08:00",
  "isRecurring": true,
  "recurringType": "DAILY"
}
```

### 5.3 운동 일정 빠른 등록
```
POST /api/schedules/quick/exercise
```

---

## 6. 일정 이력 API (`/api/schedules/{id}/logs`)

### 6.1 일정 이력 조회
```
GET /api/schedules/{id}/logs
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "STATUS_CHANGED",
      "oldStatus": "PENDING",
      "newStatus": "COMPLETED",
      "actionAt": "2026-02-10T10:30:00",
      "note": "병원 다녀옴"
    }
  ]
}
```

---

## 7. 대시보드 API (`/api/dashboard`)

### 7.1 대시보드 요약
```
GET /api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "todaySchedules": 3,
    "pendingSchedules": 5,
    "completedThisWeek": 12,
    "upcomingSchedules": [
      {
        "id": "uuid",
        "title": "내과 정기검진",
        "categoryIcon": "🏥",
        "scheduleDate": "2026-02-10",
        "scheduleTime": "10:00"
      }
    ]
  }
}
```

---

## HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

---

## Flutter 전환 고려사항

1. **오프라인 지원**: 일정 데이터는 로컬 DB에 캐싱 가능하도록 설계
2. **동기화**: `updatedAt` 필드로 마지막 동기화 시점 이후 변경사항만 조회 가능
3. **푸시 알림**: FCM 토큰 등록 API 추가 예정
4. **페이지네이션**: 대량 데이터 조회 시 cursor 기반 페이지네이션 지원
