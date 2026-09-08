package com.smartlibrary.dto;

import jakarta.validation.constraints.NotBlank;

public class CopyRequest {
    @NotBlank(message = "Book ID is required")
    private Long bookId;
    @NotBlank(message = "Library barcode is required")
    private String libraryBarcode;
    private String floor;
    private String section;
    private String shelf;
    private String rack;
    private String rowNumber;

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
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
}
