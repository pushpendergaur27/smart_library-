package com.smartlibrary.service;

import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.entity.BookCopy.CopyStatus;
import com.smartlibrary.entity.BookReview;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookReviewRepository;
import com.smartlibrary.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookReviewRepository reviewRepository;

    public ChatService(BookRepository bookRepository, BookCopyRepository bookCopyRepository,
                       BookReviewRepository reviewRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.reviewRepository = reviewRepository;
    }

    private static final Pattern P_GREET = Pattern.compile("^(hi+|hello+|hey+|yo|hi there|hello there|namaste|hola|good (morning|afternoon|evening))\\b");
    private static final Pattern P_HELP = Pattern.compile("\\b(help|what can you do|what do you do|who are you|your capabilities|capabilities|how do you work)\\b");
    private static final Pattern P_THANKS = Pattern.compile("^(thanks?|thank you|thankyou|ty|tq|ok|okay|great|nice|cool|bye+|goodbye|see (ya|you))\\b");
    private static final Pattern P_BEST = Pattern.compile("\\b(best|top rated|top-rated|highest rated|highest-rated|highest|recommend(ation)?|suggest(ion)?|favorite|favourite|most popular)\\b");
    private static final Pattern P_REVIEW = Pattern.compile("\\b(reviews?|ratings?|rated?|what do people think|how good|how did (it|they)|score)\\b");
    private static final Pattern P_AVAIL = Pattern.compile("\\b(do you have|have you got|can i borrow|can i get|may i get|available|availability|in stock|stock|does .* exist|is .* available)\\b");
    private static final Pattern P_AUTHOR_OF = Pattern.compile("\\b(who wrote|who is the author|who was the author|author of|written by|who has written|writer of)\\b");
    private static final Pattern P_BOOKS_BY = Pattern.compile("\\b(books? by|books? from|works by|specialit(y|ies)|specializ|expertise|known for)\\b");
    private static final Pattern P_DETAILS = Pattern.compile("\\b(tell me about|what is|what's|whats|describe|details?|information|info|summary|synopsis|explain|about)\\b");
    private static final Pattern P_GENRE_LIST = Pattern.compile("\\b(genres?|kinds? of books|categories)\\b");
    private static final Pattern P_HOW_MANY = Pattern.compile("\\bhow many\\b");
    private static final Pattern P_WHICH_BOOKS = Pattern.compile("(\\b(which|what) (books|titles|genres)\\b|\\b(show|list)\\b.{0,12}\\b(all )?(books|titles)\\b)");

    private static final List<String> STOP_WORDS = Arrays.asList(
            "a", "an", "the", "of", "in", "on", "for", "to", "from", "with", "is", "are", "was", "were",
            "do", "does", "did", "you", "have", "has", "any", "some", "can", "could", "would", "should",
            "i", "we", "me", "my", "please", "book", "books", "title", "titles", "copy", "copies",
            "library", "available", "availability", "stock", "exist", "exists", "there", "what", "which",
            "who", "when", "where", "why", "how", "this", "that", "these", "those", "and", "or", "it", "its",
            "about", "rated", "rating", "ratings", "review", "reviews", "best", "top", "called", "named");

    private static final List<String> AVAIL_PHRASES = Arrays.asList(
            "is there any copy of", "do you have any copy of", "do you have a copy of",
            "do you have any books", "do you have the book", "do you have a book",
            "can i borrow", "can i get", "may i get", "have you got",
            "is there", "are there", "does", "do you have", "is", "are",
            "available", "availability", "in stock", "stock");

    private static final List<String> REVIEW_PHRASES = Arrays.asList(
            "what do people think about", "what do people think of", "what do you think about",
            "how good is", "how good are", "how is", "how are",
            "reviews of", "review of", "reviews for", "review for", "ratings of", "rating of",
            "ratings for", "rating for", "rating on", "ratings on", "reviews", "review",
            "ratings", "rating", "rated", "score");

    private static final List<String> DETAILS_PHRASES = Arrays.asList(
            "tell me about", "information about", "info about", "details about", "details of",
            "what do you know about", "what is", "what's", "whats", "describe", "explain",
            "summary of", "summary", "synopsis", "information", "info", "details", "about");

    private static final List<String> AUTHOR_PHRASES = Arrays.asList(
            "who is the author of", "who was the author of", "who has written", "who wrote",
            "author of", "written by", "writer of");

    private static final List<String> BOOKS_BY_PHRASES = Arrays.asList(
            "specialities of", "speciality of", "specialties of", "specialty of",
            "specialization of", "specializations of", "expertise of",
            "known for", "works by", "books by", "books from");

    public String answer(String raw) {
        if (raw == null || raw.trim().isEmpty()) return helpText();
        String lower = raw.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
        if (lower.length() > 400) lower = lower.substring(0, 400);

        if (P_THANKS.matcher(lower).find()) {
            return "You're welcome! Anything else you'd like to know about our books?";
        }
        if (P_GREET.matcher(lower).find()) {
            return String.join("\n",
                    "Hi! I'm the Smart Library Assistant.",
                    "I can tell you which books we have, the best book in any genre,",
                    "author details, ratings & reviews, and whether a book is available.",
                    "Try asking: \"Best book in Fiction\" or \"Do you have Clean Code?\"");
        }
        if (P_HELP.matcher(lower).find()) return helpText();

        if (P_GENRE_LIST.matcher(lower).find() && !P_BEST.matcher(lower).find()
                && !P_REVIEW.matcher(lower).find() && genreNameIn(lower) == null) {
            return genreListAnswer();
        }
        if (P_HOW_MANY.matcher(lower).find() && (lower.contains("book") || lower.contains("title") || lower.contains("cop"))) {
            return countAnswer();
        }
        if (!P_BEST.matcher(lower).find() && P_WHICH_BOOKS.matcher(lower).find()
                && lower.contains("books") && genreNameIn(lower) == null) {
            return overviewAnswer();
        }

        String genre = genreNameIn(lower);

        if (P_BEST.matcher(lower).find()) {
            return bestAnswer(genre, lower);
        }

        if (P_REVIEW.matcher(lower).find()) {
            String q = remainder(lower, REVIEW_PHRASES);
            if (genre != null && isGenreOnlyQuery(q, genre)) return bestAnswer(genre, lower);
            List<Book> found = findBooks(q);
            if (found.size() == 1) return reviewsAnswer(found.get(0));
            if (found.size() > 1) return matchListAnswer(found, q);
            if (genre != null) return bestAnswer(genre, lower);
            if (q.isBlank()) return helpText();
            return notAvailable(q);
        }

        if (P_AVAIL.matcher(lower).find()) {
            String q = remainder(lower, AVAIL_PHRASES);
            if (genre != null && (q.isBlank() || isGenreOnlyQuery(q, genre))) return genreBooksAnswer(genre);
            List<Book> found = findBooks(q);
            if (found.size() == 1) return availabilityAnswer(found.get(0));
            if (found.size() > 1) return matchListAnswer(found, q);
            return notAvailable(q.isBlank() ? lower : q);
        }

        if (P_AUTHOR_OF.matcher(lower).find()) {
            String q = remainder(lower, AUTHOR_PHRASES);
            List<Book> found = findBooks(q);
            if (found.size() == 1) return wroteByAnswer(found.get(0));
            if (found.size() > 1) return matchListAnswer(found, q);
            return notAvailable(q.isBlank() ? lower : q);
        }

        if (P_BOOKS_BY.matcher(lower).find()) {
            String q = remainder(lower, BOOKS_BY_PHRASES);
            List<Book> byAuthor = booksByAuthor(q);
            if (!byAuthor.isEmpty()) return authorAnswer(byAuthor);
            List<Book> found = findBooks(q);
            if (found.size() == 1) return wroteByAnswer(found.get(0));
            if (found.size() > 1) return matchListAnswer(found, q);
            return authorNotFound(q);
        }

        if (P_DETAILS.matcher(lower).find()) {
            String q = remainder(lower, DETAILS_PHRASES);
            if (genre != null && (q.isBlank() || isGenreOnlyQuery(q, genre))) return genreBooksAnswer(genre);
            List<Book> found = findBooks(q);
            if (found.size() == 1) return detailsAnswer(found.get(0));
            if (found.size() > 1) return matchListAnswer(found, q);
            List<Book> byAuthor = booksByAuthor(q);
            if (!byAuthor.isEmpty()) return authorAnswer(byAuthor);
            return notAvailable(q.isBlank() ? lower : q);
        }

        if (genre != null && (lower.contains("book") || lower.contains("show") || lower.contains("list")
                || lower.contains("which") || lower.contains("what") || lower.contains("have")
                || lower.trim().equals(genre.toLowerCase(Locale.ROOT)))) {
            return genreBooksAnswer(genre);
        }

        if (stripStop(lower).isBlank()) return helpText();

        List<Book> found = findBooks(lower);
        if (!found.isEmpty()) return matchListAnswer(found, lower);

        if (countWords(lower) > 8) return helpText();
        return notAvailable(lower);
    }

    private String helpText() {
        return String.join("\n",
                "I'm the Smart Library Assistant. I can answer questions about:",
                "• Which books are in the library and their availability",
                "• The best book in any genre (by reader ratings)",
                "• Authors, their books and what they're known for",
                "• Ratings and reviews of any book",
                "",
                "Just ask me things like:",
                "\u2013 \"Do you have Clean Code?\"",
                "\u2013 \"Best book in Fiction\"",
                "\u2013 \"Reviews of 1984\"",
                "\u2013 \"Books by Harper Lee\"",
                "\u2013 \"What genres do you have?\"");
    }

    private String overviewAnswer() {
        List<Book> all = bookRepository.findAll();
        long totalCopies = bookCopyRepository.count();
        long available = bookCopyRepository.countByStatus(CopyStatus.AVAILABLE);
        Map<String, Long> byGenre = all.stream()
                .collect(Collectors.groupingBy(b -> b.getGenre() == null ? "Other" : b.getGenre(),
                        LinkedHashMap::new, Collectors.counting()));
        StringBuilder sb = new StringBuilder();
        sb.append("The library has ").append(all.size()).append(" titles (").append(totalCopies)
          .append(" copies), ").append(available).append(" currently available.\n\nGenres we stock:");
        byGenre.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(e -> sb.append("\n\u2022 ").append(e.getKey()).append(" \u2014 ").append(e.getValue()).append(" books"));
        sb.append("\n\nAsk me e.g. \"best book in ").append(firstGenre(byGenre)).append("\" or \"do you have <title>\".");
        return sb.toString();
    }

    private String countAnswer() {
        List<Book> all = bookRepository.findAll();
        long copies = bookCopyRepository.count();
        long available = bookCopyRepository.countByStatus(CopyStatus.AVAILABLE);
        long genres = all.stream().map(Book::getGenre).filter(g -> g != null && !g.isBlank()).distinct().count();
        return String.format("The library currently holds %d book titles across %d genres, with %d copies in total. %d copies are available to borrow right now.",
                all.size(), genres, copies, available);
    }

    private String genreListAnswer() {
        List<Book> all = bookRepository.findAll();
        if (all.isEmpty()) return "The catalog is empty right now.";
        Map<String, Long> byGenre = all.stream()
                .collect(Collectors.groupingBy(b -> b.getGenre() == null ? "Other" : b.getGenre(),
                        LinkedHashMap::new, Collectors.counting()));
        StringBuilder sb = new StringBuilder();
        sb.append("We stock ").append(all.size()).append(" titles across ").append(byGenre.size()).append(" genres:");
        byGenre.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .forEach(e -> sb.append("\n\u2022 ").append(e.getKey()).append(" \u2014 ").append(e.getValue()).append(" books"));
        sb.append("\n\nTry: \"best book in ").append(firstGenre(byGenre)).append("\" or \"books in ")
          .append(byGenre.keySet().stream().skip(1).findFirst().orElse(firstGenre(byGenre))).append("\".");
        return sb.toString();
    }

    private String genreBooksAnswer(String genre) {
        List<Book> books = booksInGenre(genre);
        if (books.isEmpty()) {
            return String.format("I don't have any books in \"%s\" right now.\nGenres we do have:\n%s",
                    genre, genreBulletList());
        }
        List<Book> ranked = rankByRating(books);
        StringBuilder sb = new StringBuilder();
        sb.append("Here are the ").append(books.size()).append(" \"").append(genre).append("\" book(s) in the library:");
        ranked.stream().limit(10).forEach(b -> sb.append("\n\u2022 ").append(b.getTitle()).append(" \u2014 ")
                .append(b.getAuthor()).append(" (").append(ratingShort(b)).append(")"));
        if (books.size() > 10) sb.append("\n\u2026 and ").append(books.size() - 10).append(" more.");
        sb.append("\n\nAsk me: \"best book in ").append(genre).append("\" or \"reviews of <title>\".");
        return sb.toString();
    }

    private String bestAnswer(String genre, String lower) {
        List<Book> pool = genre != null ? booksInGenre(genre) : bookRepository.findAll();
        if (pool.isEmpty()) {
            return String.format("I don't have any books in \"%s\".\nGenres we do have:\n%s", genre, genreBulletList());
        }
        List<Book> ranked = rankByRating(pool);
        Map<Long, Double> avgs = ratingAverages();
        boolean anyRated = pool.stream().anyMatch(b -> avgs.get(b.getId()) != null);
        StringBuilder sb = new StringBuilder();
        if (genre != null) {
            sb.append(anyRated ? "Top picks in \"" : "Some \"").append(genre)
              .append(anyRated ? "\" (by reader ratings):" : "\" books (no ratings yet):");
        } else {
            sb.append(anyRated ? "Here are the best-rated books in our library:"
                               : "Here are some of our books (no ratings yet):");
        }
        List<Book> top = ranked.stream().limit(3).collect(Collectors.toList());
        int i = 1;
        for (Book b : top) {
            sb.append("\n").append(i++).append(". ").append(b.getTitle()).append(" \u2014 ").append(b.getAuthor())
              .append(" ").append(ratingShort(b));
        }
        sb.append("\n\nWant the reviews or availability for any of these? Just ask!");
        return sb.toString();
    }

    private String reviewsAnswer(Book book) {
        Double avg = avgRating(book);
        long count = reviewRepository.countByBookId(book.getId());
        StringBuilder sb = new StringBuilder();
        sb.append("\"").append(book.getTitle()).append("\" by ").append(book.getAuthor());
        if (count == 0 || avg == null) {
            sb.append("\nNo reviews yet \u2014 be the first to review it on the book's page!");
            return sb.toString();
        }
        sb.append(String.format("\nRating: \u2605 %.1f from %d %s.", avg, count, count == 1 ? "review" : "reviews"));
        List<BookReview> reviews = reviewRepository.findByBookIdWithStudent(book.getId());
        if (!reviews.isEmpty()) {
            sb.append("\n\nRecent reviews:");
            for (BookReview r : reviews.stream().limit(3).collect(Collectors.toList())) {
                sb.append("\n\u2022 \u2605").append(r.getRating()).append(" \u2014 ")
                  .append(r.getStudent() != null ? r.getStudent().getName() : "Student");
                if (r.getComment() != null && !r.getComment().isBlank()) {
                    sb.append(": \u201c").append(trim(r.getComment(), 140)).append("\u201d");
                }
            }
        }
        sb.append("\n\n").append(availabilityLine(book));
        return sb.toString();
    }

    private String availabilityAnswer(Book book) {
        StringBuilder sb = new StringBuilder();
        sb.append("\"").append(book.getTitle()).append("\" by ").append(book.getAuthor())
          .append(" (").append(book.getGenre() == null ? "General" : book.getGenre()).append(")");
        sb.append("\n").append(availabilityLine(book));
        Double avg = avgRating(book);
        long rc = reviewRepository.countByBookId(book.getId());
        if (avg != null && rc > 0) sb.append(String.format("\nRating: \u2605 %.1f from %d %s.", avg, rc, rc == 1 ? "review" : "reviews"));
        return sb.toString();
    }

    private String wroteByAnswer(Book book) {
        StringBuilder sb = new StringBuilder();
        sb.append("\"").append(book.getTitle()).append("\" was written by ").append(book.getAuthor()).append(".");
        if (book.getGenre() != null || book.getPublicationYear() != null) {
            sb.append("\n");
            if (book.getGenre() != null) sb.append("Genre: ").append(book.getGenre());
            if (book.getPublicationYear() != null) {
                if (book.getGenre() != null) sb.append(" \u2022 ");
                sb.append(book.getPublicationYear());
            }
        }
        Double avg = avgRating(book);
        long rc = reviewRepository.countByBookId(book.getId());
        if (avg != null && rc > 0) sb.append(String.format("\nRating: \u2605 %.1f (%d %s).", avg, rc, rc == 1 ? "review" : "reviews"));
        sb.append("\n").append(availabilityLine(book));
        return sb.toString();
    }

    private String authorAnswer(List<Book> booksByAuthor) {
        String author = booksByAuthor.get(0).getAuthor();
        List<Book> ranked = rankByRating(booksByAuthor);
        Set<String> genres = booksByAuthor.stream()
                .map(Book::getGenre)
                .filter(g -> g != null && !g.isBlank())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        StringBuilder sb = new StringBuilder();
        sb.append(author).append(" has ").append(booksByAuthor.size())
          .append(booksByAuthor.size() == 1 ? " book" : " books").append(" in our library:");
        for (Book b : ranked) {
            sb.append("\n\u2022 ").append(b.getTitle()).append(" \u2014 ").append(ratingShort(b));
            if (b.getGenre() != null) sb.append(" (").append(b.getGenre()).append(")");
        }
        if (!genres.isEmpty()) sb.append("\nKnown for: ").append(String.join(", ", genres));
        Book top = ranked.get(0);
        if (avgRating(top) != null) {
            sb.append("\nHighest rated: \"").append(top.getTitle()).append("\" ").append(ratingShort(top));
        }
        return sb.toString();
    }

    private String detailsAnswer(Book book) {
        StringBuilder sb = new StringBuilder();
        sb.append("\"").append(book.getTitle()).append("\" by ").append(book.getAuthor());
        sb.append("\nGenre: ").append(book.getGenre() == null ? "General" : book.getGenre());
        if (book.getPublisher() != null) sb.append(" \u2022 Publisher: ").append(book.getPublisher());
        if (book.getPublicationYear() != null) sb.append(" \u2022 Year: ").append(book.getPublicationYear());
        Double avg = avgRating(book);
        long rc = reviewRepository.countByBookId(book.getId());
        if (avg != null && rc > 0) sb.append(String.format("\nRating: \u2605 %.1f from %d %s.", avg, rc, rc == 1 ? "review" : "reviews"));
        if (book.getIsbn() != null) sb.append("\nISBN: ").append(book.getIsbn());
        sb.append("\n").append(availabilityLine(book));
        if (book.getDescription() != null && !book.getDescription().isBlank()) {
            sb.append("\nAbout: ").append(trim(book.getDescription(), 240));
        }
        return sb.toString();
    }

    private String matchListAnswer(List<Book> found, String query) {
        List<Book> ranked = rankByRating(found);
        StringBuilder sb = new StringBuilder();
        sb.append("I found ").append(found.size()).append(found.size() == 1 ? " book" : " books")
          .append(" matching \u201c").append(trim(query, 60)).append("\u201d:");
        ranked.stream().limit(6).forEach(b -> {
            sb.append("\n\u2022 ").append(b.getTitle()).append(" \u2014 ").append(b.getAuthor());
            if (b.getGenre() != null) sb.append(" (").append(b.getGenre()).append(")");
            sb.append(" \u2014 ").append(availShort(b));
        });
        if (found.size() > 6) sb.append("\n\u2026 and ").append(found.size() - 6).append(" more.");
        sb.append("\n\nAsk for details, reviews or availability of any title.");
        return sb.toString();
    }

    private String notAvailable(String query) {
        List<Book> top = rankByRating(bookRepository.findAll()).stream().limit(3).collect(Collectors.toList());
        StringBuilder sb = new StringBuilder();
        sb.append("Sorry, \u201c").append(trim(query, 80)).append("\u201d is not available \u2014 I couldn't find it in our catalog.");
        sb.append("\n\nHere's what you can do:");
        sb.append("\n\u2022 Check the spelling, or try the author's name or ISBN");
        sb.append("\n\u2022 Browse a genre: ").append(genreBulletList());
        sb.append("\n\u2022 Ask me for the best book in a genre");
        if (!top.isEmpty()) {
            sb.append("\n\nYou may also like (top rated): ");
            List<String> titles = top.stream().map(b -> b.getTitle() + " " + ratingShort(b)).collect(Collectors.toList());
            sb.append(String.join(", ", titles));
        }
        return sb.toString();
    }

    private String authorNotFound(String query) {
        return String.format("No books by \u201c%s\u201d are in our catalog right now.%n%nYou can browse what we do have:%n\u2022 Genres: %s%n\u2022 Or ask me for the best book in a genre.",
                trim(query, 60), genreBulletList());
    }

    private String availabilityLine(Book book) {
        long total = bookCopyRepository.countByBookId(book.getId());
        long available = bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
        if (total == 0) return "Availability: no copies registered yet.";
        if (available == 0) {
            return String.format("Availability: all %d copies are currently issued \u2014 none available right now.", total);
        }
        String location = bookCopyRepository.findByBookId(book.getId()).stream()
                .filter(c -> c.getStatus() == CopyStatus.AVAILABLE)
                .findFirst()
                .map(c -> String.format(" Available copy: Floor %s, Section %s, Shelf %s.", c.getFloor(), c.getSection(), c.getShelf()))
                .orElse("");
        return String.format("Availability: %d of %d copies available.%s", available, total, location);
    }

    private String availShort(Book book) {
        long total = bookCopyRepository.countByBookId(book.getId());
        long available = bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
        if (total == 0) return "no copies";
        return available == 0 ? "all issued" : available + "/" + total + " available";
    }

    private List<Book> findBooks(String text) {
        for (String candidate : searchCandidates(text)) {
            if (candidate.isBlank()) continue;
            List<Book> res = bookRepository.search(candidate);
            if (!res.isEmpty()) return res;
        }
        return new ArrayList<>();
    }

    private List<String> searchCandidates(String text) {
        String t = text == null ? "" : text.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
        List<String> out = new ArrayList<>();
        out.add(t);
        String stripped = stripStop(t);
        if (!stripped.equals(t)) out.add(stripped);
        String trimmed = stripped.replaceAll("\\s+(books?|titles?|copies|copy|novels?|read)$", "").trim();
        if (!trimmed.isEmpty() && !trimmed.equals(stripped)) out.add(trimmed);
        return out;
    }

    private String stripStop(String t) {
        String out = t;
        for (String w : STOP_WORDS) {
            out = out.replaceAll("(?i)(^|\\s)" + Pattern.quote(w) + "(\\s|$)", " ");
        }
        return out.replaceAll("\\s+", " ").trim();
    }

    private String remainder(String lower, List<String> phrases) {
        String out = " " + lower + " ";
        for (String p : phrases) {
            int idx = out.indexOf(" " + p);
            if (idx >= 0) {
                out = out.substring(0, idx) + " " + out.substring(idx + p.length() + 1);
            }
        }
        return out.replaceAll("\\s+", " ").trim();
    }

    private List<Book> booksInGenre(String genre) {
        String g = genre.toLowerCase(Locale.ROOT);
        return bookRepository.findAll().stream()
                .filter(b -> b.getGenre() != null && b.getGenre().toLowerCase(Locale.ROOT).equals(g))
                .collect(Collectors.toList());
    }

    private List<Book> booksByAuthor(String query) {
        if (query == null || query.isBlank()) return new ArrayList<>();
        String[] tokens = query.toLowerCase(Locale.ROOT).split("\\s+");
        return bookRepository.findAll().stream()
                .filter(b -> {
                    String a = b.getAuthor() == null ? "" : b.getAuthor().toLowerCase(Locale.ROOT);
                    if (a.isEmpty()) return false;
                    if (a.contains(query.toLowerCase(Locale.ROOT))) return true;
                    return Arrays.stream(tokens).allMatch(a::contains);
                })
                .collect(Collectors.toList());
    }

    private String genreNameIn(String lower) {
        List<String> genres = bookRepository.findAll().stream()
                .map(Book::getGenre)
                .filter(g -> g != null && !g.isBlank())
                .distinct()
                .collect(Collectors.toList());
        String compact = lower.replace("-", " ").replace("_", " ");
        String best = null;
        for (String g : genres) {
            String gl = g.toLowerCase(Locale.ROOT);
            String glCompact = gl.replace("-", " ");
            boolean hit = lower.contains(gl) || compact.contains(glCompact);
            if (hit && (best == null || gl.length() > best.length())) best = g;
        }
        return best;
    }

    private boolean isGenreOnlyQuery(String q, String genre) {
        String stripped = stripStop(q.replace(genre.toLowerCase(Locale.ROOT), "")).trim();
        return stripped.isBlank();
    }

    private List<Book> rankByRating(List<Book> books) {
        if (books.size() <= 1) return new ArrayList<>(books);
        Map<Long, Double> avgs = new java.util.HashMap<>();
        Map<Long, Long> counts = new java.util.HashMap<>();
        for (Object[] row : reviewRepository.findRatingSummaries()) {
            avgs.put((Long) row[0], row[1] == null ? null : ((Number) row[1]).doubleValue());
            counts.put((Long) row[0], row[2] == null ? 0L : ((Number) row[2]).longValue());
        }
        return books.stream()
                .sorted(Comparator
                        .comparing((Book b) -> {
                            Double v = avgs.get(b.getId());
                            return v == null ? -1.0 : v;
                        }, Comparator.reverseOrder())
                        .thenComparing((Book b) -> {
                            Long c = counts.get(b.getId());
                            return c == null ? 0L : c;
                        }, Comparator.reverseOrder())
                        .thenComparing(b -> b.getTitle().toLowerCase(Locale.ROOT)))
                .collect(Collectors.toList());
    }

    private Double avgRating(Book book) {
        return reviewRepository.findAverageRatingByBookId(book.getId());
    }

    private Map<Long, Double> ratingAverages() {
        Map<Long, Double> avgs = new java.util.HashMap<>();
        for (Object[] row : reviewRepository.findRatingSummaries()) {
            avgs.put((Long) row[0], row[1] == null ? null : ((Number) row[1]).doubleValue());
        }
        return avgs;
    }

    private String ratingShort(Book book) {
        Double avg = avgRating(book);
        long rc = reviewRepository.countByBookId(book.getId());
        if (avg == null || rc == 0) return "no ratings";
        return String.format("\u2605 %.1f (%d %s)", avg, rc, rc == 1 ? "review" : "reviews");
    }

    private String genreBulletList() {
        return bookRepository.findAll().stream()
                .map(Book::getGenre)
                .filter(g -> g != null && !g.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.joining(", "));
    }

    private String firstGenre(Map<String, Long> byGenre) {
        return byGenre.keySet().stream().findFirst().orElse("Fiction");
    }

    private int countWords(String s) {
        return s.isBlank() ? 0 : s.split("\\s+").length;
    }

    private String trim(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max).trim() + "\u2026";
    }
}
