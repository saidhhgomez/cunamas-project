# --- Etapa 1: Compilación ---
# Cambiado a Java 21 para soportar la compilación del proyecto
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar configuración de dependencias y descargarlas
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar el archivo .jar
COPY src ./src
RUN mvn clean package -DskipTests

# --- Etapa 2: Ejecución ---
# Cambiado a JRE 21 para poder ejecutar el .jar compilado
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]