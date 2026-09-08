package com.smartlibrary.dto;

public class DashboardResponse {
    private long totalBooks;
    private long totalCopies;
    private long availableCopies;
    private long borrowedCopies;
    private long totalStudents;
    private long activeBorrows;
    private long pendingReservations;
    private long overdueBooks;

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }
    public long getTotalCopies() { return totalCopies; }
    public void setTotalCopies(long totalCopies) { this.totalCopies = totalCopies; }
    public long getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(long availableCopies) { this.availableCopies = availableCopies; }
    public long getBorrowedCopies() { return borrowedCopies; }
    public void setBorrowedCopies(long borrowedCopies) { this.borrowedCopies = borrowedCopies; }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getActiveBorrows() { return activeBorrows; }
    public void setActiveBorrows(long activeBorrows) { this.activeBorrows = activeBorrows; }
    public long getPendingReservations() { return pendingReservations; }
    public void setPendingReservations(long pendingReservations) { this.pendingReservations = pendingReservations; }
    public long getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(long overdueBooks) { this.overdueBooks = overdueBooks; }
}
