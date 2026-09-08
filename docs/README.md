# Smart Library Management System - Phase 1

## Required Software

- Java JDK 17 or higher
- Apache Maven 3.8+
- Node.js 18 or higher (with npm)
- MySQL Server 8.0+
- MySQL Workbench (optional, for database management)

## Java Version

This project uses Java 17. Ensure you have JDK 17 installed and the JAVA_HOME environment variable is set.

## Node.js Requirements

This project uses Node.js 18+ with npm. Ensure you have Node.js installed.

## MySQL Setup

1. Install MySQL Server 8.0 or higher
2. Start MySQL service
3. Create a database: CREATE DATABASE smart_library;
4. Update the database credentials in backend/src/main/resources/application.properties

## How to Start Backend

1. Navigate to the backend directory: cd SmartLibraryAssistant/backend
2. Build and run with Maven: mvn spring-boot:run
3. Or build a JAR first: mvn clean package && java -jar target/SmartLibrary-1.0.0.jar

The backend will start on http://localhost:8080

## How to Start Frontend

1. Navigate to the frontend directory: cd SmartLibraryAssistant/frontend
2. Install dependencies: npm install
3. Start the development server: npm start

The frontend will be available at http://localhost:3000

## Phase 1 Checklist

- [ ] Project directory structure created
- [ ] Spring Boot Maven project configured with Web, JPA, MySQL, Validation
- [ ] Database schema.sql and seed.sql created
- [ ] JPA entities created with proper relationships
- [ ] Frontend React app set up with React Router, Bootstrap, Axios
- [ ] Basic layout with Navbar, Home, Login, Register pages
- [ ] Application.properties configured with MySQL connection
- [ ] README documentation created
- [ ] Backend compiles successfully
- [ ] Frontend compiles successfully

## Common Issues

1. Port conflicts: Change server.port in application.properties if 8080 is occupied
2. MySQL connection errors: Verify MySQL is running and credentials are correct
3. Lombok not working: Ensure your IDE has Lombok plugin installed
4. Node modules missing: Run npm install in the frontend directory
