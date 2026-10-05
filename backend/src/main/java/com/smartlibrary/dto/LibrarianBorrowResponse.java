package com.smartlibrary.dto;

import java.time.LocalDateTime;

public class LibrarianBorrowResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentCourse;
    private String studentYear;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookGenre;
    private String barcode;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private String status;
    private long daysOverdue;
    private double fineAmount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public String getStudentCourse() { return studentCourse; }
    public void setStudentCourse(String studentCourse) { this.studentCourse = studentCourse; }
    public String getStudentYear() { return studentYear; }
    public void setStudentYear(String studentYear) { this.studentYear = studentYear; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }
    public String getBookGenre() { return bookGenre; }
    public void setBookGenre(String bookGenre) { this.bookGenre = bookGenre; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public LocalDateTime getBorrowDate() { return borrowDate; }
    public void setBorrowDate(LocalDateTime borrowDate) { this.borrowDate = borrowDate; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDateTime returnDate) { this.returnDate = returnDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getDaysOverdue() { return daysOverdue; }
    public void setDaysOverdue(long daysOverdue) { this.daysOverdue = daysOverdue; }
    public double getFineAmount() { return fineAmount; }
    public void setFineAmount(double fineAmount) { this.fineAmount = fineAmount; }
}
