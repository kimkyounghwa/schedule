package com.aloha.seniorschedule.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {
    private String id;
    private String userId;
    private String categoryId;
    private String title;
    private String description;
    private LocalDate scheduleDate;
    private LocalTime scheduleTime;
    private Status status;
    private Integer remindBefore;
    private Boolean isRecurring;
    private RecurringType recurringType;
    private LocalDate recurringEndDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조회 시 조인된 카테고리 정보
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    
    public enum Status {
        PENDING, COMPLETED, CANCELLED, MISSED
    }
    
    public enum RecurringType {
        DAILY, WEEKLY, MONTHLY
    }
    
    // Request DTO
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String categoryId;
        private String title;
        private String description;
        private LocalDate scheduleDate;
        private LocalTime scheduleTime;
        private Integer remindBefore;
        private Boolean isRecurring;
        private RecurringType recurringType;
        private LocalDate recurringEndDate;
    }
    
    // 상태 변경 Request
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusRequest {
        private Status status;
        private String note;
    }
    
    // 빠른 등록 Request
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickRequest {
        private String title;
        private LocalDate scheduleDate;
        private LocalTime scheduleTime;
        private Boolean isRecurring;
        private RecurringType recurringType;
    }
}
