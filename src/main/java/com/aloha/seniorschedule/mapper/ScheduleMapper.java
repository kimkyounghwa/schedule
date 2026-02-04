package com.aloha.seniorschedule.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.seniorschedule.dto.Schedule;

@Mapper
public interface ScheduleMapper {
    List<Schedule> selectByUserId(@Param("userId") String userId);
    List<Schedule> selectByUserIdAndDate(@Param("userId") String userId, @Param("date") LocalDate date);
    List<Schedule> selectByUserIdAndDateRange(@Param("userId") String userId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
    List<Schedule> selectByUserIdAndStatus(@Param("userId") String userId, @Param("status") String status);
    Schedule selectById(@Param("id") String id);
    int insert(Schedule schedule);
    int update(Schedule schedule);
    int updateStatus(@Param("id") String id, @Param("status") String status);
    int delete(@Param("id") String id);
    int countByUserIdAndStatus(@Param("userId") String userId, @Param("status") String status);
    int countTodayByUserId(@Param("userId") String userId, @Param("today") LocalDate today);
}
