FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o shtab-backend main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/shtab-backend .
COPY --from=builder /app/schema.sql .

EXPOSE 8080
CMD ["./shtab-backend"]
