# Smart Library Assistant

A full-stack library management system built with Spring Boot + React.

## Prerequisites

1. **Java 17+** - [Download](https://adoptium.net/)
2. **MySQL 8+** - [Download](https://dev.mysql.com/downloads/)
3. **Maven 3.8+** - [Download](https://maven.apache.org/)

## Quick Setup (One-Time)

### 1. Install MySQL

Make sure MySQL is running on port 3306.

### 2. Create the Database

```sql
CREATE DATABASE smart_library;
```

Or just run the app - it creates the database automatically.

### 3. Configure Database (if needed)

Edit `backend/src/main/resources/application.properties` or set environment variables:

```bash
export DB_URL=jdbc:mysql://localhost:3306/smart_library?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
export DB_USERNAME=root
export DB_PASSWORD=your_password
```

## Run the App

### Windows:
```
double-click start.bat
```

### Mac/Linux:
```bash
chmod +x start.sh
./start.sh
```

### Or manually:
```bash
cd backend
mvn spring-boot:run
```

## Access

Open your browser and go to: **http://localhost:8080**

Other computers on the same network can access it via: **http://YOUR-IP:8080**

(Use `ipconfig` on Windows or `hostname -I` on Mac/Linux to find your IP)

## Login Credentials

| Role      | Email                        | Password     |
|-----------|------------------------------|--------------|
| Librarian | librarian@smartlibrary.com   | librarian123 |
| Student   | student@smartlibrary.com     | student123   |

## Features

- **Browse Books** - Search and filter books by title, author, genre
- **Borrow Books** - Scan barcode or use librarian dashboard
- **Reservations** - Reserve books when unavailable
- **Notifications** - Get alerts for due dates, reservation status
- **Librarian Dashboard** - Manage books, copies, students, returns
- **Reports** - Genre distribution, popular books analytics

## Network Deployment

To make the app accessible from other computers on your network:

1. Find your IP address
2. Make sure port 8080 is not blocked by firewall
3. Share the URL: `http://YOUR-IP:8080`
4. Others can access it using the login credentials above

No internet connection required - works entirely on local network.
