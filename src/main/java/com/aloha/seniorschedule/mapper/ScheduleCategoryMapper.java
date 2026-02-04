package com.aloha.seniorschedule.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.seniorschedule.dto.ScheduleCategory;

@Mapper
public interface ScheduleCategoryMapper {
    List<ScheduleCategory> selectAll();
    ScheduleCategory selectById(@Param("id") String id);
    ScheduleCategory selectByName(@Param("name") String name);
}
