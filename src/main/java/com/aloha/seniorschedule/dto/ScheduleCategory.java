package com.aloha.seniorschedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCategory {
    private String id;
    private String name;
    private String icon;
    private String color;
    private Boolean isDefault;
    private Integer sortOrder;
}
