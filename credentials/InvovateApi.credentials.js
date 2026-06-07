'use strict';

/**
 * Invovate API credential.
 * The API key is required for PDF, UBL, QR, and hosted links; JSON totals work without it.
 * Get a free key (inv_…) at https://invovate.com/auth
 */
class InvovateApi {
  constructor() {
    this.name = 'invovateApi';
    this.displayName = 'Invovate API';
    this.documentationUrl = 'https://invovate.com/api';
    this.properties = [
      {
        displayName: 'API Key',
        name: 'apiKey',
        type: 'string',
        typeOptions: { password: true },
        default: '',
        description:
          'Free key from https://invovate.com/auth (starts with inv_). Required for PDF, UBL, QR, and hosted links. JSON totals work without it.',
      },
    ];
    // Send the Bearer header only when a key is provided.
    this.authenticate = {
      type: 'generic',
      properties: {
        headers: {
          Authorization:
            '={{$credentials.apiKey ? "Bearer " + $credentials.apiKey : undefined}}',
        },
      },
    };
    this.test = {
      request: {
        baseURL: 'https://invovate.com',
        url: '/api/health',
        method: 'GET',
      },
    };
  }
}

module.exports = { InvovateApi };
