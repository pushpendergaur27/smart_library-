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
    private final LibrarianNotificationService librarianNotificationService;

    @Value("${app.borrowing.period-days:14}")
    private int borrowingPeriodDays;

    @Value("${app.borrowing.max-limit:5}")
    private int maxBorrowLimit;

    @Value("${app.borrowing.max-days:30}")
    private int maxBorrowDays;

    public BorrowService(BorrowRecordRepository borrowRecordRepository, BookCopyRepository bookCopyRepository,
                         StudentRepository studentRepository, NotificationRepository notificationRepository,
                         LibrarianNotificationService librarianNotificationService) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.librarianNotificationService = librarianNotificationService;
    }

    @Transactional
    public BorrowRecordResponse borrowBook(String barcode, Integer days, Integer copies, Long studentId) {
        BookCopy barcodeCopy = bookCopyRepository.findByLibraryBarcodeWithBook(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found with barcode: " + barcode));
        if (barcodeCopy.getStatus() != CopyStatus.AVAILABLE) {
            throw new BadRequestException("This copy is not available for borrowing. Status: " + barcodeCopy.getStatus());
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        int requestedDays = (days == null) ? borrowingPeriodDays : days;
        if (requestedDays < 1 || requestedDays > maxBorrowDays) {
            throw new BadRequestException("Borrowing period must be between 1 and " + maxBorrowDays + " days.");
        }
        int requestedCopies = (copies == null || copies < 1) ? 1 : copies;

        long activeBorrows = borrowRecordRepository.countActiveBorrowsByStudent(studentId);
        if (activeBorrows + requestedCopies > maxBorrowLimit) {
            throw new BadRequestException("Borrowing limit reached. You can borrow " + Math.max(0, maxBorrowLimit - activeBorrows)
                    + " more book(s); maximum is " + maxBorrowLimit + " at a time.");
        }
        long alreadyBorrowed = borrowRecordRepository.countActiveBorrowByStudentAndBook(studentId, barcodeCopy.getBook().getId());
        if (alreadyBorrowed > 0) {
            throw new BadRequestException("You have already borrowed this book.");
        }

        List<BookCopy> availableCopies = bookCopyRepository.findByBookId(barcodeCopy.getBook().getId()).stream()
                .filter(c -> c.getStatus() == CopyStatus.AVAILABLE)
                .collect(Collectors.toList());
        availableCopies.removeIf(c -> c.getId().equals(barcodeCopy.getId()));
        availableCopies.add(0, barcodeCopy);
        if (availableCopies.size() < requestedCopies) {
            throw new BadRequestException("Only " + availableCopies.size() + " cop(y/ies) available right now.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDate = now.plusDays(requestedDays);
        BorrowRecord firstRecord = null;

        for (int i = 0; i < requestedCopies; i++) {
            BookCopy copy = availableCopies.get(i);
            BorrowRecord record = new BorrowRecord();
            record.setStudent(student);
            record.setCopy(copy);
            record.setBorrowDate(now);
            record.setDueDate(dueDate);
            record.setStatus(BorrowStatus.BORROWED);
            record = borrowRecordRepository.save(record);
            if (firstRecord == null) firstRecord = record;

            copy.setStatus(CopyStatus.BORROWED);
            bookCopyRepository.save(copy);
        }

        String title = barcodeCopy.getBook().getTitle();
        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setMessage("You have borrowed " + (requestedCopies > 1 ? requestedCopies + " copies of " : "")
                + "\"" + title + "\". Due date: " + dueDate.toLocalDate());
        notification.setType(Notification.NotificationType.BORROW_SUCCESS);
        notificationRepository.save(notification);

        librarianNotificationService.notifyStudentBorrowed(student.getName(), title, requestedCopies,
                dueDate.toLocalDate(), firstRecord.getId());

        return toResponse(firstRecord);
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
