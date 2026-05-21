
FROM golang:alpine AS builder


RUN apk add --no-cache gcc musl-dev

WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download


COPY . .


RUN CGO_ENABLED=1 GOOS=linux go build -a -o shiv-shakti-engine ./cmd/server


FROM alpine:3.18

WORKDIR /app


COPY --from=builder /app/shiv-shakti-engine .


RUN mkdir -p /app/data


EXPOSE 8080


CMD ["./shiv-shakti-engine"]
