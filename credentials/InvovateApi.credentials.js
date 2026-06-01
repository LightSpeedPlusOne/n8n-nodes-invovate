'use strict';

/**
 * Invovate API credential.
 * The API key is optional: JSON totals and PDF hosted-links work anonymously;
 * a free key (inv_…) enables direct PDF/UBL bytes. Get one at https://invovate.com/auth
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
          'Optional. Free key from https://invovate.com/auth (starts with inv_). Required only for direct PDF/UBL output; JSON totals and PDF hosted-links work without it.',
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
