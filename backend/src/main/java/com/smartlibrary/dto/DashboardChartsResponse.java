package com.smartlibrary.dto;

import java.util.List;

public class DashboardChartsResponse {

    private List<TimeBucket> rentalsOverTime;
    private int uniqueBorrowers;
    private List<TitleCount> topBooks;
    private List<RatingStat> bestReviews;
    private List<RatingStat> worstReviews;
    private List<ConsistentStudent> consistentStudents;
    private List<OverdueEntry> overdueStudents;

    public List<TimeBucket> getRentalsOverTime() { return rentalsOverTime; }
    public void setRentalsOverTime(List<TimeBucket> rentalsOverTime) { this.rentalsOverTime = rentalsOverTime; }
    public int getUniqueBorrowers() { return uniqueBorrowers; }
    public void setUniqueBorrowers(int uniqueBorrowers) { this.uniqueBorrowers = uniqueBorrowers; }
    public List<TitleCount> getTopBooks() { return topBooks; }
    public void setTopBooks(List<TitleCount> topBooks) { this.topBooks = topBooks; }
    public List<RatingStat> getBestReviews() { return bestReviews; }
    public void setBestReviews(List<RatingStat> bestReviews) { this.bestReviews = bestReviews; }
    public List<RatingStat> getWorstReviews() { return worstReviews; }
    public void setWorstReviews(List<RatingStat> worstReviews) { this.worstReviews = worstReviews; }
    public List<ConsistentStudent> getConsistentStudents() { return consistentStudents; }
    public void setConsistentStudents(List<ConsistentStudent> consistentStudents) { this.consistentStudents = consistentStudents; }
    public List<OverdueEntry> getOverdueStudents() { return overdueStudents; }
    public void setOverdueStudents(List<OverdueEntry> overdueStudents) { this.overdueStudents = overdueStudents; }

    public static class TimeBucket {
        private String label;
        private int borrows;
        private int uniqueStudents;

        public TimeBucket() {}
        public TimeBucket(String label, int borrows, int uniqueStudents) {
            this.label = label;
            this.borrows = borrows;
            this.uniqueStudents = uniqueStudents;
        }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public int getBorrows() { return borrows; }
        public void setBorrows(int borrows) { this.borrows = borrows; }
        public int getUniqueStudents() { return uniqueStudents; }
        public void setUniqueStudents(int uniqueStudents) { this.uniqueStudents = uniqueStudents; }
    }

    public static class TitleCount {
        private String title;
        private int count;

        public TitleCount() {}
        public TitleCount(String title, int count) { this.title = title; this.count = count; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public static class RatingStat {
        private String title;
        private double averageRating;
        private long reviewCount;

        public RatingStat() {}
        public RatingStat(String title, double averageRating, long reviewCount) {
            this.title = title;
            this.averageRating = averageRating;
            this.reviewCount = reviewCount;
        }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
        public long getReviewCount() { return reviewCount; }
        public void setReviewCount(long reviewCount) { this.reviewCount = reviewCount; }
    }

    public static class ConsistentStudent {
        private String name;
        private int totalBorrows;
        private int onTimePercent;

        public ConsistentStudent() {}
        public ConsistentStudent(String name, int totalBorrows, int onTimePercent) {
            this.name = name;
            this.totalBorrows = totalBorrows;
            this.onTimePercent = onTimePercent;
        }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getTotalBorrows() { return totalBorrows; }
        public void setTotalBorrows(int totalBorrows) { this.totalBorrows = totalBorrows; }
        public int getOnTimePercent() { return onTimePercent; }
        public void setOnTimePercent(int onTimePercent) { this.onTimePercent = onTimePercent; }
    }

    public static class OverdueEntry {
        private String studentName;
        private String bookTitle;
        private int daysOverdue;

        public OverdueEntry() {}
        public OverdueEntry(String studentName, String bookTitle, int daysOverdue) {
            this.studentName = studentName;
            this.bookTitle = bookTitle;
            this.daysOverdue = daysOverdue;
        }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getBookTitle() { return bookTitle; }
        public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
        public int getDaysOverdue() { return daysOverdue; }
        public void setDaysOverdue(int daysOverdue) { this.daysOverdue = daysOverdue; }
    }
}
