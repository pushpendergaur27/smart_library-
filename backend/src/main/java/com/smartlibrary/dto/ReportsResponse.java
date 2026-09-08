package com.smartlibrary.dto;

import java.util.List;
import java.util.Map;

public class ReportsResponse {
    private long totalBooks;
    private long totalCopies;
    private long totalStudents;
    private long activeBorrows;
    private long overdueBooks;
    private long totalBorrows;
    private Map<String, Long> genreDistribution;
    private List<PopularBookResponse> popularBooks;

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }
    public long getTotalCopies() { return totalCopies; }
    public void setTotalCopies(long totalCopies) { this.totalCopies = totalCopies; }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getActiveBorrows() { return activeBorrows; }
    public void setActiveBorrows(long activeBorrows) { this.activeBorrows = activeBorrows; }
    public long getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(long overdueBooks) { this.overdueBooks = overdueBooks; }
    public long getTotalBorrows() { return totalBorrows; }
    public void setTotalBorrows(long totalBorrows) { this.totalBorrows = totalBorrows; }
    public Map<String, Long> getGenreDistribution() { return genreDistribution; }
    public void setGenreDistribution(Map<String, Long> genreDistribution) { this.genreDistribution = genreDistribution; }
    public List<PopularBookResponse> getPopularBooks() { return popularBooks; }
    public void setPopularBooks(List<PopularBookResponse> popularBooks) { this.popularBooks = popularBooks; }

    public static class PopularBookResponse {
        private Long id;
        private String title;
        private String author;
        private long borrowCount;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public long getBorrowCount() { return borrowCount; }
        public void setBorrowCount(long borrowCount) { this.borrowCount = borrowCount; }
    }
}
