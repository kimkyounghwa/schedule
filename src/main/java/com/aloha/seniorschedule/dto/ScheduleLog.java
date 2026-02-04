package com.aloha.seniorschedule.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleLog {
    private String id;
    private String scheduleId;
    private Action action;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime actionAt;
    private String note;
    
    public enum Action {
        CREATED, UPDATED, STATUS_CHANGED, DELETED
    }
}
