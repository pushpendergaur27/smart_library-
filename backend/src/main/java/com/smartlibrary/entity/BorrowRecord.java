package com.smartlibrary.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_records")
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_id", nullable = false)
    private BookCopy copy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_id")
    private Librarian processedByLibrarian;

    @Column(nullable = false)
    private LocalDateTime borrowDate;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    private LocalDateTime returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BorrowStatus status = BorrowStatus.BORROWED;

    @PrePersist
    protected void onCreate() { if (borrowDate == null) borrowDate = LocalDateTime.now(); }

    public BorrowRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public BookCopy getCopy() { return copy; }
    public void setCopy(BookCopy copy) { this.copy = copy; }
    public Librarian getProcessedByLibrarian() { return processedByLibrarian; }
    public void setProcessedByLibrarian(Librarian processedByLibrarian) { this.processedByLibrarian = processedByLibrarian; }
    public LocalDateTime getBorrowDate() { return borrowDate; }
    public void setBorrowDate(LocalDateTime borrowDate) { this.borrowDate = borrowDate; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDateTime returnDate) { this.returnDate = returnDate; }
    public BorrowStatus getStatus() { return status; }
    public void setStatus(BorrowStatus status) { this.status = status; }

    public enum BorrowStatus { BORROWED, RETURNED, OVERDUE }
}
