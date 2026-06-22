package email

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"log"
	"net"
	"net/mail"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/resend/resend-go/v3"
	"shiv-shakti/internal/models"
)

type MailService struct {
	Host       string
	Port       int
	Username   string
	Password   string
	From       string
	MockMode   bool
	Timeout    time.Duration
	PreferSMTP bool
	Resend     *resend.Client
	ResendFrom string
}

const defaultVerifiedResendFrom = "Shiv Shakti Project <support@shivshaktiproject.com>"

func NewMailService() *MailService {
	resendAPIKey := firstEnv("RESEND_API_KEY")
	resendFrom := firstEnv("RESEND_FROM")
	host := firstEnv("SMTP_HOST")
	portStr := firstEnv("SMTP_PORT")
	username := firstEnv("SMTP_USERNAME", "SMTP_USER")
	password := firstEnv("SMTP_PASSWORD", "SMTP_PASS")
	from := firstEnv("SMTP_FROM")
	preferSMTP := strings.EqualFold(firstEnv("PREFER_SMTP"), "true")

	mockMode := false
	hasResend := resendAPIKey != ""
	hasSMTP := host != "" && username != "" && password != "" && from != ""
	if !hasResend && !hasSMTP {
		if strings.EqualFold(os.Getenv("REQUIRE_SMTP"), "true") || strings.EqualFold(os.Getenv("APP_ENV"), "production") {
			log.Fatal("✗ RESEND_API_KEY or SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM are required when email delivery is mandatory")
		}
		log.Println("⚠ SMTP settings are incomplete. Email service running in MOCK mode (logging to stdout).")
		mockMode = true
	}

	port := 587
	if portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}
	if preferSMTP && strings.EqualFold(strings.TrimSpace(host), "smtp.gmail.com") && port == 587 {
		port = 465
	}
	timeout := 15 * time.Second
	if timeoutStr := firstEnv("SMTP_TIMEOUT_SECONDS"); timeoutStr != "" {
		if seconds, err := strconv.Atoi(timeoutStr); err == nil && seconds > 0 {
			timeout = time.Duration(seconds) * time.Second
		}
	}

	if from == "" {
		from = username
	}
	if from == "" {
		from = resendFrom
	}
	if resendFrom == "" && resendAPIKey != "" {
		resendFrom = defaultVerifiedResendFrom
	}
	if from == "" {
		from = "no-reply@shiv-shakti.local"
	}
	var resendClient *resend.Client
	if resendAPIKey != "" {
		resendClient = resend.NewClient(resendAPIKey)
	}
	return &MailService{
		Host:       host,
		Port:       port,
		Username:   username,
		Password:   password,
		From:       from,
		MockMode:   mockMode,
		Timeout:    timeout,
		PreferSMTP: preferSMTP,
		Resend:     resendClient,
		ResendFrom: resendFrom,
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
	if err := m.sendRaw([]string{userEmail}, []byte(msg.String())); err != nil {
		return fmt.Errorf("failed to send welcome email: %w", err)
	}
	log.Printf("✓ Welcome email sent to %s", userEmail)
	return nil
}

