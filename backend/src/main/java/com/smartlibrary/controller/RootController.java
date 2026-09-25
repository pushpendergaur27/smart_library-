package com.smartlibrary.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "application", "Smart Library Assistant API",
                "status", "running",
                "apiBase", "/api",
                "note", "Frontend is served separately. See README for the frontend URL."
        );
    }
}
