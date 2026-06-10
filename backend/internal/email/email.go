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
		if strings.EqualFold(os.Getenv("REQUIRE_SMTP"), "true") || strings.EqualFold(os.Getenv("APP_ENV"), "production") {
			log.Fatal("✗ SMTP_HOST and SMTP_USERNAME are required when email delivery is mandatory")
		}
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
		from = username
	}
	if from == "" {
		from = "no-reply@shiv-shakti.local"
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

const VerifyEmailHTMLTemplate = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Verify Your Email</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<h2 style="color:#222;">Hello, {{.Name}}!</h2>
<p style="color:#555;">Thank you for registering. Please verify your email by clicking the link below:</p>
<p><a href="{{.URL}}" style="color:#0a84ff;">Verify Email</a></p>
<p style="color:#555;">If you did not request this, you can ignore this email.</p>
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
		"From":         m.From,
		"To":           userEmail,
		"Subject":      "Welcome to Shiv Shakti",
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

// SendVerification sends an email with a verification link to the user.
func (m *MailService) SendVerification(userEmail string, name string, token string) error {
	verificationURL := fmt.Sprintf("%s/verify?token=%s", os.Getenv("FRONTEND_URL"), token)
	tmpl, err := template.New("verify").Parse(VerifyEmailHTMLTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse verification template: %w", err)
	}
	var body bytes.Buffer
	data := struct {
		Name string
		URL  string
	}{Name: name, URL: verificationURL}
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute verification template: %w", err)
	}
	if m.MockMode {
		log.Printf("================ MOCK EMAIL START ================")
		log.Printf("To: %s", userEmail)
		log.Printf("From: %s", m.From)
		log.Printf("Subject: Verify Your Email")
		log.Printf("Content Length: %d bytes", body.Len())
		log.Printf("Verification URL: %s", verificationURL)
		log.Printf("================= MOCK EMAIL END =================")
		return nil
	}
	headers := map[string]string{
		"From":         m.From,
		"To":           userEmail,
		"Subject":      "Verify Your Email",
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
		return fmt.Errorf("failed to send verification email: %w", err)
	}
	log.Printf("✓ Verification email sent to %s", userEmail)
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
		log.Printf("Subject: Wholesale Enquiry #%d Received - SHIV SHAKTI", order.ID)
		log.Printf("Content Length: %d bytes", body.Len())
		log.Printf("--- Plaintext summary of enquiry items ---")
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
	headers["Subject"] = fmt.Sprintf("Wholesale Enquiry #%d Received - SHIV SHAKTI", order.ID)
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

	log.Printf("✓ Wholesale enquiry email sent to %s for Enquiry #%d", userEmail, order.ID)
	return nil
}

