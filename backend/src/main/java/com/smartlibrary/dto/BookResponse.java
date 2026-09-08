package com.smartlibrary.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BookResponse {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private String genre;
    private String description;
    private String coverImage;
    private String language;
    private String edition;
    private Integer publicationYear;
    private LocalDateTime createdAt;
    private int totalCopies;
    private int availableCopies;
    private List<CopyResponse> copies;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getEdition() { return edition; }
    public void setEdition(String edition) { this.edition = edition; }
    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public int getTotalCopies() { return totalCopies; }
    public void setTotalCopies(int totalCopies) { this.totalCopies = totalCopies; }
    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int availableCopies) { this.availableCopies = availableCopies; }
    public List<CopyResponse> getCopies() { return copies; }
    public void setCopies(List<CopyResponse> copies) { this.copies = copies; }
}
