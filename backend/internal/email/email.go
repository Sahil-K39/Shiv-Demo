package email

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
	"strconv"
	"strings"

	"shiv-shakti/internal/models"
)

type MailService struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
	MockMode bool
}

func NewMailService() *MailService {
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	mockMode := false
	if host == "" || username == "" {
		log.Println("⚠ SMTP_HOST or SMTP_USERNAME not configured. Email service running in MOCK mode (logging to stdout).")
		mockMode = true
	}

	port := 587
	if portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}

	if from == "" {
		// Default fallback – user requested "testforme39487@gmail.com"
		from = "testforme39487@gmail.com"
	}

	return &MailService{
		Host:     host,
		Port:     port,
		Username: username,
		Password: password,
		From:     from,
		MockMode: mockMode,
	}
}

const WelcomeEmailHTMLTemplate = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome to Shiv Shakti</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f9f9f9;padding:20px;">
  <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <h2 style="color:#222;">Welcome, {{.Name}}!</h2>
    <p style="color:#555;">Thank you for joining Shiv Shakti. We're excited to have you on board.</p>
    <p style="color:#555;">Feel free to explore our collection and stay tuned for upcoming sales and exclusive offers.</p>
    <p style="color:#555;">If you have any questions, reply to this email.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
    <p style="font-size:12px;color:#999;">© 2026 Shiv Shakti Project</p>
  </div>
</body>
</html>
`

func (m *MailService) SendWelcome(userEmail string, name string) error {
    tmpl, err := template.New("welcome").Parse(WelcomeEmailHTMLTemplate)
    if err != nil {
        return fmt.Errorf("failed to parse welcome template: %w", err)
    }
    var body bytes.Buffer
    data := struct{ Name string }{Name: name}
    if err := tmpl.Execute(&body, data); err != nil {
        return fmt.Errorf("failed to execute welcome template: %w", err)
    }
    if m.MockMode {
        log.Printf("================ MOCK EMAIL START ================")
        log.Printf("To: %s", userEmail)
        log.Printf("From: %s", m.From)
        log.Printf("Subject: Welcome to Shiv Shakti")
        log.Printf("Content Length: %d bytes", body.Len())
        log.Printf("================= MOCK EMAIL END =================")
        return nil
    }
    headers := map[string]string{
        "From":    m.From,
        "To":      userEmail,
        "Subject": "Welcome to Shiv Shakti",
        "MIME-Version": "1.0",
        "Content-Type": "text/html; charset=UTF-8",
    }
    var msg strings.Builder
    for k, v := range headers {
        msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
    }
    msg.WriteString("\r\n")
    msg.Write(body.Bytes())
    addr := fmt.Sprintf("%s:%d", m.Host, m.Port)
    auth := smtp.PlainAuth("", m.Username, m.Password, m.Host)
    if err := smtp.SendMail(addr, auth, m.From, []string{userEmail}, []byte(msg.String())); err != nil {
        return fmt.Errorf("failed to send welcome email: %w", err)
    }
    log.Printf("✓ Welcome email sent to %s", userEmail)
    return nil
}

func (m *MailService) SendOrderConfirmation(userEmail string, order *models.Order) error {
	tmpl, err := template.New("orderConfirmation").Parse(OrderConfirmationHTMLTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %w", err)
	}

	type TemplateData struct {
		Order *models.Order
		Email string
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, TemplateData{Order: order, Email: userEmail}); err != nil {
		return fmt.Errorf("failed to execute template: %w", err)
	}

	if m.MockMode {
		log.Printf("================ MOCK EMAIL START ================")
		log.Printf("To: %s", userEmail)
		log.Printf("From: %s", m.From)
		log.Printf("Subject: Order Confirmation #%d — SHIV SHAKTI", order.ID)
		log.Printf("Content Length: %d bytes", body.Len())
		log.Printf("--- Plaintext summary of email items ---")
		for _, item := range order.Items {
			log.Printf(" - %s (Size: %s, Color: %s) x%d @ $%.2f", item.Name, item.Size, item.Color, item.Quantity, item.Price)
		}
		log.Printf("Shipping To: %s, %s, %s, %s, %s", order.ShippingName, order.ShippingAddress, order.ShippingCity, order.ShippingState, order.ShippingZip)
		log.Printf("================= MOCK EMAIL END =================")
		return nil
	}

	// Prepare email headers
	headers := make(map[string]string)
	headers["From"] = m.From
	headers["To"] = userEmail
	headers["Subject"] = fmt.Sprintf("Order Confirmation #%d — SHIV SHAKTI", order.ID)
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.Write(body.Bytes())

	addr := fmt.Sprintf("%s:%d", m.Host, m.Port)
	auth := smtp.PlainAuth("", m.Username, m.Password, m.Host)

	// Send email using standard SMTP client
	err = smtp.SendMail(addr, auth, m.From, []string{userEmail}, []byte(msg.String()))
	if err != nil {
		return fmt.Errorf("failed to send smtp email: %w", err)
	}

	log.Printf("✓ Order confirmation email sent to %s for Order #%d", userEmail, order.ID)
	return nil
}