func (m *MailService) SendFabricQuoteRequest(input *models.FabricQuoteInput) error {
	supportEmail := strings.TrimSpace(os.Getenv("QUOTE_TO_EMAIL"))
	if supportEmail == "" {
		supportEmail = strings.TrimSpace(os.Getenv("SUPPORT_EMAIL"))
	}
	if supportEmail == "" {
		supportEmail = strings.TrimSpace(os.Getenv("SMTP_FROM"))
	}
	if supportEmail == "" {
		supportEmail = strings.TrimSpace(os.Getenv("SMTP_USERNAME"))
	}
	if supportEmail == "" {
		supportEmail = m.From
	}

	type TemplateData struct {
		Input *models.FabricQuoteInput
	}

	adminTemplate := `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Fabric Quote Request</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;padding:20px;">
<div style="max-width:680px;margin:auto;background:#fff;padding:28px;border:1px solid #e5e5e5;">
<h2 style="margin-top:0;color:#111;">New Fabric Quote Request</h2>
<p style="color:#555;">A buyer submitted a wholesale fabric enquiry from the website. Payment and delivery details should be shared by email after review.</p>
<table style="width:100%;border-collapse:collapse;color:#222;">
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Name</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.Name}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Email</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.Email}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Phone</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.Phone}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Fabric Type</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.FabricType}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Quantity</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.Quantity}} units/meters</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Preferred Color</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.PreferredColor}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Delivery City</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.DeliveryCity}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Timeline</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.Timeline}}</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Message</strong></td><td style="padding:8px;border-top:1px solid #eee;">{{.Input.Message}}</td></tr>
</table>
</div>
</body>
</html>`

	customerTemplate := `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Fabric Quote Request Received</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;padding:20px;">
<div style="max-width:620px;margin:auto;background:#fff;padding:28px;border:1px solid #e5e5e5;">
<h2 style="margin-top:0;color:#111;">We Received Your Fabric Enquiry</h2>
<p style="color:#555;">Hello {{.Input.Name}},</p>
<p style="color:#555;">Thank you for your wholesale fabric request. Our team will review the quantity, fabric type, color, and delivery city, then reply by email with the quote, payment instructions, and delivery details.</p>
<p style="color:#555;">No payment is collected on the website.</p>
<hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
<p style="font-size:12px;color:#999;">SHIV SHAKTI PROJECT</p>
</div>
</body>
</html>`

	adminBody, err := renderEmailTemplate("fabricQuoteAdmin", adminTemplate, TemplateData{Input: input})
	if err != nil {
		return err
	}
	customerBody, err := renderEmailTemplate("fabricQuoteCustomer", customerTemplate, TemplateData{Input: input})
	if err != nil {
		return err
	}

	if m.MockMode {
		log.Printf("================ MOCK FABRIC QUOTE EMAIL START ================")
		log.Printf("To Support: %s", supportEmail)
		log.Printf("Customer: %s <%s>", input.Name, input.Email)
		log.Printf("Phone: %s", input.Phone)
		log.Printf("Fabric: %s", input.FabricType)
		log.Printf("Quantity: %d", input.Quantity)
		log.Printf("Color: %s", input.PreferredColor)
		log.Printf("Delivery City: %s", input.DeliveryCity)
		log.Printf("Timeline: %s", input.Timeline)
		log.Printf("Message: %s", input.Message)
		log.Printf("Support Email Content Length: %d bytes", len(adminBody))
		log.Printf("Customer Email Content Length: %d bytes", len(customerBody))
		log.Printf("================= MOCK FABRIC QUOTE EMAIL END =================")
		return nil
	}

	if err := m.sendHTML(
		[]string{supportEmail},
		map[string]string{
			"From":         m.From,
			"To":           supportEmail,
			"Reply-To":     input.Email,
			"Subject":      "New Fabric Quote Request - SHIV SHAKTI",
			"MIME-Version": "1.0",
			"Content-Type": "text/html; charset=UTF-8",
		},
		adminBody,
	); err != nil {
		return fmt.Errorf("failed to send fabric quote notification: %w", err)
	}

	if err := m.sendHTML(
		[]string{input.Email},
		map[string]string{
			"From":         m.From,
			"To":           input.Email,
			"Subject":      "Fabric Quote Request Received - SHIV SHAKTI",
			"MIME-Version": "1.0",
			"Content-Type": "text/html; charset=UTF-8",
		},
		customerBody,
	); err != nil {
		return fmt.Errorf("failed to send fabric quote acknowledgement: %w", err)
	}

	log.Printf("✓ Fabric quote request emailed to %s and acknowledged to %s", supportEmail, input.Email)
	return nil
}

func renderEmailTemplate(name string, html string, data any) ([]byte, error) {
	tmpl, err := template.New(name).Parse(html)
	if err != nil {
		return nil, fmt.Errorf("failed to parse %s template: %w", name, err)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return nil, fmt.Errorf("failed to execute %s template: %w", name, err)
	}
	return body.Bytes(), nil
}

func (m *MailService) sendHTML(to []string, headers map[string]string, body []byte) error {
	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, cleanHeaderValue(v)))
	}
	msg.WriteString("\r\n")
	msg.Write(body)

	addr := fmt.Sprintf("%s:%d", m.Host, m.Port)
	auth := smtp.PlainAuth("", m.Username, m.Password, m.Host)
	return smtp.SendMail(addr, auth, m.From, to, []byte(msg.String()))
}

func cleanHeaderValue(value string) string {
	value = strings.ReplaceAll(value, "\r", " ")
	value = strings.ReplaceAll(value, "\n", " ")
	return strings.TrimSpace(value)
}
