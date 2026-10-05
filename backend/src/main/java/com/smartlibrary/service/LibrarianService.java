package com.smartlibrary.service;

import com.smartlibrary.dto.*;
import com.smartlibrary.entity.*;
import com.smartlibrary.entity.BookCopy.CopyStatus;
import com.smartlibrary.entity.BorrowRecord.BorrowStatus;
import com.smartlibrary.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LibrarianService {

    private final StudentRepository studentRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final ReservationRepository reservationRepository;

    @Value("${app.fine.per-day:5}")
    private double finePerDay;

    public LibrarianService(StudentRepository studentRepository, BorrowRecordRepository borrowRecordRepository,
                            BookRepository bookRepository, BookCopyRepository bookCopyRepository,
                            ReservationRepository reservationRepository) {
        this.studentRepository = studentRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.reservationRepository = reservationRepository;
    }

    public DashboardResponse getDashboard() {
        DashboardResponse dashboard = new DashboardResponse();
        dashboard.setTotalBooks(bookRepository.count());
        dashboard.setTotalCopies(bookCopyRepository.count());
        dashboard.setTotalStudents(studentRepository.count());
        dashboard.setActiveBorrows(borrowRecordRepository.findAllActiveBorrows().size());
        dashboard.setOverdueBooks(borrowRecordRepository.findOverdueBorrows().size());

        long totalAvailable = 0;
        for (Book book : bookRepository.findAll()) {
            totalAvailable += bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
        }
        dashboard.setAvailableCopies(totalAvailable);
        dashboard.setBorrowedCopies(borrowRecordRepository.findAllActiveBorrows().size());
        dashboard.setPendingReservations(reservationRepository.countPending());
        return dashboard;
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream().map(student -> {
            StudentResponse response = new StudentResponse();
            response.setId(student.getId());
            response.setName(student.getName());
            response.setEmail(student.getEmail());
            response.setPhone(student.getPhone());
            response.setCourse(student.getCourse());
            response.setYear(student.getYear());
            response.setActiveBorrows(borrowRecordRepository.countActiveBorrowsByStudent(student.getId()));
            response.setCreatedAt(student.getCreatedAt() != null ? student.getCreatedAt().toString() : null);
            return response;
        }).collect(Collectors.toList());
    }

    public LibrarianBorrowsResponse getBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findAllWithDetails();
        LocalDate today = LocalDate.now();

        List<LibrarianBorrowResponse> borrows = records.stream().map(record -> {
            LibrarianBorrowResponse response = new LibrarianBorrowResponse();
            response.setId(record.getId());
            response.setStudentId(record.getStudent().getId());
            response.setStudentName(record.getStudent().getName());
            response.setStudentEmail(record.getStudent().getEmail());
            response.setStudentCourse(record.getStudent().getCourse());
            response.setStudentYear(record.getStudent().getYear());
            response.setBookId(record.getCopy().getBook().getId());
            response.setBookTitle(record.getCopy().getBook().getTitle());
            response.setBookAuthor(record.getCopy().getBook().getAuthor());
            response.setBookGenre(record.getCopy().getBook().getGenre());
            response.setBarcode(record.getCopy().getLibraryBarcode());
            response.setBorrowDate(record.getBorrowDate());
            response.setDueDate(record.getDueDate());
            response.setReturnDate(record.getReturnDate());

            LocalDate due = record.getDueDate().toLocalDate();
            long daysOverdue = 0;
            String status;
            if (record.getStatus() == BorrowStatus.RETURNED) {
                status = BorrowStatus.RETURNED.name();
                if (record.getReturnDate() != null && record.getReturnDate().toLocalDate().isAfter(due)) {
                    daysOverdue = ChronoUnit.DAYS.between(due, record.getReturnDate().toLocalDate());
                }
            } else if (due.isBefore(today)) {
                status = BorrowStatus.OVERDUE.name();
                daysOverdue = Math.max(1, ChronoUnit.DAYS.between(due, today));
            } else {
                status = BorrowStatus.BORROWED.name();
            }
            response.setStatus(status);
            response.setDaysOverdue(daysOverdue);
            response.setFineAmount(daysOverdue * finePerDay);
            return response;
        }).sorted(Comparator
                .comparingInt((LibrarianBorrowResponse b) -> statusRank(b.getStatus()))
                .thenComparing(LibrarianBorrowResponse::getDaysOverdue, Comparator.reverseOrder())
                .thenComparing(LibrarianBorrowResponse::getDueDate)
        ).collect(Collectors.toList());

        LibrarianBorrowsResponse response = new LibrarianBorrowsResponse();
        response.setFinePerDay(finePerDay);
        response.setBorrows(borrows);
        return response;
    }

    private int statusRank(String status) {
        switch (status) {
            case "OVERDUE": return 0;
            case "BORROWED": return 1;
            default: return 2;
        }
    }

    public ReportsResponse getReports() {
        ReportsResponse reports = new ReportsResponse();
        reports.setTotalBooks(bookRepository.count());
        reports.setTotalCopies(bookCopyRepository.count());
        reports.setTotalStudents(studentRepository.count());
        reports.setActiveBorrows(borrowRecordRepository.findAllActiveBorrows().size());
        reports.setOverdueBooks(borrowRecordRepository.findOverdueBorrows().size());
        reports.setTotalBorrows(borrowRecordRepository.countAll());

        Map<String, Long> genreMap = new HashMap<>();
        for (Book book : bookRepository.findAll()) {
            String genre = book.getGenre() != null ? book.getGenre() : "Uncategorized";
            genreMap.merge(genre, 1L, Long::sum);
        }
        reports.setGenreDistribution(genreMap);

        Map<Long, Long> bookBorrowCounts = new HashMap<>();
        for (BorrowRecord record : borrowRecordRepository.findAll()) {
            Long bookId = record.getCopy().getBook().getId();
            bookBorrowCounts.merge(bookId, 1L, Long::sum);
        }
        List<ReportsResponse.PopularBookResponse> popular = bookBorrowCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Book book = bookRepository.findById(entry.getKey()).orElse(null);
                    if (book == null) return null;
                    ReportsResponse.PopularBookResponse p = new ReportsResponse.PopularBookResponse();
                    p.setId(book.getId());
                    p.setTitle(book.getTitle());
                    p.setAuthor(book.getAuthor());
                    p.setBorrowCount(entry.getValue());
                    return p;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        reports.setPopularBooks(popular);
        return reports;
    }
}
