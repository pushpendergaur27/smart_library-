package com.smartlibrary.dto;

import java.util.List;

public class BookReviewsResponse {
    private Double averageRating;
    private long reviewCount;
    private List<BookReviewResponse> reviews;

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public long getReviewCount() { return reviewCount; }
    public void setReviewCount(long reviewCount) { this.reviewCount = reviewCount; }
    public List<BookReviewResponse> getReviews() { return reviews; }
    public void setReviews(List<BookReviewResponse> reviews) { this.reviews = reviews; }
}
