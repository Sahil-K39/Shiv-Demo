package email

const OrderConfirmationHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHIV SHAKTI — Wholesale Enquiry Received</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            background-color: #0b0b0b;
            color: #d1d1d1;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #0b0b0b;
            padding: 40px 20px;
            box-sizing: border-box;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #121212;
            border: 1px solid #2a2a2a;
            padding: 40px;
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #2a2a2a;
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.3em;
            color: #ffffff;
            text-transform: uppercase;
            margin: 0;
        }
        .subtitle {
            font-size: 10px;
            letter-spacing: 0.15em;
            color: #888888;
            margin-top: 5px;
            text-transform: uppercase;
        }
        h1 {
            font-size: 18px;
            color: #ffffff;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-top: 0;
        }
        p {
            font-size: 12px;
            line-height: 1.6;
            color: #a0a0a0;
        }
        .order-details {
            margin: 30px 0;
            font-size: 11px;
            letter-spacing: 0.05em;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .detail-label {
            color: #666666;
            text-transform: uppercase;
        }
        .detail-value {
            color: #ffffff;
            text-align: right;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            font-size: 11px;
        }
        .items-table th {
            text-align: left;
            border-bottom: 1px solid #2a2a2a;
            padding-bottom: 10px;
            color: #666666;
            text-transform: uppercase;
            font-weight: normal;
            letter-spacing: 0.1em;
        }
        .items-table td {
            padding: 15px 0;
            border-bottom: 1px dashed #222222;
            vertical-align: top;
        }
        .item-name {
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
        }
        .item-meta {
            color: #666666;
            margin-top: 3px;
        }
        .item-price {
            text-align: right;
            color: #ffffff;
        }
        .totals-section {
            border-top: 1px solid #2a2a2a;
            padding-top: 20px;
            font-size: 12px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .total-row.grand {
            font-size: 14px;
            font-weight: bold;
            color: #ffffff;
            border-top: 1px dashed #2a2a2a;
            padding-top: 10px;
            margin-top: 10px;
        }
        .shipping-card {
            background-color: #171717;
            border: 1px dashed #333333;
            padding: 20px;
            margin: 30px 0;
            font-size: 11px;
        }
        .shipping-title {
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.1em;
        }
        .shipping-text {
            line-height: 1.5;
            color: #a0a0a0;
        }
        .footer {
            text-align: center;
            font-size: 9px;
            color: #444444;
            border-top: 1px solid #2a2a2a;
            padding-top: 30px;
            margin-top: 40px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">SHIV SHAKTI</div>
                <div class="subtitle">Commerce Engine v2.0</div>
            </div>

            <h1>Wholesale Enquiry Received</h1>
            <p>We have received your wholesale enquiry under reference #{{.Order.ID}}. Our team will review quantities, stock, payment method, and delivery plan before final confirmation.</p>

            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Enquiry Reference:</span>
                    <span class="detail-value">#{{.Order.ID}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{.Order.CreatedAt.Format "Jan 02, 2006 15:04 MST"}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Review Status:</span>
                    <span class="detail-value" style="color: #30d158;">{{.Order.Status}}</span>
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 70%;">Item Descr.</th>
                        <th style="width: 10%; text-align: center;">Qty</th>
                        <th style="width: 20%; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {{range .Order.Items}}
                    <tr>
                        <td>
                            <div class="item-name">{{.Name}}</div>
                            <div class="item-meta">Size: {{.Size}} | Color: {{if .Color}}{{.Color}}{{else}}Default{{end}}</div>
                        </td>
                        <td style="text-align: center; color: #ffffff;">{{.Quantity}}</td>
                        <td class="item-price">${{printf "%.2f" .Price}}</td>
                    </tr>
                    {{end}}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="total-row">
                    <span style="color: #666666;">SUBTOTAL</span>
                    <span>${{printf "%.2f" .Order.TotalPrice}}</span>
                </div>
                <div class="total-row">
                    <span style="color: #666666;">SHIPPING / HANDLING</span>
                    <span>Quoted after review</span>
                </div>
                <div class="total-row grand">
                    <span>ESTIMATED ENQUIRY VALUE</span>
                    <span>${{printf "%.2f" .Order.TotalPrice}}</span>
                </div>
            </div>

            <div class="shipping-card">
                <div class="shipping-title">Requested Delivery Details</div>
                <div class="shipping-text">
                    <strong>{{.Order.ShippingName}}</strong><br>
                    {{.Order.ShippingAddress}}<br>
                    {{.Order.ShippingCity}}, {{.Order.ShippingState}} {{.Order.ShippingZip}}<br>
                    {{.Order.ShippingCountry}}<br>
                    Phone: {{.Order.ShippingPhone}}
                </div>
            </div>

            <p style="text-align: center; font-size: 10px; color: #555555; margin-top: 30px;">
                We will contact you with payment instructions and delivery details after reviewing Enquiry #{{.Order.ID}}.
            </p>

            <div class="footer">
                &copy; {{.Order.CreatedAt.Format "2006"}} SHIV SHAKTI. ALL RIGHTS RESERVED.
            </div>
        </div>
    </div>
</body>
</html>
`
