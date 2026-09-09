FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/mvnw .
COPY backend/.mvn .mvn
RUN chmod +x mvnw
COPY backend/src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
