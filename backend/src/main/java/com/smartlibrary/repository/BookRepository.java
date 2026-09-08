package com.smartlibrary.repository;

import com.smartlibrary.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);

    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.genre) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Book> search(@Param("query") String query);

    @Query("SELECT b FROM Book b WHERE " +
           "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:isbn IS NULL OR b.isbn = :isbn) AND " +
           "(:genre IS NULL OR LOWER(b.genre) = LOWER(:genre))")
    List<Book> searchAdvanced(@Param("title") String title,
                               @Param("author") String author,
                               @Param("isbn") String isbn,
                               @Param("genre") String genre);
}
