package com.smartlibrary.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "book_copies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"libraryBarcode"})
})
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, unique = true)
    private String libraryBarcode;

    private String floor;
    private String section;
    private String shelf;
    private String rack;
    @Column(name = "row_num")
    private String rowNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CopyStatus status = CopyStatus.AVAILABLE;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "copy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BorrowRecord> borrowRecords = new ArrayList<>();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public BookCopy() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public String getLibraryBarcode() { return libraryBarcode; }
    public void setLibraryBarcode(String libraryBarcode) { this.libraryBarcode = libraryBarcode; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getShelf() { return shelf; }
    public void setShelf(String shelf) { this.shelf = shelf; }
    public String getRack() { return rack; }
    public void setRack(String rack) { this.rack = rack; }
    public String getRowNumber() { return rowNumber; }
    public void setRowNumber(String rowNumber) { this.rowNumber = rowNumber; }
    public CopyStatus getStatus() { return status; }
    public void setStatus(CopyStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<BorrowRecord> getBorrowRecords() { return borrowRecords; }
    public void setBorrowRecords(List<BorrowRecord> borrowRecords) { this.borrowRecords = borrowRecords; }

    public enum CopyStatus { AVAILABLE, BORROWED, RESERVED, DAMAGED, LOST }
}
