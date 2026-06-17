package email

import "testing"

func TestSupportRecipientUsesAdminEmailFallback(t *testing.T) {
	t.Setenv("ORDER_TO_EMAIL", "")
	t.Setenv("SUPPORT_EMAIL", "")
	t.Setenv("ADMIN_EMAIL", "admin@example.com")
	t.Setenv("SMTP_USERNAME", "")
	t.Setenv("SMTP_USER", "")
	t.Setenv("SMTP_FROM", "")
	t.Setenv("RESEND_FROM", "")

	service := &MailService{From: "no-reply@shiv-shakti.local"}

	if recipient := service.supportRecipient("ORDER_TO_EMAIL"); recipient != "admin@example.com" {
		t.Fatalf("supportRecipient() = %q, want admin@example.com", recipient)
	}
}

func TestSupportRecipientPrefersPrimaryRecipient(t *testing.T) {
	t.Setenv("ORDER_TO_EMAIL", "orders@example.com")
	t.Setenv("ADMIN_EMAIL", "admin@example.com")

	service := &MailService{From: "no-reply@shiv-shakti.local"}

	if recipient := service.supportRecipient("ORDER_TO_EMAIL"); recipient != "orders@example.com" {
		t.Fatalf("supportRecipient() = %q, want orders@example.com", recipient)
	}
}
