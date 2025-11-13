# Estágio de construção
FROM eclipse-temurin:21-jdk as builder
WORKDIR /app
COPY . .
RUN chmod +x mvnw # Garante permissão de execução para o wrapper Maven
RUN ./mvnw clean package -DskipTests # Constrói o JAR, pulando testes

# Estágio final (imagem de execução)
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080

# ***** ADICIONE/AJUSTE ESTAS DUAS LINHAS *****
# Define as opções de memória para a JVM.
# -Xmx: Define o tamanho máximo da heap (memória principal para objetos).
# -Xms: Define o tamanho inicial da heap.
# -XX:MaxMetaspaceSize: Limita a memória para metadados de classes.
# Estes valores são exemplos. Comece com eles e ajuste para cima se a aplicação falhar
# ou para baixo se ainda estiver consumindo muito.
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:MaxMetaspaceSize=128m"

# Garante que a JVM seja iniciada com as opções de memória definidas.
ENTRYPOINT ["java", ${JAVA_OPTS}, "-jar", "app.jar"]