FROM golang:alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=1 GOOS=linux go build -a -o shiv-shakti-engine ./cmd/server

FROM alpine:3.18

WORKDIR /app

COPY --from=builder /app/shiv-shakti-engine .
RUN apk add --no-cache ca-certificates && mkdir -p /app/data /app/assets/uploads

EXPOSE 8080

CMD ["./shiv-shakti-engine"]
