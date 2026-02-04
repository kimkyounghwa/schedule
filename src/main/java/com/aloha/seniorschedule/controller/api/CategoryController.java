package com.aloha.seniorschedule.controller.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.seniorschedule.dto.ApiResponse;
import com.aloha.seniorschedule.dto.ScheduleCategory;
import com.aloha.seniorschedule.mapper.ScheduleCategoryMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

    private final ScheduleCategoryMapper categoryMapper;

    @GetMapping
    public ApiResponse<List<ScheduleCategory>> getCategories() {
        List<ScheduleCategory> categories = categoryMapper.selectAll();
        return ApiResponse.ok(categories);
    }
}
