package com.smartlibrary.config;

import com.smartlibrary.entity.*;
import com.smartlibrary.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final StudentRepository studentRepository;
    private final LibrarianRepository librarianRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(StudentRepository studentRepository, LibrarianRepository librarianRepository,
                           BookRepository bookRepository, BookCopyRepository bookCopyRepository,
                           PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.librarianRepository = librarianRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (librarianRepository.count() == 0) {
            Librarian librarian = new Librarian();
            librarian.setName("Admin Librarian");
            librarian.setEmail("librarian@smartlibrary.com");
            librarian.setPassword(passwordEncoder.encode("librarian123"));
            librarian.setPhone("1234567890");
            librarian.setRole(Student.Role.LIBRARIAN);
            librarianRepository.save(librarian);
            log.info("Default librarian created: librarian@smartlibrary.com / librarian123");
        }

        if (studentRepository.count() == 0) {
            Student student = new Student();
            student.setName("Demo Student");
            student.setEmail("student@smartlibrary.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setPhone("0987654321");
            student.setCourse("Computer Science");
            student.setYear("3");
            student.setRole(Student.Role.STUDENT);
            studentRepository.save(student);
            log.info("Demo student created: student@smartlibrary.com / student123");
        }

        if (bookRepository.count() == 0) {
            createSampleBooks();
        }
    }

    private void createSampleBooks() {
        List<BookData> booksData = List.of(
            new BookData("978-0134685991", "Effective Java", "Joshua Bloch", "Addison-Wesley", "Computer Science",
                "A definitive guide to Java programming language best practices.", "English", "3rd", 2018),
            new BookData("978-0132350884", "Clean Code", "Robert C. Martin", "Prentice Hall", "Computer Science",
                "A handbook of agile software craftsmanship.", "English", "1st", 2008),
            new BookData("978-0201633610", "Design Patterns", "Erich Gamma", "Addison-Wesley", "Computer Science",
                "Elements of reusable object-oriented software.", "English", "1st", 1994),
            new BookData("978-0596517748", "JavaScript: The Good Parts", "Douglas Crockford", "O'Reilly Media", "Computer Science",
                "Unearthing the excellence in JavaScript.", "English", "1st", 2008),
            new BookData("978-0131103627", "The C Programming Language", "Brian W. Kernighan", "Prentice Hall", "Computer Science",
                "The authoritative reference manual for C.", "English", "2nd", 1988),
            new BookData("978-0321125217", "Domain-Driven Design", "Eric Evans", "Addison-Wesley", "Computer Science",
                "Tackling complexity in the heart of software.", "English", "1st", 2003),
            new BookData("978-1491950357", "Head First Design Patterns", "Eric Freeman", "O'Reilly Media", "Computer Science",
                "A brain-friendly guide to design patterns.", "English", "2nd", 2020),
            new BookData("978-0262033848", "Introduction to Algorithms", "Thomas H. Cormen", "MIT Press", "Computer Science",
                "The most comprehensive textbook on algorithms.", "English", "3rd", 2009),
            new BookData("978-0134177700", "A Brief History of Time", "Stephen Hawking", "Bantam Books", "Physics",
                "From the Big Bang to black holes.", "English", "1st", 1988),
            new BookData("978-0060935467", "To Kill a Mockingbird", "Harper Lee", "Harper Perennial", "Fiction",
                "A classic of modern American literature.", "English", "1st", 1960),
            new BookData("978-0451524935", "1984", "George Orwell", "Signet Classics", "Fiction",
                "A dystopian social science fiction novel.", "English", "1st", 1949),
            new BookData("978-0743273565", "The Great Gatsby", "F. Scott Fitzgerald", "Scribner", "Fiction",
                "A story of the fabulously wealthy Jay Gatsby.", "English", "1st", 1925),
            new BookData("978-0316769488", "The Catcher in the Rye", "J.D. Salinger", "Little, Brown", "Fiction",
                "A story about teenage angst and alienation.", "English", "1st", 1951),
            new BookData("978-0140283297", "The Alchemist", "Paulo Coelho", "HarperOne", "Fiction",
                "A novel about following your dreams.", "English", "1st", 1988),
            new BookData("978-0141439518", "Pride and Prejudice", "Jane Austen", "Penguin Classics", "Fiction",
                "A romantic novel of manners.", "English", "1st", 1813),
            new BookData("978-0439023481", "The Hunger Games", "Suzanne Collins", "Scholastic", "Fiction",
                "A dystopian novel about survival.", "English", "1st", 2008),
            new BookData("978-0062316102", "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "Harper", "History",
                "A narrative of humanitys creation and evolution.", "English", "1st", 2011),
            new BookData("978-0393602586", "Thinking, Fast and Slow", "Daniel Kahneman", "Farrar, Straus and Giroux", "Psychology",
                "A groundbreaking tour of the mind.", "English", "1st", 2011),
            new BookData("978-0140283334", "The Selfish Gene", "Richard Dawkins", "Oxford University Press", "Biology",
                "A gene-centered view of evolution.", "English", "1st", 1976),
            new BookData("978-1292222431", "University Physics with Modern Physics", "Hugh D. Young", "Pearson", "Physics",
                "The benchmark for clarity and rigor in physics.", "English", "15th", 2019),
            new BookData("978-0321947109", "Calculus: Early Transcendentals", "James Stewart", "Cengage Learning", "Mathematics",
                "The most widely used calculus textbook in the world.", "English", "8th", 2015),
            new BookData("978-0134093413", "Campbell Biology", "Lisa A. Urry", "Pearson", "Biology",
                "The world's most successful biology textbook.", "English", "11th", 2016),
            new BookData("978-0134746807", "Chemistry: The Central Science", "Theodore L. Brown", "Pearson", "Chemistry",
                "The most trusted general chemistry text.", "English", "14th", 2017),
            new BookData("978-0073523323", "Principles of Economics", "N. Gregory Mankiw", "Cengage Learning", "Economics",
                "The most popular introductory economics textbook.", "English", "8th", 2017),
            new BookData("978-1319013387", "The Elements of Style", "William Strunk Jr.", "Pearson", "Reference",
                "Classic guide to English style and usage.", "English", "4th", 2000),
            new BookData("978-0134610993", "Chemistry: A Molecular Approach", "Nivaldo J. Tro", "Pearson", "Chemistry",
                "A visual, conceptual approach to chemistry.", "English", "5th", 2019),
            new BookData("978-0321936912", "University Physics", "Hugh D. Young", "Pearson", "Physics",
                "Classic physics textbook with modern applications.", "English", "14th", 2015),
            new BookData("978-1292093628", "Engineering Mechanics: Statics", "Russell C. Hibbeler", "Pearson", "Engineering",
                "The standard textbook for engineering mechanics.", "English", "14th", 2015),
            new BookData("978-0132774208", "Fundamentals of Electric Circuits", "Charles K. Alexander", "McGraw-Hill", "Engineering",
                "A comprehensive introduction to electric circuits.", "English", "6th", 2016),
            new BookData("978-0134753119", "The Art of Strategy", "Avinash K. Dixit", "W.W. Norton", "Business",
                "A game theorist's guide to success in business and life.", "English", "1st", 2008),
            new BookData("978-0062316097", "The Power of Habit", "Charles Duhigg", "Random House", "Psychology",
                "Why we do what we do in life and business.", "English", "1st", 2012),
            new BookData("978-0143127741", "Quiet: The Power of Introverts", "Susan Cain", "Crown", "Psychology",
                "The power of introverts in a world that can't stop talking.", "English", "1st", 2012),
            new BookData("978-0062457714", "The Subtle Art of Not Giving a F*ck", "Mark Manson", "HarperOne", "Non-Fiction",
                "A counterintuitive approach to living a good life.", "English", "1st", 2016),
            new BookData("978-1501222702", "The 48 Laws of Power", "Robert Greene", "Penguin", "Non-Fiction",
                "A guide to gaining and maintaining power.", "English", "1st", 1998),
            new BookData("978-0143125174", "The Girl on the Train", "Paula Hawkins", "Riverhead Books", "Fiction",
                "A psychological thriller.", "English", "1st", 2015)
        );

        for (BookData bd : booksData) {
            Book book = new Book();
            book.setIsbn(bd.isbn);
            book.setTitle(bd.title);
            book.setAuthor(bd.author);
            book.setPublisher(bd.publisher);
            book.setGenre(bd.genre);
            book.setDescription(bd.description);
            book.setLanguage(bd.language);
            book.setEdition(bd.edition);
            book.setPublicationYear(bd.publicationYear);
            book = bookRepository.save(book);

            for (int i = 1; i <= 3; i++) {
                BookCopy copy = new BookCopy();
                copy.setBook(book);
                copy.setLibraryBarcode(bd.isbn.replace("-", "") + "-C" + i);
                copy.setFloor(String.valueOf(1 + (int)(Math.random() * 3)));
                copy.setSection("Section " + (char)('A' + (int)(Math.random() * 5)));
                copy.setShelf("S" + (1 + (int)(Math.random() * 10)));
                copy.setRack("R" + (1 + (int)(Math.random() * 5)));
                copy.setRowNumber("Row" + (1 + (int)(Math.random() * 4)));
                copy.setStatus(BookCopy.CopyStatus.AVAILABLE);
                bookCopyRepository.save(copy);
            }
        }
        log.info("Sample books and copies created successfully");
    }

    private static class BookData {
        String isbn, title, author, publisher, genre, description, language, edition;
        Integer publicationYear;

        BookData(String isbn, String title, String author, String publisher, String genre,
                 String description, String language, String edition, Integer publicationYear) {
            this.isbn = isbn;
            this.title = title;
            this.author = author;
            this.publisher = publisher;
            this.genre = genre;
            this.description = description;
            this.language = language;
            this.edition = edition;
            this.publicationYear = publicationYear;
        }
    }
}
