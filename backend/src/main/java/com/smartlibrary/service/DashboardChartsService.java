package com.smartlibrary.service;

import com.smartlibrary.dto.DashboardChartsResponse;
import com.smartlibrary.dto.DashboardChartsResponse.*;
import com.smartlibrary.entity.BookReview;
import com.smartlibrary.entity.BorrowRecord;
import com.smartlibrary.entity.BorrowRecord.BorrowStatus;
import com.smartlibrary.repository.BookReviewRepository;
import com.smartlibrary.repository.BorrowRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardChartsService {

    private static final int WEEKS = 12;
    private static final int TOP_LIST = 7;
    private static final int RATING_LIST = 5;

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookReviewRepository reviewRepository;

    public DashboardChartsService(BorrowRecordRepository borrowRecordRepository,
                                  BookReviewRepository reviewRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public DashboardChartsResponse getCharts() {
        DashboardChartsResponse response = new DashboardChartsResponse();
        List<BorrowRecord> records = borrowRecordRepository.findAllWithDetails();

        response.setRentalsOverTime(buildRentalsOverTime(records));
        response.setUniqueBorrowers((int) records.stream()
                .map(r -> r.getStudent().getId()).distinct().count());
        response.setTopBooks(buildTopBooks(records));
        setReviewCharts(response);
        response.setConsistentStudents(buildConsistentStudents(records));
        response.setOverdueStudents(buildOverdue(records));
        return response;
    }

    private void setReviewCharts(DashboardChartsResponse response) {
        List<BookReview> reviews = reviewRepository.findAllWithBookAndStudent();
        Map<String, List<BookReview>> byBook = reviews.stream()
                .collect(Collectors.groupingBy(r -> r.getBook().getTitle()));

        List<RatingStat> stats = byBook.entrySet().stream()
                .map(e -> {
                    double avg = e.getValue().stream().mapToInt(BookReview::getRating).average().orElse(0);
                    avg = Math.round(avg * 10.0) / 10.0;
                    return new RatingStat(e.getKey(), avg, e.getValue().size());
                })
                .collect(Collectors.toList());

        response.setBestReviews(stats.stream()
                .sorted(Comparator.comparingDouble(RatingStat::getAverageRating).reversed()
                        .thenComparing(Comparator.comparingLong(RatingStat::getReviewCount).reversed()))
                .limit(RATING_LIST)
                .collect(Collectors.toList()));
        response.setWorstReviews(stats.stream()
                .sorted(Comparator.comparingDouble(RatingStat::getAverageRating)
                        .thenComparing(Comparator.comparingLong(RatingStat::getReviewCount).reversed()))
                .limit(RATING_LIST)
                .collect(Collectors.toList()));
    }

    private List<TimeBucket> buildRentalsOverTime(List<BorrowRecord> records) {
        LocalDate endWeek = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate startWeek = endWeek.minusWeeks(WEEKS - 1);

        Map<LocalDate, List<BorrowRecord>> byWeek = new HashMap<>();
        for (BorrowRecord record : records) {
            LocalDate week = record.getBorrowDate().toLocalDate().with(DayOfWeek.MONDAY);
            if (!week.isBefore(startWeek) && !week.isAfter(endWeek)) {
                byWeek.computeIfAbsent(week, k -> new ArrayList<>()).add(record);
            }
        }

        List<TimeBucket> buckets = new ArrayList<>();
        for (int i = 0; i < WEEKS; i++) {
            LocalDate week = startWeek.plusWeeks(i);
            List<BorrowRecord> weekRecords = byWeek.getOrDefault(week, List.of());
            long unique = weekRecords.stream().map(r -> r.getStudent().getId()).distinct().count();
            buckets.add(new TimeBucket(week.getDayOfMonth() + " " + week.getMonth().getDisplayName(
                    java.time.format.TextStyle.SHORT, Locale.ENGLISH), weekRecords.size(), (int) unique));
        }
        return buckets;
    }

    private List<TitleCount> buildTopBooks(List<BorrowRecord> records) {
        Map<String, Integer> counts = new HashMap<>();
        for (BorrowRecord record : records) {
            counts.merge(record.getCopy().getBook().getTitle(), 1, Integer::sum);
        }
        return counts.entrySet().stream()
                .map(e -> new TitleCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingInt(TitleCount::getCount).reversed())
                .limit(TOP_LIST)
                .collect(Collectors.toList());
    }

    private List<ConsistentStudent> buildConsistentStudents(List<BorrowRecord> records) {
        Map<Long, StudentStats> stats = new HashMap<>();
        Map<Long, String> names = new HashMap<>();
        for (BorrowRecord record : records) {
            Long id = record.getStudent().getId();
            names.put(id, record.getStudent().getName());
            StudentStats s = stats.computeIfAbsent(id, k -> new StudentStats());
            s.total++;
            if (record.getStatus() == BorrowStatus.RETURNED && record.getReturnDate() != null) {
                s.returned++;
                if (!record.getReturnDate().isAfter(record.getDueDate())) s.onTime++;
            }
        }
        return stats.entrySet().stream()
                .map(e -> {
                    StudentStats s = e.getValue();
                    int onTimePct = s.returned == 0 ? 100 : (int) Math.round(s.onTime * 100.0 / s.returned);
                    return new ConsistentStudent(names.get(e.getKey()), s.total, onTimePct);
                })
                .sorted(Comparator.comparingInt(ConsistentStudent::getTotalBorrows).reversed())
                .limit(TOP_LIST)
                .collect(Collectors.toList());
    }

    private List<OverdueEntry> buildOverdue(List<BorrowRecord> records) {
        LocalDate today = LocalDate.now();
        return records.stream()
                .filter(r -> r.getStatus() == BorrowStatus.BORROWED && r.getDueDate().toLocalDate().isBefore(today))
                .map(r -> new OverdueEntry(
                        r.getStudent().getName(),
                        r.getCopy().getBook().getTitle(),
                        (int) ChronoUnit.DAYS.between(r.getDueDate().toLocalDate(), today)))
                .sorted(Comparator.comparingInt(OverdueEntry::getDaysOverdue).reversed())
                .collect(Collectors.toList());
    }

    private static class StudentStats {
        int total;
        int returned;
        int onTime;
    }
}
