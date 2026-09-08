package com.smartlibrary.dto;

import jakarta.validation.constraints.NotNull;

public class ReservationRequest {
    @NotNull(message = "Book ID is required")
    private Long bookId;

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
}
