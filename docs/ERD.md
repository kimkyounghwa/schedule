# 시니어 일정 관리 앱 - ERD

## 개요
55세 이상 시니어를 위한 간단한 일정 관리 앱
- 병원 방문, 약 복용 등 건강 관련 일정 중심
- Flutter 앱 전환을 고려한 REST API 중심 설계

---

## 테이블 구조

### 1. users (사용자)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 로그인 ID |
| password | VARCHAR(255) | NOT NULL | 암호화된 비밀번호 |
| name | VARCHAR(50) | NOT NULL | 이름 |
| phone | VARCHAR(20) | NULL | 전화번호 |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

### 2. schedule_category (일정 카테고리)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| name | VARCHAR(50) | NOT NULL | 카테고리명 |
| icon | VARCHAR(50) | NULL | 아이콘 (이모지 또는 아이콘명) |
| color | VARCHAR(7) | NULL | 색상 코드 (#RRGGBB) |
| is_default | BOOLEAN | DEFAULT FALSE | 기본 제공 여부 |
| sort_order | INT | DEFAULT 0 | 정렬 순서 |

**기본 카테고리:**
- 🏥 병원 (HOSPITAL) - #E53935
- 💊 약 복용 (MEDICINE) - #43A047
- 🏃 운동 (EXERCISE) - #1E88E5
- 👨‍👩‍👧 가족 (FAMILY) - #FB8C00
- 📅 기타 (OTHER) - #757575

### 3. schedule (일정)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| user_id | VARCHAR(36) | FK → users.id | 사용자 ID |
| category_id | VARCHAR(36) | FK → schedule_category.id | 카테고리 ID |
| title | VARCHAR(100) | NOT NULL | 일정 제목 |
| description | TEXT | NULL | 상세 내용 |
| schedule_date | DATE | NOT NULL | 일정 날짜 |
| schedule_time | TIME | NULL | 일정 시간 (선택) |
| status | ENUM | NOT NULL | 상태값 |
| remind_before | INT | DEFAULT 30 | 알림 (분 전) |
| is_recurring | BOOLEAN | DEFAULT FALSE | 반복 여부 |
| recurring_type | ENUM | NULL | 반복 유형 |
| recurring_end_date | DATE | NULL | 반복 종료일 |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

**status (상태값):**
- `PENDING` - 예정됨
- `COMPLETED` - 완료
- `CANCELLED` - 취소됨
- `MISSED` - 놓침

**recurring_type (반복 유형):**
- `DAILY` - 매일
- `WEEKLY` - 매주
- `MONTHLY` - 매월

### 4. schedule_log (일정 이력)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | VARCHAR(36) | PK | UUID |
| schedule_id | VARCHAR(36) | FK → schedule.id | 일정 ID |
| action | ENUM | NOT NULL | 액션 유형 |
| old_status | VARCHAR(20) | NULL | 이전 상태 |
| new_status | VARCHAR(20) | NULL | 새 상태 |
| action_at | TIMESTAMP | NOT NULL | 액션 시간 |
| note | VARCHAR(255) | NULL | 메모 |

**action (액션 유형):**
- `CREATED` - 생성
- `UPDATED` - 수정
- `STATUS_CHANGED` - 상태 변경
- `DELETED` - 삭제

---

## ERD 다이어그램

```
┌─────────────────┐       ┌─────────────────────┐
│     users       │       │  schedule_category  │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)             │
│ username        │       │ name                │
│ password        │       │ icon                │
│ name            │       │ color               │
│ phone           │       │ is_default          │
│ created_at      │       │ sort_order          │
│ updated_at      │       └──────────┬──────────┘
└────────┬────────┘                  │
         │                           │
         │ 1:N                       │ 1:N
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│                  schedule                    │
├─────────────────────────────────────────────┤
│ id (PK)                                      │
│ user_id (FK) ─────────────────────► users   │
│ category_id (FK) ──────► schedule_category  │
│ title                                        │
│ description                                  │
│ schedule_date                                │
│ schedule_time                                │
│ status (PENDING/COMPLETED/CANCELLED/MISSED) │
│ remind_before                                │
│ is_recurring                                 │
│ recurring_type                               │
│ recurring_end_date                           │
│ created_at                                   │
│ updated_at                                   │
└────────────────────┬────────────────────────┘
                     │
                     │ 1:N
                     ▼
         ┌─────────────────────┐
         │    schedule_log     │
         ├─────────────────────┤
         │ id (PK)             │
         │ schedule_id (FK)    │
         │ action              │
         │ old_status          │
         │ new_status          │
         │ action_at           │
         │ note                │
         └─────────────────────┘
```

---

## 설계 특징

### 1. Flutter 전환 고려
- 모든 ID는 UUID 사용 (클라이언트에서 생성 가능)
- REST API 중심 설계로 모바일 앱과 동일한 API 사용
- 상태값은 ENUM으로 명확하게 정의

### 2. 시니어 친화적 설계
- 카테고리별 아이콘/색상으로 시각적 구분
- 반복 일정 지원 (매일 약 복용 등)
- 알림 시간 설정 가능

### 3. 확장성
- schedule_log로 이력 관리
- 카테고리 커스터마이징 가능
- 반복 일정 지원
