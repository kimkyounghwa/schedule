package com.aloha.seniorschedule.controller.api;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.seniorschedule.dto.ApiResponse;
import com.aloha.seniorschedule.dto.Schedule;
import com.aloha.seniorschedule.dto.ScheduleLog;
import com.aloha.seniorschedule.service.ScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    private static final String DEFAULT_USER_ID = "default-user";

    @GetMapping
    public ApiResponse<List<Schedule>> getSchedules(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryId) {
        try {
            List<Schedule> schedules;

            if (date != null) {
                schedules = scheduleService.getSchedulesByDate(DEFAULT_USER_ID, LocalDate.parse(date));
            } else if (startDate != null && endDate != null) {
                schedules = scheduleService.getSchedulesByDateRange(DEFAULT_USER_ID, 
                        LocalDate.parse(startDate), LocalDate.parse(endDate));
            } else {
                schedules = scheduleService.getSchedulesByUserId(DEFAULT_USER_ID);
            }

            return ApiResponse.ok(schedules);
        } catch (Exception e) {
            log.error("일정 목록 조회 실패", e);
            return ApiResponse.error("일정 목록을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/today")
    public ApiResponse<List<Schedule>> getTodaySchedules() {
        try {
            return ApiResponse.ok(scheduleService.getTodaySchedules(DEFAULT_USER_ID));
        } catch (Exception e) {
            log.error("오늘 일정 조회 실패", e);
            return ApiResponse.error("오늘 일정을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/week")
    public ApiResponse<List<Schedule>> getWeekSchedules() {
        try {
            return ApiResponse.ok(scheduleService.getWeekSchedules(DEFAULT_USER_ID));
        } catch (Exception e) {
            log.error("이번 주 일정 조회 실패", e);
            return ApiResponse.error("이번 주 일정을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/month")
    public ApiResponse<List<Schedule>> getMonthSchedules(
            @RequestParam int year,
            @RequestParam int month) {
        try {
            return ApiResponse.ok(scheduleService.getMonthSchedules(DEFAULT_USER_ID, year, month));
        } catch (Exception e) {
            log.error("이번 달 일정 조회 실패", e);
            return ApiResponse.error("이번 달 일정을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Schedule> getSchedule(@PathVariable String id) {
        try {
            Schedule schedule = scheduleService.getScheduleById(id);
            if (schedule == null) {
                return ApiResponse.error("일정을 찾을 수 없습니다.");
            }
            return ApiResponse.ok(schedule);
        } catch (Exception e) {
            log.error("일정 조회 실패", e);
            return ApiResponse.error("일정을 조회하지 못했습니다.");
        }
    }

    @PostMapping
    public ApiResponse<Schedule> createSchedule(@RequestBody Schedule.Request request) {
        try {
            Schedule schedule = scheduleService.createSchedule(DEFAULT_USER_ID, request);
            return ApiResponse.ok(schedule);
        } catch (Exception e) {
            log.error("일정 생성 실패", e);
            return ApiResponse.error("일정을 생성하지 못했습니다.");
        }
    }

    @PostMapping("/quick/hospital")
    public ApiResponse<Schedule> createQuickHospital(@RequestBody Schedule.QuickRequest request) {
        try {
            Schedule schedule = scheduleService.createQuickSchedule(DEFAULT_USER_ID, "병원", request);
            return ApiResponse.ok(schedule);
        } catch (Exception e) {
            log.error("병원 일정 빠른 등록 실패", e);
            return ApiResponse.error("병원 일정을 등록하지 못했습니다.");
        }
    }

    @PostMapping("/quick/medicine")
    public ApiResponse<Schedule> createQuickMedicine(@RequestBody Schedule.QuickRequest request) {
        try {
            Schedule schedule = scheduleService.createQuickSchedule(DEFAULT_USER_ID, "약 복용", request);
            return ApiResponse.ok(schedule);
        } catch (Exception e) {
            log.error("약 복용 일정 빠른 등록 실패", e);
            return ApiResponse.error("약 복용 일정을 등록하지 못했습니다.");
        }
    }

    @PostMapping("/quick/exercise")
    public ApiResponse<Schedule> createQuickExercise(@RequestBody Schedule.QuickRequest request) {
        try {
            Schedule schedule = scheduleService.createQuickSchedule(DEFAULT_USER_ID, "운동", request);
            return ApiResponse.ok(schedule);
        } catch (Exception e) {
            log.error("운동 일정 빠른 등록 실패", e);
            return ApiResponse.error("운동 일정을 등록하지 못했습니다.");
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Schedule> updateSchedule(
            @PathVariable String id,
            @RequestBody Schedule.Request request) {
        try {
            Schedule schedule = scheduleService.updateSchedule(id, request);
            return ApiResponse.ok(schedule);
        } catch (Exception e) {
            log.error("일정 수정 실패", e);
            return ApiResponse.error("일정을 수정하지 못했습니다.");
        }
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(
            @PathVariable String id,
            @RequestBody Schedule.StatusRequest request) {
        try {
            scheduleService.updateStatus(id, request);
            return ApiResponse.ok();
        } catch (Exception e) {
            log.error("일정 상태 변경 실패", e);
            return ApiResponse.error("일정 상태를 변경하지 못했습니다.");
        }
    }

    @DeleteMapping("/all")
    public ApiResponse<Void> deleteAllSchedules() {
        try {
            scheduleService.deleteAllSchedules(DEFAULT_USER_ID);
            return ApiResponse.ok();
        } catch (Exception e) {
            log.error("모든 일정 삭제 실패", e);
            return ApiResponse.error("모든 일정을 삭제하지 못했습니다.");
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSchedule(@PathVariable String id) {
        try {
            scheduleService.deleteSchedule(id);
            return ApiResponse.ok();
        } catch (Exception e) {
            log.error("일정 삭제 실패", e);
            return ApiResponse.error("일정을 삭제하지 못했습니다.");
        }
    }

    @GetMapping("/{id}/logs")
    public ApiResponse<List<ScheduleLog>> getScheduleLogs(@PathVariable String id) {
        try {
            return ApiResponse.ok(scheduleService.getScheduleLogs(id));
        } catch (Exception e) {
            log.error("일정 이력 조회 실패", e);
            return ApiResponse.error("일정 이력을 조회하지 못했습니다.");
        }
    }
}
