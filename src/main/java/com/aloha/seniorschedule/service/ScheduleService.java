package com.aloha.seniorschedule.service;

import java.time.LocalDate;
import java.util.List;

import com.aloha.seniorschedule.dto.Schedule;
import com.aloha.seniorschedule.dto.ScheduleLog;

public interface ScheduleService {
    List<Schedule> getSchedulesByUserId(String userId);
    List<Schedule> getSchedulesByDate(String userId, LocalDate date);
    List<Schedule> getSchedulesByDateRange(String userId, LocalDate startDate, LocalDate endDate);
    List<Schedule> getTodaySchedules(String userId);
    List<Schedule> getWeekSchedules(String userId);
    List<Schedule> getMonthSchedules(String userId, int year, int month);
    Schedule getScheduleById(String id);
    Schedule createSchedule(String userId, Schedule.Request request);
    Schedule createQuickSchedule(String userId, String categoryName, Schedule.QuickRequest request);
    Schedule updateSchedule(String id, Schedule.Request request);
    void updateStatus(String id, Schedule.StatusRequest request);
    void deleteSchedule(String id);
    List<ScheduleLog> getScheduleLogs(String scheduleId);
    int countPendingSchedules(String userId);
    int countTodaySchedules(String userId);
}