// SendVerification sends an email with a verification link to the user.
func (m *MailService) SendVerification(userEmail string, name string, token string) error {
	frontendURL := strings.TrimRight(firstEnv("FRONTEND_URL", "BASE_URL"), "/")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	verificationURL := fmt.Sprintf("%s/verify?token=%s", frontendURL, token)
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
	if err := m.sendRaw([]string{userEmail}, []byte(msg.String())); err != nil {
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
	supportEmail := m.supportRecipient("ORDER_TO_EMAIL")

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
		log.Printf("To Support: %s", supportEmail)
		log.Printf("From: %s", m.From)
		log.Printf("Subject: Wholesale Enquiry #%d Received - SHIV SHAKTI", order.ID)
		log.Printf("Content Length: %d bytes", body.Len())
		log.Printf("--- Plaintext summary of enquiry items ---")
		for _, item := range order.Items {
			log.Printf(" - %s (Size: %s, Color: %s) x%d @ ₹%.2f", item.Name, item.Size, item.Color, item.Quantity, item.Price)
		}
		log.Printf("Shipping To: %s, %s, %s, %s, %s", order.ShippingName, order.ShippingAddress, order.ShippingCity, order.ShippingState, order.ShippingZip)
		log.Printf("================= MOCK EMAIL END =================")
		return nil
	}

	subject := fmt.Sprintf("Wholesale Enquiry #%d Received - SHIV SHAKTI", order.ID)
	if err := m.sendHTML(
		[]string{supportEmail},
		map[string]string{
			"From":         m.From,
			"To":           supportEmail,
			"Reply-To":     userEmail,
			"Subject":      fmt.Sprintf("New Wholesale Enquiry #%d - SHIV SHAKTI", order.ID),
			"MIME-Version": "1.0",
			"Content-Type": "text/html; charset=UTF-8",
		},
		body.Bytes(),
	); err != nil {
		return fmt.Errorf("failed to send support enquiry notification: %w", err)
	}

	if err := m.sendHTML(
		[]string{userEmail},
		map[string]string{
			"From":         m.From,
			"To":           userEmail,
			"Subject":      subject,
			"MIME-Version": "1.0",
			"Content-Type": "text/html; charset=UTF-8",
		},
		body.Bytes(),
	); err != nil {
		log.Printf("Customer enquiry acknowledgement failed for Order #%d (%s): %v", order.ID, userEmail, err)
	} else {
		log.Printf("✓ Customer enquiry acknowledgement sent to %s for Enquiry #%d", userEmail, order.ID)
	}

	log.Printf("✓ Wholesale enquiry notification sent to %s for Enquiry #%d", supportEmail, order.ID)
	return nil
}

