package com.aloha.seniorschedule.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.seniorschedule.dto.ScheduleLog;

@Mapper
public interface ScheduleLogMapper {
    List<ScheduleLog> selectByScheduleId(@Param("scheduleId") String scheduleId);
    int insert(ScheduleLog log);
}
