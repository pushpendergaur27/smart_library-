package com.smartlibrary;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartLibraryApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartLibraryApplication.class, args);
    }
}
