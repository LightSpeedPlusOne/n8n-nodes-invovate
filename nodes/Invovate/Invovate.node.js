'use strict';

/**
 * Invovate n8n node — generate PDF / JSON / UBL invoices from the Invovate API.
 * Programmatic node (JS). The API key (optional) comes from the "Invovate API"
 * credential; JSON totals and PDF hosted-links work without one.
 */

const LANGUAGES = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'ar', 'ja', 'ru', 'hi'];
const TEMPLATES = ['classic', 'modern', 'bold', 'minimal', 'navy'];
const opt = (v) => ({ name: v, value: v });

class Invovate {
  constructor() {
    this.description = {
      displayName: 'Invovate',
      name: 'invovate',
      icon: 'file:invovate.svg',
      group: ['transform'],
      version: 1,
      subtitle: '={{$parameter["output"]}}',
      description: 'Generate PDF, JSON, or UBL 2.1 invoices in 11 languages',
      defaults: { name: 'Invovate' },
      inputs: ['main'],
      outputs: ['main'],
      credentials: [{ name: 'invovateApi', required: false }],
      properties: [
        {
          displayName: 'Output',
          name: 'output',
          type: 'options',
          default: 'pdf_link',
          options: [
            { name: 'PDF — Hosted Link (no key needed)', value: 'pdf_link' },
            { name: 'PDF — Binary File (needs key)', value: 'pdf' },
            { name: 'JSON Totals', value: 'json' },
            { name: 'UBL 2.1 XML (needs key)', value: 'ubl' },
          ],
        },
        { displayName: 'From Name', name: 'fromName', type: 'string', default: '', required: true, description: 'Business issuing the invoice' },
        { displayName: 'From Address', name: 'fromAddress', type: 'string', default: '', typeOptions: { rows: 2 } },
        { displayName: 'To Name', name: 'toName', type: 'string', default: '', required: true, description: 'Customer being billed' },
        { displayName: 'To Address', name: 'toAddress', type: 'string', default: '', typeOptions: { rows: 2 } },
        { displayName: 'Currency', name: 'currency', type: 'string', default: 'USD', description: 'ISO 4217 code, e.g. USD, EUR, GBP, JPY' },
        { displayName: 'Language', name: 'language', type: 'options', default: 'en', options: LANGUAGES.map(opt) },
        { displayName: 'Template', name: 'template', type: 'options', default: 'classic', options: TEMPLATES.map(opt) },
        {
          displayName: 'Items',
          name: 'items',
          type: 'fixedCollection',
          typeOptions: { multipleValues: true, sortable: true },
          default: {},
          options: [
            {
              name: 'item',
              displayName: 'Item',
              values: [
                { displayName: 'Description', name: 'description', type: 'string', default: '' },
                { displayName: 'Quantity', name: 'quantity', type: 'number', default: 1 },
                { displayName: 'Unit Price', name: 'unit_price', type: 'number', default: 0 },
                { displayName: 'Tax Rate %', name: 'tax_rate', type: 'number', default: 0 },
              ],
            },
          ],
        },
        {
          displayName: 'Additional Fields',
          name: 'additional',
          type: 'collection',
          placeholder: 'Add Field',
          default: {},
          options: [
            { displayName: 'Invoice Number', name: 'number', type: 'string', default: '' },
            { displayName: 'Date', name: 'date', type: 'string', default: '', description: 'ISO date, e.g. 2026-06-01' },
            { displayName: 'Due Date', name: 'due_date', type: 'string', default: '' },
            { displayName: 'Notes', name: 'notes', type: 'string', default: '', typeOptions: { rows: 2 } },
            { displayName: 'Terms', name: 'terms', type: 'string', default: '' },
            { displayName: 'Global Tax %', name: 'global_tax', type: 'number', default: 0 },
          ],
        },
      ],
    };
  }

  async execute() {
    const items = this.getInputData();
    const returnData = [];

    // Optional API key from the credential.
    let apiKey = '';
    try {
      const creds = await this.getCredentials('invovateApi');
      apiKey = (creds && creds.apiKey) || '';
    } catch (_) { /* no credential configured — fine for JSON / PDF link */ }

    for (let i = 0; i < items.length; i++) {
      const output = this.getNodeParameter('output', i);
      const itemsRaw = this.getNodeParameter('items.item', i, []);
      const additional = this.getNodeParameter('additional', i, {});

      const body = {
        from: { name: this.getNodeParameter('fromName', i), address: this.getNodeParameter('fromAddress', i, '') || undefined },
        to: { name: this.getNodeParameter('toName', i), address: this.getNodeParameter('toAddress', i, '') || undefined },
        currency: this.getNodeParameter('currency', i, 'USD'),
        language: this.getNodeParameter('language', i, 'en'),
        template: this.getNodeParameter('template', i, 'classic'),
        items: (Array.isArray(itemsRaw) ? itemsRaw : []).map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          ...(it.tax_rate ? { tax_rate: it.tax_rate } : {}),
        })),
        ...additional,
      };

      const apiOutput = output === 'pdf_link' ? 'json' : output;
      body.output = apiOutput;
      if (output === 'pdf_link') body.features = { hosted_link: true };

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
      const binary = output === 'pdf' || output === 'ubl';

      const response = await this.helpers.httpRequest({
        method: 'POST',
        url: 'https://invovate.com/api/generate-invoice',
        headers,
        body,
        json: !binary,
        encoding: binary ? 'arraybuffer' : undefined,
      });

      if (output === 'pdf') {
        const buf = Buffer.isBuffer(response) ? response : Buffer.from(response);
        const fileName = 'invoice-' + (body.number || Date.now()) + '.pdf';
        const binaryData = await this.helpers.prepareBinaryData(buf, fileName, 'application/pdf');
        returnData.push({ json: { fileName }, binary: { data: binaryData } });
      } else if (output === 'ubl') {
        const xml = Buffer.isBuffer(response) ? response.toString('utf8') : String(response);
        returnData.push({ json: { ubl: xml } });
      } else if (output === 'pdf_link') {
        const inv = (response && response.invoice) || response;
        returnData.push({ json: { hosted_url: inv.hosted_url || null, invoice: inv } });
      } else {
        returnData.push({ json: (response && response.invoice) || response });
      }
    }

    return [returnData];
  }
}

module.exports = { Invovate };
