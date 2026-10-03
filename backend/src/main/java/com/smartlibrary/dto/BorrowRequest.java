package com.smartlibrary.dto;

import jakarta.validation.constraints.NotBlank;

public class BorrowRequest {
    @NotBlank(message = "Library barcode is required")
    private String barcode;
    private Integer days;
    private Integer copies;

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days; }
    public Integer getCopies() { return copies; }
    public void setCopies(Integer copies) { this.copies = copies; }
}
