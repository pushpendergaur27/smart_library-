package com.smartlibrary.controller;

import com.smartlibrary.dto.BookFactsResponse;
import com.smartlibrary.dto.ExternalBookResponse;
import com.smartlibrary.service.ExternalBookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/external-books")
public class ExternalBookController {

    private final ExternalBookService externalBookService;

    public ExternalBookController(ExternalBookService externalBookService) {
        this.externalBookService = externalBookService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExternalBookResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(externalBookService.search(q, limit));
    }

    @GetMapping("/facts")
    public ResponseEntity<BookFactsResponse> facts(@RequestParam String isbn) {
        return ResponseEntity.ok(externalBookService.getBookFacts(isbn));
    }
}
