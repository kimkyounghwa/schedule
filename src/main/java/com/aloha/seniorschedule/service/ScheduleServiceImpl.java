package com.aloha.seniorschedule.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.seniorschedule.dto.Schedule;
import com.aloha.seniorschedule.dto.ScheduleCategory;
import com.aloha.seniorschedule.dto.ScheduleLog;
import com.aloha.seniorschedule.mapper.ScheduleCategoryMapper;
import com.aloha.seniorschedule.mapper.ScheduleLogMapper;
import com.aloha.seniorschedule.mapper.ScheduleMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleMapper scheduleMapper;
    private final ScheduleCategoryMapper categoryMapper;
    private final ScheduleLogMapper logMapper;

    @Override
    public List<Schedule> getSchedulesByUserId(String userId) {
        return scheduleMapper.selectByUserId(userId);
    }

    @Override
    public List<Schedule> getSchedulesByDate(String userId, LocalDate date) {
        return scheduleMapper.selectByUserIdAndDate(userId, date);
    }

    @Override
    public List<Schedule> getSchedulesByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        return scheduleMapper.selectByUserIdAndDateRange(userId, startDate, endDate);
    }

    @Override
    public List<Schedule> getTodaySchedules(String userId) {
        return scheduleMapper.selectByUserIdAndDate(userId, LocalDate.now());
    }

    @Override
    public List<Schedule> getWeekSchedules(String userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
        return scheduleMapper.selectByUserIdAndDateRange(userId, startOfWeek, endOfWeek);
    }

    @Override
    public List<Schedule> getMonthSchedules(String userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startOfMonth = ym.atDay(1);
        LocalDate endOfMonth = ym.atEndOfMonth();
        return scheduleMapper.selectByUserIdAndDateRange(userId, startOfMonth, endOfMonth);
    }

    @Override
    public Schedule getScheduleById(String id) {
        return scheduleMapper.selectById(id);
    }

    @Override
    @Transactional
    public Schedule createSchedule(String userId, Schedule.Request request) {
        Schedule schedule = Schedule.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .categoryId(request.getCategoryId())
                .title(request.getTitle())
                .description(request.getDescription())
                .scheduleDate(request.getScheduleDate())
                .scheduleTime(request.getScheduleTime())
                .status(Schedule.Status.PENDING)
                .remindBefore(request.getRemindBefore() != null ? request.getRemindBefore() : 30)
                .isRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false)
                .recurringType(request.getRecurringType())
                .recurringEndDate(request.getRecurringEndDate())
                .build();

        scheduleMapper.insert(schedule);
        
        // 로그 기록
        logMapper.insert(ScheduleLog.builder()
                .id(UUID.randomUUID().toString())
                .scheduleId(schedule.getId())
                .action(ScheduleLog.Action.CREATED)
                .newStatus(Schedule.Status.PENDING.name())
                .build());

        return scheduleMapper.selectById(schedule.getId());
    }

    @Override
    @Transactional
    public Schedule createQuickSchedule(String userId, String categoryName, Schedule.QuickRequest request) {
        ScheduleCategory category = categoryMapper.selectByName(categoryName);
        if (category == null) {
            throw new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryName);
        }

        LocalDate startDate = request.getScheduleDate() != null ? request.getScheduleDate() : LocalDate.now();
        boolean isRecurring = request.getIsRecurring() != null && request.getIsRecurring();
        
        // 반복 일정인 경우 30일간 일정 생성
        int daysToCreate = isRecurring ? 30 : 1;
        String firstScheduleId = null;
        
        for (int i = 0; i < daysToCreate; i++) {
            LocalDate scheduleDate = startDate.plusDays(i);
            
            Schedule schedule = Schedule.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .categoryId(category.getId())
                    .title(request.getTitle())
                    .scheduleDate(scheduleDate)
                    .scheduleTime(request.getScheduleTime())
                    .status(Schedule.Status.PENDING)
                    .remindBefore(30)
                    .isRecurring(isRecurring)
                    .recurringType(isRecurring ? Schedule.RecurringType.DAILY : null)
                    .build();

            scheduleMapper.insert(schedule);

            logMapper.insert(ScheduleLog.builder()
                    .id(UUID.randomUUID().toString())
                    .scheduleId(schedule.getId())
                    .action(ScheduleLog.Action.CREATED)
                    .newStatus(Schedule.Status.PENDING.name())
                    .build());
            
            if (i == 0) {
                firstScheduleId = schedule.getId();
            }
        }

        return scheduleMapper.selectById(firstScheduleId);
    }

    @Override
    @Transactional
    public Schedule updateSchedule(String id, Schedule.Request request) {
        Schedule existing = scheduleMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("일정을 찾을 수 없습니다.");
        }

        existing.setCategoryId(request.getCategoryId());
        existing.setTitle(request.getTitle());
        existing.setDescription(request.getDescription());
        existing.setScheduleDate(request.getScheduleDate());
        existing.setScheduleTime(request.getScheduleTime());
        existing.setRemindBefore(request.getRemindBefore());
        existing.setIsRecurring(request.getIsRecurring());
        existing.setRecurringType(request.getRecurringType());
        existing.setRecurringEndDate(request.getRecurringEndDate());

        scheduleMapper.update(existing);

        logMapper.insert(ScheduleLog.builder()
                .id(UUID.randomUUID().toString())
                .scheduleId(id)
                .action(ScheduleLog.Action.UPDATED)
                .build());

        return scheduleMapper.selectById(id);
    }

    @Override
    @Transactional
    public void updateStatus(String id, Schedule.StatusRequest request) {
        Schedule existing = scheduleMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("일정을 찾을 수 없습니다.");
        }

        String oldStatus = existing.getStatus().name();
        scheduleMapper.updateStatus(id, request.getStatus().name());

        logMapper.insert(ScheduleLog.builder()
                .id(UUID.randomUUID().toString())
                .scheduleId(id)
                .action(ScheduleLog.Action.STATUS_CHANGED)
                .oldStatus(oldStatus)
                .newStatus(request.getStatus().name())
                .note(request.getNote())
                .build());
    }

    @Override
    @Transactional
    public void deleteSchedule(String id) {
        logMapper.insert(ScheduleLog.builder()
                .id(UUID.randomUUID().toString())
                .scheduleId(id)
                .action(ScheduleLog.Action.DELETED)
                .build());

        scheduleMapper.delete(id);
    }

    @Override
    public List<ScheduleLog> getScheduleLogs(String scheduleId) {
        return logMapper.selectByScheduleId(scheduleId);
    }

    @Override
    public int countPendingSchedules(String userId) {
        return scheduleMapper.countByUserIdAndStatus(userId, Schedule.Status.PENDING.name());
    }

    @Override
    public int countTodaySchedules(String userId) {
        return scheduleMapper.countTodayByUserId(userId, LocalDate.now());
    }
}
