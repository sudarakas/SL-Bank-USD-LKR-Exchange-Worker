# SL Bank USD to LKR Exchange Rate Worker

## Overview
This Cloudflare Worker monitors USD to LKR exchange rates from Sri Lankan banks and sends email alerts if any rate changes are detected. It utilizes Cloudflare KV for storing the last known exchange rates and Cloudflare Triggers for scheduled execution.

## Features
- Fetches USD to LKR exchange rates from the configured API.
- Supports tracking exchange rates from selected banks (CBSL, Commercial, HNB, Sampath).
- Compares the latest rates with previously stored values in **Cloudflare KV**.
- Sends an email notification via **Resend API** if any exchange rate changes.
- Runs automatically using **Cloudflare Triggers**.

## Tech Stack
- **Cloudflare Workers**: Serverless function execution.
- **Cloudflare KV**: Key-value storage for tracking exchange rates.
- **Cloudflare Triggers**: Automates periodic execution.
- **Resend API**: Email notification service.

## Setup & Configuration

### Prerequisites
- A Cloudflare account with Workers and KV enabled.
- API keys for the exchange rate source and email service (Resend API).

### Environment Variables
Set the following environment variables in Cloudflare:

```sh
EXCHNAGE_END_POINT=<API_URL>
EXCHANGE_KV=<Cloudflare_KV_Binding>
EMAIL_API_KEY=<Your_Resend_API_Key>
EMAIL_RECIPIENT=<Recipient_Email>
```

## Deployment Steps

**Clone the repository:**
```sh
git clone https://github.com/yourusername/sl-bank-usd-lkr-exchange-worker.git
cd sl-bank-usd-lkr-exchange-worker
```

**Install Cloudflare Wrangler CLI (if not installed):**

```sh
npm install -g wrangler
```

**Authenticate with Cloudflare:**

```sh
wrangler login
```

**Publish the Worker:**

```sh
wrangler deploy
```

**Configure a Cloudflare Trigger (Cron Job) to run the worker periodically:**

```sh
## This runs the worker every hour.
wrangler cron add "0 * * * *" --name exchange-rate-check
```

### Prerequisites
- The worker fetches USD to LKR exchange rates from the API.
- It checks if the rates from the monitored banks have changed.
- If changes are detected, it sends an email notification.
- The latest exchange rates are stored in Cloudflare KV for future comparisons.

 ### Sample Email Notification
 
 ```yaml
Subject: Exchange Rate Alert - 2025-02-03

Exchange rate changes were detected on 2025-02-03 (GMT+5:30) for the following banks:

Bank: CBSL
Old Rate: 320.50
New Rate: 322.00

Bank: HNB
Old Rate: 319.75
New Rate: 320.50
```

### Prerequisites
- Add support for more banks and currencies.
- Enhance error handling and logging.
- Integrate with additional notification channels (SMS, Slack, Telegram).

### License
- MIT License. Feel free to modify and use this project.
