package email

import (
	"log"
	"os"

	"github.com/resend/resend-go/v3"
)

// SendResendEmail sends an email using the Resend API configured by RESEND_API_KEY.
func SendResendEmail(to []string, subject string, htmlBody string) (string, error) {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := firstEnv("RESEND_FROM")
	if from == "" {
		from = "onboarding@resend.dev"
	}

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      to,
		Subject: subject,
		Html:    htmlBody,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Printf("failed to send email via Resend: %v", err)
		return "", err
	}

	log.Printf("Resend email sent: %s", sent.Id)
	return sent.Id, nil
}
