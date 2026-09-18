package com.smartlibrary.repository;

import com.smartlibrary.entity.BorrowRecord;
import com.smartlibrary.entity.BorrowRecord.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    @Query("SELECT br FROM BorrowRecord br WHERE br.student.id = :studentId AND br.status = :status")
    List<BorrowRecord> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") BorrowStatus status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.student.id = :studentId ORDER BY br.borrowDate DESC")
    List<BorrowRecord> findByStudentIdOrderByBorrowDateDesc(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT br FROM BorrowRecord br JOIN FETCH br.copy c JOIN FETCH c.book b WHERE br.student.id = :studentId ORDER BY br.borrowDate DESC")
    List<BorrowRecord> findHistoryWithBookByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT br FROM BorrowRecord br WHERE br.copy.id = :copyId AND br.status = 'BORROWED'")
    Optional<BorrowRecord> findActiveBorrowByCopyId(@Param("copyId") Long copyId);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'BORROWED'")
    List<BorrowRecord> findAllActiveBorrows();

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'BORROWED' AND br.dueDate < CURRENT_TIMESTAMP")
    List<BorrowRecord> findOverdueBorrows();

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.status = 'BORROWED' AND br.student.id = :studentId")
    long countActiveBorrowsByStudent(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.student.id = :studentId AND br.copy.book.id = :bookId AND br.status = 'BORROWED'")
    long countActiveBorrowByStudentAndBook(@Param("studentId") Long studentId, @Param("bookId") Long bookId);

    @Query("SELECT COUNT(br) FROM BorrowRecord br")
    long countAll();
}
