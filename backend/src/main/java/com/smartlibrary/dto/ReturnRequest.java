package com.smartlibrary.dto;

import jakarta.validation.constraints.NotBlank;

public class ReturnRequest {
    @NotBlank(message = "Library barcode is required")
    private String barcode;

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
}
