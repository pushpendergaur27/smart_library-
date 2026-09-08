package com.smartlibrary.controller;

import com.smartlibrary.dto.CopyResponse;
import com.smartlibrary.service.CopyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CopyController {

    private final CopyService copyService;

    public CopyController(CopyService copyService) {
        this.copyService = copyService;
    }

    @GetMapping("/librarian/copies")
    public ResponseEntity<?> getAllCopies() {
        return ResponseEntity.ok(copyService.getAllCopies());
    }

    @GetMapping("/librarian/copies/{bookId}")
    public ResponseEntity<?> getCopiesByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(copyService.getCopiesByBookId(bookId));
    }

    @GetMapping("/copies/{barcode}")
    public ResponseEntity<CopyResponse> getCopyByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(copyService.getCopyByBarcode(barcode));
    }
}
