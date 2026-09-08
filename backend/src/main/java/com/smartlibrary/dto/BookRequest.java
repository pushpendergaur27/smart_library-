package com.smartlibrary.dto;

import jakarta.validation.constraints.NotBlank;

public class BookRequest {
    @NotBlank(message = "ISBN is required")
    private String isbn;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Author is required")
    private String author;
    private String publisher;
    private String genre;
    private String description;
    private String coverImage;
    private String language;
    private String edition;
    private Integer publicationYear;

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
}
