package com.smartlibrary.dto;

public class BookFactsResponse {
    private Integer pageCount;
    private Double rating;
    private Integer ratingsCount;
    private String source;

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getRatingsCount() { return ratingsCount; }
    public void setRatingsCount(Integer ratingsCount) { this.ratingsCount = ratingsCount; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