func (m *MailService) SendCartItemNotification(userEmail string, productName string, quantity int, size string, color string, unitPrice float64) error {
	supportEmail := m.supportRecipient("CART_TO_EMAIL")
	total := unitPrice * float64(quantity)
	body := []byte(fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Cart Activity</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;padding:20px;">
<div style="max-width:640px;margin:auto;background:#fff;padding:28px;border:1px solid #e5e5e5;">
<h2 style="margin-top:0;color:#111;">Product Added To Cart</h2>
<p style="color:#555;">A customer added a wholesale product to their cart.</p>
<table style="width:100%%;border-collapse:collapse;color:#222;">
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Customer</strong></td><td style="padding:8px;border-top:1px solid #eee;">%s</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Product</strong></td><td style="padding:8px;border-top:1px solid #eee;">%s</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Size</strong></td><td style="padding:8px;border-top:1px solid #eee;">%s</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Color</strong></td><td style="padding:8px;border-top:1px solid #eee;">%s</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Quantity</strong></td><td style="padding:8px;border-top:1px solid #eee;">%d</td></tr>
<tr><td style="padding:8px;border-top:1px solid #eee;"><strong>Estimated Value</strong></td><td style="padding:8px;border-top:1px solid #eee;">₹%.2f</td></tr>
</table>
<p style="color:#777;font-size:12px;">This is an early cart notification. Full delivery details are sent after the customer submits the wholesale enquiry.</p>
</div>
</body>
</html>`,
		template.HTMLEscapeString(userEmail),
		template.HTMLEscapeString(productName),
		template.HTMLEscapeString(size),
		template.HTMLEscapeString(color),
		quantity,
		total,
	))

	if m.MockMode {
		log.Printf("================ MOCK CART EMAIL START ================")
		log.Printf("To Support: %s", supportEmail)
		log.Printf("Customer: %s", userEmail)
		log.Printf("Product: %s", productName)
		log.Printf("Quantity: %d", quantity)
		log.Printf("================= MOCK CART EMAIL END =================")
		return nil
	}

	if err := m.sendHTML(
		[]string{supportEmail},
		map[string]string{
			"From":         m.From,
			"To":           supportEmail,
			"Reply-To":     userEmail,
			"Subject":      "Product Added To Cart - SHIV SHAKTI",
			"MIME-Version": "1.0",
			"Content-Type": "text/html; charset=UTF-8",
		},
		body,
	); err != nil {
		return fmt.Errorf("failed to send cart notification: %w", err)
	}

	log.Printf("✓ Cart notification sent to %s for %s", supportEmail, productName)
	return nil
}

func (m *MailService) SendFabricQuoteRequest(input *models.FabricQuoteInput) error {
	supportEmail := m.supportRecipient("QUOTE_TO_EMAIL")

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

	go func() {
		if err := m.sendHTML(
			[]string{input.Email},
			map[string]string{
				"From":         m.From,
				"To":           input.Email,
				"Reply-To":     supportEmail,
				"Subject":      "Fabric Quote Request Received - SHIV SHAKTI",
				"MIME-Version": "1.0",
				"Content-Type": "text/html; charset=UTF-8",
			},
			customerBody,
		); err != nil {
			log.Printf("Fabric quote acknowledgement failed for %s: %v", input.Email, err)
		} else {
			log.Printf("✓ Fabric quote acknowledgement sent to %s", input.Email)
		}
	}()

	log.Printf("✓ Fabric quote request emailed to %s", supportEmail)
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

	return m.sendRaw(to, []byte(msg.String()))
}

func (m *MailService) sendRaw(to []string, msg []byte) error {
	if m.PreferSMTP && m.hasSMTPConfig() {
		if err := m.sendRawSMTP(to, msg); err == nil {
			return nil
		} else if m.Resend == nil {
			return err
		} else {
			log.Printf("SMTP email delivery failed; falling back to Resend: %v", err)
		}
	}
	if m.Resend != nil {
		if err := m.sendResend(to, msg); err == nil {
			return nil
		} else if !m.hasSMTPConfig() {
			return err
		} else {
			log.Printf("Resend email delivery failed; falling back to SMTP: %v", err)
		}
	}
	return m.sendRawSMTP(to, msg)
}

func (m *MailService) hasSMTPConfig() bool {
	return strings.TrimSpace(m.Host) != "" &&
		strings.TrimSpace(m.Username) != "" &&
		strings.TrimSpace(m.Password) != "" &&
		strings.TrimSpace(m.From) != ""
}

func (m *MailService) sendRawSMTP(to []string, msg []byte) error {
	if !m.hasSMTPConfig() {
		return fmt.Errorf("smtp delivery is not configured")
	}
	addr := fmt.Sprintf("%s:%d", m.Host, m.Port)
	recipients := make([]string, 0, len(to))
	for _, recipient := range to {
		recipients = append(recipients, recipientAddress(recipient))
	}
	if err := m.sendSMTP(addr, m.Port, recipients, msg); err != nil {
		if m.Port == 587 && strings.Contains(err.Error(), "smtp dial failed") {
			fallbackAddr := fmt.Sprintf("%s:%d", m.Host, 465)
			if fallbackErr := m.sendSMTP(fallbackAddr, 465, recipients, msg); fallbackErr == nil {
				return nil
			}
		}
		return err
	}
	return nil
}

func (m *MailService) sendResend(to []string, msg []byte) error {
	headers, body := splitRawMessage(msg)
	subject := headers["subject"]
	if subject == "" {
		subject = "Shiv Shakti Project"
	}
	from := m.ResendFrom
	if from == "" {
		from = m.From
	}
	recipients := make([]string, 0, len(to))
	for _, recipient := range to {
		recipients = append(recipients, recipientAddress(recipient))
	}
	params := &resend.SendEmailRequest{
		From:    from,
		To:      recipients,
		Subject: cleanHeaderValue(subject),
		Html:    string(body),
	}
	if replyTo := headers["reply-to"]; replyTo != "" {
		params.ReplyTo = recipientAddress(replyTo)
	}
	if _, err := m.Resend.Emails.Send(params); err != nil {
		return fmt.Errorf("resend send failed: %w", err)
	}
	return nil
}

func (m *MailService) sendSMTP(addr string, port int, recipients []string, msg []byte) error {
	dialer := net.Dialer{Timeout: m.Timeout}
	var (
		conn net.Conn
		err  error
	)
	if port == 465 {
		conn, err = tls.DialWithDialer(&dialer, "tcp", addr, &tls.Config{ServerName: m.Host, MinVersion: tls.VersionTLS12})
	} else {
		conn, err = dialer.Dial("tcp", addr)
	}
	if err != nil {
		return fmt.Errorf("smtp dial failed: %w", err)
	}
	defer conn.Close()
	if err := conn.SetDeadline(time.Now().Add(m.Timeout)); err != nil {
		return fmt.Errorf("smtp deadline failed: %w", err)
	}

	client, err := smtp.NewClient(conn, m.Host)
	if err != nil {
		return fmt.Errorf("smtp client failed: %w", err)
	}
	defer client.Close()

	if port != 465 {
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(&tls.Config{ServerName: m.Host, MinVersion: tls.VersionTLS12}); err != nil {
				return fmt.Errorf("smtp starttls failed: %w", err)
			}
		}
	}

	if ok, _ := client.Extension("AUTH"); ok {
		auth := smtp.PlainAuth("", m.Username, m.Password, m.Host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth failed: %w", err)
		}
	}
	if err := client.Mail(m.envelopeFrom()); err != nil {
		return fmt.Errorf("smtp mail from failed: %w", err)
	}
	for _, recipient := range recipients {
		if err := client.Rcpt(recipient); err != nil {
			return fmt.Errorf("smtp recipient failed for %s: %w", recipient, err)
		}
	}
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data failed: %w", err)
	}
	if _, err := writer.Write(msg); err != nil {
		writer.Close()
		return fmt.Errorf("smtp write failed: %w", err)
	}
	if err := writer.Close(); err != nil {
		return fmt.Errorf("smtp close data failed: %w", err)
	}
	return client.Quit()
}

func (m *MailService) envelopeFrom() string {
	if address, err := mail.ParseAddress(m.From); err == nil {
		return address.Address
	}
	return m.From
}

func cleanHeaderValue(value string) string {
	value = strings.ReplaceAll(value, "\r", " ")
	value = strings.ReplaceAll(value, "\n", " ")
	return strings.TrimSpace(value)
}

func splitRawMessage(msg []byte) (map[string]string, []byte) {
	raw := string(msg)
	separator := "\r\n\r\n"
	index := strings.Index(raw, separator)
	if index == -1 {
		separator = "\n\n"
		index = strings.Index(raw, separator)
	}
	if index == -1 {
		return map[string]string{}, msg
	}
	headers := map[string]string{}
	for _, line := range strings.Split(raw[:index], "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		key, value, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		headers[strings.ToLower(strings.TrimSpace(key))] = strings.TrimSpace(value)
	}
	return headers, []byte(raw[index+len(separator):])
}

func (m *MailService) supportRecipient(primaryEnv string) string {
	candidates := []string{
		firstEnv(primaryEnv),
		firstEnv("SUPPORT_EMAIL"),
		firstEnv("ADMIN_EMAIL"),
		firstEnv("SMTP_USERNAME", "SMTP_USER"),
		firstEnv("SMTP_FROM"),
		firstEnv("RESEND_FROM"),
		m.From,
	}
	for _, candidate := range candidates {
		candidate = strings.TrimSpace(candidate)
		if candidate != "" {
			return recipientAddress(candidate)
		}
	}
	return "no-reply@shiv-shakti.local"
}

func recipientAddress(value string) string {
	if address, err := mail.ParseAddress(value); err == nil {
		return address.Address
	}
	return strings.TrimSpace(value)
}

func firstEnv(names ...string) string {
	for _, name := range names {
		value := strings.TrimSpace(os.Getenv(name))
		if value != "" {
			return value
		}
	}
	return ""
}
