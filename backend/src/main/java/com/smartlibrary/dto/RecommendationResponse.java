package com.smartlibrary.dto;

import java.util.List;

public class RecommendationResponse {
    private String reason;
    private List<BookResponse> books;

    public RecommendationResponse() {}

    public RecommendationResponse(String reason, List<BookResponse> books) {
        this.reason = reason;
        this.books = books;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public List<BookResponse> getBooks() { return books; }
    public void setBooks(List<BookResponse> books) { this.books = books; }
}
