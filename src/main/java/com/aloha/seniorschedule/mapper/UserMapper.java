package com.aloha.seniorschedule.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.seniorschedule.dto.Users;

@Mapper
public interface UserMapper {
    Users selectById(@Param("id") String id);
    Users selectByUsername(@Param("username") String username);
    int insert(Users user);
    int update(Users user);
    int updatePassword(@Param("id") String id, @Param("password") String password);
    int delete(@Param("id") String id);
}
