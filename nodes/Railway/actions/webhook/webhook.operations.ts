/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
  railwayGraphQLRequest,
  railwayGraphQLRequestAllItems,
  validateRequired,
  simplifyResponse,
} from '../../transport';
import { WEBHOOK_QUERIES, WEBHOOK_MUTATIONS } from '../../constants/queries';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const url = this.getNodeParameter('url', index) as string;

  validateRequired(this, { projectId, url }, ['projectId', 'url'], index);

  const input: IDataObject = {
    projectId,
    url,
  };

  const response = await railwayGraphQLRequest.call(
    this,
    WEBHOOK_MUTATIONS.create,
    { input },
    index,
  );

  const webhook = response.webhookCreate as IDataObject;
  return [{ json: simplifyResponse(webhook) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  validateRequired(this, { webhookId }, ['webhookId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    WEBHOOK_QUERIES.get,
    { id: webhookId },
    index,
  );

  const webhook = response.webhook as IDataObject;
  return [{ json: simplifyResponse(webhook) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId }, ['projectId'], index);

  if (returnAll) {
    const webhooks = await railwayGraphQLRequestAllItems.call(
      this,
      WEBHOOK_QUERIES.getAll,
      { projectId },
      'project.webhooks',
      index,
    );
    return webhooks.map((webhook) => ({ json: simplifyResponse(webhook) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    WEBHOOK_QUERIES.getAll,
    { projectId, first: limit },
    index,
  );

  const project = response.project as IDataObject;
  const webhooks = project.webhooks as IDataObject;
  const edges = (webhooks.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function deleteWebhook(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  validateRequired(this, { webhookId }, ['webhookId'], index);

  await railwayGraphQLRequest.call(
    this,
    WEBHOOK_MUTATIONS.delete,
    { id: webhookId },
    index,
  );

  return [{ json: { success: true, webhookId } }];
}
