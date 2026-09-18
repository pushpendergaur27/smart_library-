package com.smartlibrary.service;

import com.smartlibrary.dto.BookResponse;
import com.smartlibrary.dto.RecommendationResponse;
import com.smartlibrary.entity.BorrowRecord;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.BorrowRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;

    public RecommendationService(BorrowRecordRepository borrowRecordRepository,
                                  BookRepository bookRepository,
                                  BookService bookService) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.bookService = bookService;
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendations(Long studentId) {
        List<BorrowRecord> history = borrowRecordRepository.findHistoryWithBookByStudentId(studentId);

        Set<Long> borrowedBookIds = history.stream()
                .map(br -> br.getCopy().getBook().getId())
                .collect(Collectors.toSet());

        Map<String, Long> genreFrequency = new LinkedHashMap<>();
        Map<String, Long> authorFrequency = new LinkedHashMap<>();

        for (BorrowRecord record : history) {
            String genre = record.getCopy().getBook().getGenre();
            String author = record.getCopy().getBook().getAuthor();
            if (genre != null) {
                genreFrequency.merge(genre, 1L, Long::sum);
            }
            if (author != null) {
                authorFrequency.merge(author, 1L, Long::sum);
            }
        }

        List<RecommendationResponse> recommendations = new ArrayList<>();

        if (history.isEmpty()) {
            List<BookResponse> popularBooks = bookRepository.findAll().stream()
                    .filter(b -> !borrowedBookIds.contains(b.getId()))
                    .limit(6)
                    .map(b -> bookService.getBookByIdSafe(b.getId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            if (!popularBooks.isEmpty()) {
                recommendations.add(new RecommendationResponse("Popular books to get you started", popularBooks));
            }
            return recommendations;
        }

        String topGenre = genreFrequency.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (topGenre != null) {
            List<BookResponse> genreBooks = bookRepository.searchAdvanced(null, null, null, topGenre).stream()
                    .filter(b -> !borrowedBookIds.contains(b.getId()))
                    .limit(6)
                    .map(b -> bookService.getBookByIdSafe(b.getId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            if (!genreBooks.isEmpty()) {
                recommendations.add(new RecommendationResponse(
                        "Because you enjoy " + topGenre, genreBooks));
            }
        }

        String topAuthor = authorFrequency.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (topAuthor != null) {
            List<BookResponse> authorBooks = bookRepository.search(topAuthor).stream()
                    .filter(b -> !borrowedBookIds.contains(b.getId()))
                    .limit(6)
                    .map(b -> bookService.getBookByIdSafe(b.getId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            if (!authorBooks.isEmpty()) {
                recommendations.add(new RecommendationResponse(
                        "More books by " + topAuthor, authorBooks));
            }
        }

        Set<String> topGenres = genreFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<BookResponse> exploreBooks = bookRepository.findAll().stream()
                .filter(b -> !borrowedBookIds.contains(b.getId()))
                .filter(b -> !topGenres.contains(b.getGenre()))
                .limit(6)
                .map(b -> bookService.getBookByIdSafe(b.getId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        if (!exploreBooks.isEmpty()) {
            recommendations.add(new RecommendationResponse(
                    "Explore something different", exploreBooks));
        }

        return recommendations;
    }
}
