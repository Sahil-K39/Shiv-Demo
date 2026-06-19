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

func TestHasSMTPConfigRequiresAllDeliveryFields(t *testing.T) {
	tests := []struct {
		name    string
		service MailService
		want    bool
	}{
		{
			name: "complete smtp config",
			service: MailService{
				Host:     "smtp.gmail.com",
				Username: "support@example.com",
				Password: "app-password",
				From:     "Shiv Shakti <support@example.com>",
			},
			want: true,
		},
		{
			name: "missing password",
			service: MailService{
				Host:     "smtp.gmail.com",
				Username: "support@example.com",
				From:     "Shiv Shakti <support@example.com>",
			},
			want: false,
		},
		{
			name: "blank from",
			service: MailService{
				Host:     "smtp.gmail.com",
				Username: "support@example.com",
				Password: "app-password",
				From:     " ",
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.service.hasSMTPConfig(); got != tt.want {
				t.Fatalf("hasSMTPConfig() = %v, want %v", got, tt.want)
			}
		})
	}
}
