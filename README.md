# n8n-nodes-invovate

An [n8n](https://n8n.io) community node for the [Invovate invoice API](https://invovate.com/api).
Generate **PDF, JSON, or UBL 2.1** invoices in **11 languages** (incl. Arabic RTL,
Japanese, Hindi, Cyrillic) inside your n8n workflows.

## Install

In n8n: **Settings → Community Nodes → Install** and enter:
```
n8n-nodes-invovate
```
(Self-hosted n8n only; community nodes aren't available on n8n Cloud's verified-only mode unless allowed.)

## Credential — "Invovate API"

- **API Key** (optional): a free key from https://invovate.com/auth (starts with `inv_`).
  - JSON totals and the **PDF hosted-link** output work **without** a key.
  - Direct **PDF binary** and **UBL** output require the key.

## Node — "Invovate"

Fields: **Output** (PDF hosted-link / PDF binary / JSON totals / UBL XML), **From**,
**To**, **Currency**, **Language**, **Template**, **Items** (description, quantity,
unit price, tax %), and **Additional Fields** (number, date, due date, notes, terms, global tax).

### Output modes
- **PDF — Hosted Link**: returns `hosted_url`, a 7-day link that renders the PDF. No key needed. Great for emailing a link.
- **PDF — Binary File**: returns the PDF as binary data (attach it / save it). Needs a key.
- **JSON Totals**: computed subtotal, tax, grand total, etc. No key needed.
- **UBL 2.1 XML**: returns the XML. Needs a key.

### Example
Trigger (e.g. new Stripe charge / form submission) → **Invovate** (map the customer
and line items) → **Send Email** with the `hosted_url` or the PDF binary attached.

## Notes
- **Not regulated e-invoicing.** UBL is for interoperability/archival only — no Peppol/Factur-X/XRechnung/NF-e compliance.
- Languages: `en, nl, de, fr, es, it, pt, ar, ja, ru, hi`. Templates: `classic, modern, bold, minimal, navy`.

Docs: https://invovate.com/api · AI agents: https://invovate.com/invoice-api-for-ai-agents

## License
MIT © Invovate
