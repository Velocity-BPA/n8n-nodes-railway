/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { get } from 'lodash';
import { RAILWAY_API_URL, DEFAULT_PAGE_SIZE } from '../constants/queries';
import type { IGraphQLResponse, IGraphQLError, IRailwayCredentials } from '../types/RailwayTypes';

type RailwayFunctions =
  | IExecuteFunctions
  | ILoadOptionsFunctions
  | IHookFunctions
  | IWebhookFunctions;

/**
 * Emit licensing notice on node load (once per session)
 */
let licenseNoticeEmitted = false;

export function emitLicenseNotice(): void {
  if (!licenseNoticeEmitted) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licenseNoticeEmitted = true;
  }
}

/**
 * Get authentication headers based on token type
 */
export function getAuthHeaders(credentials: IRailwayCredentials): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (credentials.tokenType) {
    case 'personal':
      headers['Authorization'] = `Bearer ${credentials.apiToken}`;
      break;
    case 'team':
      headers['Team-Access-Token'] = credentials.apiToken;
      break;
    case 'project':
      headers['Project-Access-Token'] = credentials.apiToken;
      break;
    default:
      headers['Authorization'] = `Bearer ${credentials.apiToken}`;
  }

  return headers;
}

/**
 * Handle GraphQL errors and convert to n8n errors
 */
function handleGraphQLErrors(
  context: RailwayFunctions,
  errors: IGraphQLError[],
  itemIndex = 0,
): never {
  const error = errors[0];
  const errorCode = error.extensions?.code as string | undefined;

  let message = error.message;
  let description = '';

  switch (errorCode) {
    case 'UNAUTHORIZED':
      message = 'Authentication failed';
      description = 'Invalid or missing API token. Please check your credentials.';
      break;
    case 'NOT_FOUND':
      message = 'Resource not found';
      description = error.message;
      break;
    case 'FORBIDDEN':
      message = 'Access denied';
      description = 'Insufficient permissions to perform this operation.';
      break;
    case 'BAD_USER_INPUT':
      message = 'Invalid input';
      description = error.message;
      break;
    case 'RATE_LIMITED':
      message = 'Rate limit exceeded';
      description = 'Too many requests. Please wait and try again.';
      break;
    default:
      description = `GraphQL Error: ${error.message}`;
  }

  throw new NodeApiError(context.getNode(), { message }, { message, description, itemIndex });
}

/**
 * Make a GraphQL request to Railway API
 */
export async function railwayGraphQLRequest(
  this: RailwayFunctions,
  query: string,
  variables?: IDataObject,
  itemIndex = 0,
): Promise<IDataObject> {
  emitLicenseNotice();

  const credentials = (await this.getCredentials('railwayApi')) as unknown as IRailwayCredentials;
  const headers = getAuthHeaders(credentials);

  const options: IHttpRequestOptions = {
    method: 'POST',
    url: RAILWAY_API_URL,
    headers,
    body: {
      query,
      variables: variables || {},
    },
    json: true,
  };

  try {
    const response = (await this.helpers.httpRequest(options)) as IGraphQLResponse;

    if (response.errors && response.errors.length > 0) {
      handleGraphQLErrors(this, response.errors, itemIndex);
    }

    if (!response.data) {
      throw new NodeOperationError(this.getNode(), 'No data returned from Railway API', {
        itemIndex,
      });
    }

    return response.data as IDataObject;
  } catch (error) {
    if (error instanceof NodeApiError || error instanceof NodeOperationError) {
      throw error;
    }

    throw new NodeApiError(
      this.getNode(),
      { message: (error as Error).message },
      {
        message: 'Failed to communicate with Railway API',
        description: (error as Error).message,
        itemIndex,
      },
    );
  }
}

/**
 * Make paginated GraphQL requests and return all items
 */
export async function railwayGraphQLRequestAllItems(
  this: RailwayFunctions,
  query: string,
  variables: IDataObject,
  propertyPath: string,
  itemIndex = 0,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await railwayGraphQLRequest.call(
      this,
      query,
      {
        ...variables,
        after: cursor,
        first: DEFAULT_PAGE_SIZE,
      },
      itemIndex,
    );

    const connectionData = get(response, propertyPath) as IDataObject | undefined;

    if (!connectionData) {
      break;
    }

    const edges = (connectionData.edges as Array<{ node: IDataObject }>) || [];
    const pageInfo = connectionData.pageInfo as { hasNextPage?: boolean; endCursor?: string } | undefined;

    for (const edge of edges) {
      if (edge.node) {
        returnData.push(edge.node);
      }
    }

    hasNextPage = pageInfo?.hasNextPage || false;
    cursor = pageInfo?.endCursor || null;

    // Safety check to prevent infinite loops
    if (!cursor && hasNextPage) {
      break;
    }
  }

  return returnData;
}

/**
 * Simplified request for single item operations
 */
export async function railwayRequest(
  this: RailwayFunctions,
  query: string,
  variables?: IDataObject,
  resultPath?: string,
  itemIndex = 0,
): Promise<IDataObject | IDataObject[] | boolean | string | number | null> {
  const response = await railwayGraphQLRequest.call(this, query, variables, itemIndex);

  if (resultPath) {
    return get(response, resultPath) as IDataObject | IDataObject[] | boolean | string | number | null;
  }

  return response;
}

/**
 * Format ISO date string
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Validate required parameters
 */
export function validateRequired(
  context: RailwayFunctions,
  params: Record<string, unknown>,
  required: string[],
  itemIndex = 0,
): void {
  for (const field of required) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      throw new NodeOperationError(
        context.getNode(),
        `Missing required parameter: ${field}`,
        { itemIndex },
      );
    }
  }
}

/**
 * Sleep helper for rate limiting
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff with jitter for rate limiting
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const isRateLimited =
        error instanceof NodeApiError &&
        (error.message.includes('RATE_LIMITED') || error.message.includes('Rate limit'));

      if (!isRateLimited || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Parse JSON safely
 */
export function safeJsonParse(value: string): IDataObject | null {
  try {
    return JSON.parse(value) as IDataObject;
  } catch {
    return null;
  }
}

/**
 * Convert key-value pairs to variables format
 */
export function convertToVariables(
  pairs: Array<{ name: string; value: string }>,
): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const pair of pairs) {
    if (pair.name) {
      variables[pair.name] = pair.value || '';
    }
  }
  return variables;
}

/**
 * Simplify response by removing __typename and other GraphQL metadata
 */
export function simplifyResponse(data: IDataObject): IDataObject {
  const simplified: IDataObject = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === '__typename') {
      continue;
    }

    if (Array.isArray(value)) {
      simplified[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? simplifyResponse(item as IDataObject)
          : item,
      );
    } else if (typeof value === 'object' && value !== null) {
      simplified[key] = simplifyResponse(value as IDataObject);
    } else {
      simplified[key] = value;
    }
  }

  return simplified;
}
