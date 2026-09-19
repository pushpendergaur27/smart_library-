package com.smartlibrary.service;

import com.smartlibrary.dto.BorrowRecordResponse;
import com.smartlibrary.entity.*;
import com.smartlibrary.entity.BorrowRecord.BorrowStatus;
import com.smartlibrary.entity.BookCopy.CopyStatus;
import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookCopyRepository bookCopyRepository;
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;

    @Value("${app.borrowing.period-days:14}")
    private int borrowingPeriodDays;

    @Value("${app.borrowing.max-limit:5}")
    private int maxBorrowLimit;

    public BorrowService(BorrowRecordRepository borrowRecordRepository, BookCopyRepository bookCopyRepository,
                         StudentRepository studentRepository, NotificationRepository notificationRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public BorrowRecordResponse borrowBook(String barcode, Long studentId) {
        BookCopy copy = bookCopyRepository.findByLibraryBarcodeWithBook(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found with barcode: " + barcode));
        if (copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new BadRequestException("This copy is not available for borrowing. Status: " + copy.getStatus());
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        long activeBorrows = borrowRecordRepository.countActiveBorrowsByStudent(studentId);
        if (activeBorrows >= maxBorrowLimit) {
            throw new BadRequestException("Borrowing limit reached. Maximum " + maxBorrowLimit + " books at a time.");
        }
        long alreadyBorrowed = borrowRecordRepository.countActiveBorrowByStudentAndBook(studentId, copy.getBook().getId());
        if (alreadyBorrowed > 0) {
            throw new BadRequestException("You have already borrowed this book.");
        }

        LocalDateTime now = LocalDateTime.now();
        BorrowRecord record = new BorrowRecord();
        record.setStudent(student);
        record.setCopy(copy);
        record.setBorrowDate(now);
        record.setDueDate(now.plusDays(borrowingPeriodDays));
        record.setStatus(BorrowStatus.BORROWED);
        record = borrowRecordRepository.save(record);

        copy.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy);

        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setMessage("You have borrowed \"" + copy.getBook().getTitle() + "\". Due date: " + record.getDueDate().toLocalDate());
        notification.setType(Notification.NotificationType.BORROW_SUCCESS);
        notificationRepository.save(notification);

        return toResponse(record);
    }

    @Transactional
    public BorrowRecordResponse returnBook(String barcode, Long librarianId) {
        BookCopy copy = bookCopyRepository.findByLibraryBarcodeWithBook(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found with barcode: " + barcode));
        BorrowRecord record = borrowRecordRepository.findActiveBorrowByCopyId(copy.getId())
                .orElseThrow(() -> new BadRequestException("No active borrow record found for this copy."));
        record.setReturnDate(LocalDateTime.now());
        record.setStatus(BorrowStatus.RETURNED);
        record = borrowRecordRepository.save(record);
        copy.setStatus(CopyStatus.AVAILABLE);
        bookCopyRepository.save(copy);
        return toResponse(record);
    }

    public List<BorrowRecordResponse> getStudentBorrowedBooks(Long studentId) {
        return borrowRecordRepository.findByStudentIdAndStatus(studentId, BorrowStatus.BORROWED).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<BorrowRecordResponse> getStudentBorrowHistory(Long studentId) {
        return borrowRecordRepository.findByStudentIdOrderByBorrowDateDesc(studentId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private BorrowRecordResponse toResponse(BorrowRecord record) {
        BorrowRecordResponse response = new BorrowRecordResponse();
        response.setId(record.getId());
        response.setBookTitle(record.getCopy().getBook().getTitle());
        response.setBookAuthor(record.getCopy().getBook().getAuthor());
        response.setCopyBarcode(record.getCopy().getLibraryBarcode());
        response.setStudentName(record.getStudent().getName());
        response.setStudentEmail(record.getStudent().getEmail());
        response.setStudentId(record.getStudent().getId());
        response.setBorrowDate(record.getBorrowDate());
        response.setDueDate(record.getDueDate());
        response.setReturnDate(record.getReturnDate());
        response.setStatus(record.getStatus().name());
        return response;
    }
}
