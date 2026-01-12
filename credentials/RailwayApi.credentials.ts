/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  IHttpRequestHelper,
  INodeProperties,
} from 'n8n-workflow';

export class RailwayApi implements ICredentialType {
  name = 'railwayApi';
  displayName = 'Railway API';
  documentationUrl = 'https://docs.railway.app/reference/public-api';
  properties: INodeProperties[] = [
    {
      displayName: 'Token Type',
      name: 'tokenType',
      type: 'options',
      options: [
        {
          name: 'Personal Token',
          value: 'personal',
          description: 'Access to all your personal resources',
        },
        {
          name: 'Team Token',
          value: 'team',
          description: 'Access to all team resources',
        },
        {
          name: 'Project Token',
          value: 'project',
          description: 'Scoped to specific environment within project',
        },
      ],
      default: 'personal',
      description: 'The type of API token to use',
    },
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Railway API token',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {},
    },
  };

  async preAuthentication(
    this: IHttpRequestHelper,
    credentials: ICredentialDataDecryptedObject,
  ): Promise<ICredentialDataDecryptedObject> {
    const tokenType = credentials.tokenType as string;
    const apiToken = credentials.apiToken as string;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (tokenType) {
      case 'personal':
        headers['Authorization'] = `Bearer ${apiToken}`;
        break;
      case 'team':
        headers['Team-Access-Token'] = apiToken;
        break;
      case 'project':
        headers['Project-Access-Token'] = apiToken;
        break;
    }

    return { headers };
  }

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://backboard.railway.com/graphql/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ me { id email } }',
      }),
    },
    rules: [
      {
        type: 'responseSuccessBody',
        properties: {
          key: 'data.me.id',
          value: undefined,
          message: 'Invalid API token or insufficient permissions',
        },
      },
    ],
  };
}
