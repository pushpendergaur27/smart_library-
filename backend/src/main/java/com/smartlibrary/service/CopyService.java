package com.smartlibrary.service;

import com.smartlibrary.dto.CopyRequest;
import com.smartlibrary.dto.CopyResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.exception.ConflictException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;

    public CopyService(BookCopyRepository bookCopyRepository, BookRepository bookRepository) {
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
    }

    public List<CopyResponse> getAllCopies() {
        return bookCopyRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CopyResponse> getCopiesByBookId(Long bookId) {
        return bookCopyRepository.findByBookId(bookId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CopyResponse createCopy(CopyRequest request) {
        if (bookCopyRepository.existsByLibraryBarcode(request.getLibraryBarcode())) {
            throw new ConflictException("Library barcode already exists: " + request.getLibraryBarcode());
        }
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setLibraryBarcode(request.getLibraryBarcode());
        copy.setFloor(request.getFloor());
        copy.setSection(request.getSection());
        copy.setShelf(request.getShelf());
        copy.setRack(request.getRack());
        copy.setRowNumber(request.getRowNumber());
        copy.setStatus(BookCopy.CopyStatus.AVAILABLE);
        copy = bookCopyRepository.save(copy);
        return toResponse(copy);
    }

    @Transactional
    public CopyResponse updateCopy(Long id, CopyRequest request) {
        BookCopy copy = bookCopyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found with id: " + id));
        if (!copy.getLibraryBarcode().equals(request.getLibraryBarcode()) &&
            bookCopyRepository.existsByLibraryBarcode(request.getLibraryBarcode())) {
            throw new ConflictException("Library barcode already exists: " + request.getLibraryBarcode());
        }
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));
        copy.setBook(book);
        copy.setLibraryBarcode(request.getLibraryBarcode());
        copy.setFloor(request.getFloor());
        copy.setSection(request.getSection());
        copy.setShelf(request.getShelf());
        copy.setRack(request.getRack());
        copy.setRowNumber(request.getRowNumber());
        copy = bookCopyRepository.save(copy);
        return toResponse(copy);
    }

    @Transactional
    public CopyResponse updateCopyStatus(Long id, String status) {
        BookCopy copy = bookCopyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found with id: " + id));
        try {
            BookCopy.CopyStatus newStatus = BookCopy.CopyStatus.valueOf(status.toUpperCase());
            copy.setStatus(newStatus);
            copy = bookCopyRepository.save(copy);
            return toResponse(copy);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    @Transactional
    public CopyResponse updateCopyLocation(Long id, Map<String, String> locationData) {
        BookCopy copy = bookCopyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found with id: " + id));
        if (locationData.containsKey("floor")) copy.setFloor(locationData.get("floor"));
        if (locationData.containsKey("section")) copy.setSection(locationData.get("section"));
        if (locationData.containsKey("shelf")) copy.setShelf(locationData.get("shelf"));
        if (locationData.containsKey("rack")) copy.setRack(locationData.get("rack"));
        if (locationData.containsKey("row")) copy.setRowNumber(locationData.get("row"));
        if (locationData.containsKey("rowNumber")) copy.setRowNumber(locationData.get("rowNumber"));
        copy = bookCopyRepository.save(copy);
        return toResponse(copy);
    }

    public CopyResponse getCopyByBarcode(String barcode) {
        BookCopy copy = bookCopyRepository.findByLibraryBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found with barcode: " + barcode));
        return toResponse(copy);
    }

    private CopyResponse toResponse(BookCopy copy) {
        CopyResponse response = new CopyResponse();
        response.setId(copy.getId());
        response.setBookId(copy.getBook().getId());
        response.setBookTitle(copy.getBook().getTitle());
        response.setLibraryBarcode(copy.getLibraryBarcode());
        response.setFloor(copy.getFloor());
        response.setSection(copy.getSection());
        response.setShelf(copy.getShelf());
        response.setRack(copy.getRack());
        response.setRowNumber(copy.getRowNumber());
        response.setStatus(copy.getStatus().name());
        return response;
    }
}
