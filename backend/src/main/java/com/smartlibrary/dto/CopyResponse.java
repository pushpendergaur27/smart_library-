package com.smartlibrary.dto;

public class CopyResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String libraryBarcode;
    private String floor;
    private String section;
    private String shelf;
    private String rack;
    private String rowNumber;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
