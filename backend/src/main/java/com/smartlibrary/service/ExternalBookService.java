package com.smartlibrary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlibrary.dto.BookFactsResponse;
import com.smartlibrary.dto.ExternalBookResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class ExternalBookService {

    private static final Logger log = LoggerFactory.getLogger(ExternalBookService.class);

    private static final String GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?q=%s&maxResults=10";
    private static final String OPEN_LIBRARY_URL = "https://openlibrary.org/search.json?q=%s&limit=10&fields=title,author_name,isbn,first_publish_year,publisher,cover_i,subject";
    private static final String OPEN_LIBRARY_ISBN_URL = "https://openlibrary.org/search.json?q=isbn:%s&fields=key,title,number_of_pages_median,ratings_count";
    private static final String OPEN_LIBRARY_RATINGS_URL = "https://openlibrary.org/works/%s/ratings.json";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String googleApiKey;

    public ExternalBookService(ObjectMapper objectMapper,
                               @Value("${app.google-books.api-key:}") String googleApiKey) {
        this.objectMapper = objectMapper;
        this.googleApiKey = googleApiKey == null ? "" : googleApiKey.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    public List<ExternalBookResponse> search(String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String q = query.trim();
        int max = Math.max(1, Math.min(limit, 20));

        if (!googleApiKey.isEmpty()) {
            try {
                List<ExternalBookResponse> results = searchGoogleBooks(q, max);
                if (!results.isEmpty()) {
                    return results;
                }
            } catch (Exception e) {
                log.warn("Google Books search failed, falling back to Open Library: {}", e.getMessage());
            }
        }
        try {
            return searchOpenLibrary(q, max);
        } catch (Exception e) {
            log.error("Open Library search failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<ExternalBookResponse> searchGoogleBooks(String query, int max) throws Exception {
        String url = String.format(GOOGLE_BOOKS_URL, URLEncoder.encode(query, StandardCharsets.UTF_8))
                + "&key=" + URLEncoder.encode(googleApiKey, StandardCharsets.UTF_8);
        JsonNode root = get(url);
        List<ExternalBookResponse> results = new ArrayList<>();
        JsonNode items = root.path("items");
        if (!items.isArray()) {
            return results;
        }
        for (JsonNode item : items) {
            if (results.size() >= max) break;
            JsonNode info = item.path("volumeInfo");
            ExternalBookResponse book = new ExternalBookResponse();
            book.setTitle(info.path("title").asText(null));
            book.setAuthors(readStringArray(info.path("authors")));
            book.setPublisher(info.path("publisher").asText(null));
            book.setPublicationYear(parseYear(info.path("publishedDate").asText(null)));
            book.setDescription(info.path("description").asText(null));
            book.setGenre(readStringArray(info.path("categories")).stream().findFirst().orElse(null));
            book.setIsbn(extractIsbn(info.path("industryIdentifiers")));
            String thumbnail = info.path("imageLinks").path("thumbnail").asText(null);
            if (thumbnail != null) {
                book.setCoverImage(thumbnail.replace("http://", "https://"));
            }
            book.setSource("Google Books");
            if (book.getTitle() != null) {
                results.add(book);
            }
        }
        return results;
    }

    private List<ExternalBookResponse> searchOpenLibrary(String query, int max) throws Exception {
        String url = String.format(OPEN_LIBRARY_URL, URLEncoder.encode(query, StandardCharsets.UTF_8));
        JsonNode root = get(url);
        List<ExternalBookResponse> results = new ArrayList<>();
        JsonNode docs = root.path("docs");
        if (!docs.isArray()) {
            return results;
        }
        for (JsonNode doc : docs) {
            if (results.size() >= max) break;
            ExternalBookResponse book = new ExternalBookResponse();
            book.setTitle(doc.path("title").asText(null));
            book.setAuthors(readStringArray(doc.path("author_name")));
            book.setPublisher(firstOf(doc.path("publisher")));
            Integer year = doc.path("first_publish_year").isInt() ? doc.path("first_publish_year").asInt() : null;
            book.setPublicationYear(year != null && year > 0 ? year : null);
            book.setIsbn(preferIsbn13(readStringArray(doc.path("isbn"))));
            book.setGenre(firstOf(doc.path("subject")));
            Integer coverId = doc.path("cover_i").isInt() ? doc.path("cover_i").asInt() : null;
            if (coverId != null) {
                book.setCoverImage("https://covers.openlibrary.org/b/id/" + coverId + "-L.jpg");
            }
            book.setSource("Open Library");
            if (book.getTitle() != null) {
                results.add(book);
            }
        }
        return results;
    }

    public BookFactsResponse getBookFacts(String isbn) {
        BookFactsResponse facts = new BookFactsResponse();
        String clean = isbn == null ? "" : isbn.replaceAll("[^0-9Xx]", "");
        if (clean.length() < 10) {
            return facts;
        }

        if (!googleApiKey.isEmpty()) {
            try {
                String url = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + clean
                        + "&key=" + URLEncoder.encode(googleApiKey, StandardCharsets.UTF_8);
                JsonNode items = get(url).path("items");
                if (items.isArray() && items.size() > 0) {
                    JsonNode info = items.get(0).path("volumeInfo");
                    if (info.hasNonNull("pageCount")) facts.setPageCount(info.path("pageCount").asInt());
                    if (info.hasNonNull("averageRating")) facts.setRating(info.path("averageRating").asDouble());
                    if (info.hasNonNull("ratingsCount")) facts.setRatingsCount(info.path("ratingsCount").asInt());
                    facts.setSource("Google Books");
                }
            } catch (Exception e) {
                log.warn("Google Books facts lookup failed: {}", e.getMessage());
            }
        }

        if (facts.getPageCount() == null || facts.getRating() == null) {
            try {
                String url = String.format(OPEN_LIBRARY_ISBN_URL, clean);
                JsonNode docs = get(url).path("docs");
                if (docs.isArray() && docs.size() > 0) {
                    JsonNode doc = docs.get(0);
                    if (facts.getPageCount() == null && doc.path("number_of_pages_median").isInt()) {
                        facts.setPageCount(doc.path("number_of_pages_median").asInt());
                    }
                    if (facts.getRatingsCount() == null && doc.path("ratings_count").isInt()) {
                        facts.setRatingsCount(doc.path("ratings_count").asInt());
                    }
                    String workKey = doc.path("key").asText("");
                    if (workKey.startsWith("/works/")) {
                        try {
                            JsonNode summary = get(String.format(OPEN_LIBRARY_RATINGS_URL, workKey.substring(7))).path("summary");
                            if (facts.getRating() == null && summary.path("average").isNumber()) {
                                facts.setRating(Math.round(summary.path("average").asDouble() * 10.0) / 10.0);
                            }
                        } catch (Exception e) {
                            log.debug("No ratings available for work {}: {}", workKey, e.getMessage());
                        }
                    }
                    if (facts.getSource() == null) facts.setSource("Open Library");
                }
            } catch (Exception e) {
                log.warn("Open Library facts lookup failed: {}", e.getMessage());
            }
        }
        return facts;
    }

    private JsonNode get(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .header("User-Agent", "SmartLibraryAssistant/1.0")
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("HTTP " + response.statusCode() + " from book search API");
        }
        return objectMapper.readTree(response.body());
    }

    private List<String> readStringArray(JsonNode array) {
        if (array == null || !array.isArray()) {
            return List.of();
        }
        return StreamSupport.stream(array.spliterator(), false)
                .map(JsonNode::asText)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toList());
    }

    private String firstOf(JsonNode array) {
        List<String> values = readStringArray(array);
        return values.isEmpty() ? null : values.get(0);
    }

    private String preferIsbn13(List<String> isbns) {
        if (isbns == null || isbns.isEmpty()) return null;
        return isbns.stream().filter(i -> i.length() == 13 || i.length() == 17).findFirst().orElse(isbns.get(0));
    }

    private String extractIsbn(JsonNode identifiers) {
        if (identifiers == null || !identifiers.isArray()) return null;
        String isbn10 = null;
        for (JsonNode id : identifiers) {
            String type = id.path("type").asText("");
            String value = id.path("identifier").asText(null);
            if (value == null) continue;
            if ("ISBN_13".equals(type)) return value;
            if ("ISBN_10".equals(type)) isbn10 = value;
        }
        return isbn10;
    }

    private Integer parseYear(String date) {
        if (date == null || date.length() < 4) return null;
        try {
            int year = Integer.parseInt(date.substring(0, 4));
            return year > 0 && year < 2200 ? year : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
