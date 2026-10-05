package com.smartlibrary.dto;

import java.util.List;

public class LibrarianBorrowsResponse {

    private double finePerDay;
    private List<LibrarianBorrowResponse> borrows;

    public double getFinePerDay() { return finePerDay; }
    public void setFinePerDay(double finePerDay) { this.finePerDay = finePerDay; }
    public List<LibrarianBorrowResponse> getBorrows() { return borrows; }
    public void setBorrows(List<LibrarianBorrowResponse> borrows) { this.borrows = borrows; }
}
