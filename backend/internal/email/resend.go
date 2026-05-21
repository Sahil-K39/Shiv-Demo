package email

import (
    "log"
    "github.com/resend/resend-go/v3"
)

// SendResendEmail sends an email using the Resend API.
// Replace the placeholder API key (re_xxxxxxxxx) with your actual Resend API key.
// Optionally, you can move the API key to an environment variable for better security.
func SendResendEmail(to []string, subject string, htmlBody string) (string, error) {
    apiKey := "re_RY56hJE8_14JWjBfo1cZq25MHx4BSF4MT"

    client := resend.NewClient(apiKey)

    params := &resend.SendEmailRequest{
        From:    "onboarding@resend.dev",
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
