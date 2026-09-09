FROM eclipse-temurin:17-jdk
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/ .
RUN mvn clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/smart-library-backend-1.0.0.jar"]
