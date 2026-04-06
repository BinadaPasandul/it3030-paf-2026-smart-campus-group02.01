# Smart Campus Operations Hub

The Smart Campus Operations Hub is a full-stack system designed to streamline campus management, including resource allocation, booking services, ticket management, and user notifications.

## Project Structure

```text
root/
├── backend/            # Spring Boot (Java) - Clean Architecture
├── frontend/           # React (Vite) - Modern UI
├── .github/workflows/  # CI/CD Workflows
└── README.md
```

---

## 📋 Prerequisites - What You Need to Install

Before you start working on this project, make sure you have these tools installed:

### For Backend Development
- **Java 17** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://jdk.java.net/17/)
- **Maven 3.8.1+** - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
  - Or use Maven wrapper (included in project) - just run `./mvnw` (Mac/Linux) or `mvnw.cmd` (Windows)
- **PostgreSQL 12+** - Download from [postgresql.org](https://www.postgresql.org/download/)
  - This is the **main database** for this project

### For Frontend Development
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

---

## 🔧 Tech Stack & Versions

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming language |
| Spring Boot | 3.2.4 | Web framework |
| Maven | 3.8.1+ | Build tool |
| Spring Data JPA | Included | Database ORM |
| Spring Security | Included | Authentication/Authorization |
| OAuth 2.0 | Included | Secure login |
| H2 Database | Included | Testing database |
| Lombok | Included | Code simplification |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI framework |
| Vite | 8.0.1 | Build tool & dev server |
| Node.js | 18+ | Runtime environment |
| npm | 9+ | Package manager |

---

## 🗄️ Database Setup - PostgreSQL

This project uses **PostgreSQL** as the main database. H2 (mentioned in dependencies) is only for unit testing, not development.

### Install PostgreSQL
1. Download from [postgresql.org](https://www.postgresql.org/download/)
2. Install and remember your password
3. After installation, create a database:

```bash
# Open PostgreSQL terminal (psql)
# On Windows: psql -U postgres
# On Mac/Linux: psql -U postgres

# Create database
CREATE DATABASE smart_campus;

# Create user (optional - for better security)
CREATE USER campus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_campus TO campus_user;
```

### Configure Backend to Use PostgreSQL

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/smart_campus
    username: postgres          # or your created user
    password: your_password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```

> **Note**: You'll also need to add PostgreSQL driver to `pom.xml` (if not already added):
> ```xml
> <dependency>
>   <groupId>org.postgresql</groupId>
>   <artifactId>postgresql</artifactId>
>   <scope>runtime</scope>
> </dependency>
> ```

---

## ⚡ Getting Started

### 1️⃣ Backend Setup

```bash
# Navigate to backend folder
cd backend

# Option A: Using Maven wrapper (no Maven installation needed)
./mvnw clean install

# Option B: If you have Maven installed globally
mvn clean install

# Run the application
./mvnw spring-boot:run
# or
mvn spring-boot:run

# The backend will start on http://localhost:8080
```

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The frontend will start on http://localhost:5173
```

---

## 📦 Dependencies Installed by Default

**Backend dependencies** are automatically installed when you run `mvn clean install`:
- Spring Boot Starters (Web, Data JPA, Security, Validation)
- Lombok (for cleaner code)
- **H2 Database** (only for automated unit testing - NOT for development)
- PostgreSQL Driver (for connecting to PostgreSQL database)

**Frontend dependencies** are installed when you run `npm install`:
- React & React DOM
- Vite & build tools
- ESLint (code quality checking)

---

## 🎯 Technologies Used

- **Backend**: Spring Boot 3.2.4, Java 17, Maven, Spring Security (OAuth 2.0)
- **Frontend**: React 19.2.4, Vite 8.0.1
- **Database**: PostgreSQL (main database), H2 (testing only)

---

## ❓ Need Help?

- Check the backend `pom.xml` for exact dependencies
- Check the frontend `package.json` for exact package versions
- Make sure your Java version matches: `java -version`
- Make sure your Node version matches: `node -v`