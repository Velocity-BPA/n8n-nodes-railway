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
import { DEPLOYMENT_QUERIES, DEPLOYMENT_MUTATIONS } from '../../constants/queries';
import { cleanObject } from '../../utils/helpers';

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_QUERIES.get,
    { id: deploymentId },
    index,
  );

  const deployment = response.deployment as IDataObject;
  return [{ json: simplifyResponse(deployment) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  const input: IDataObject = cleanObject({
    projectId: filters.projectId,
    serviceId: filters.serviceId,
    environmentId: filters.environmentId,
    status: filters.status,
  });

  if (returnAll) {
    const deployments = await railwayGraphQLRequestAllItems.call(
      this,
      DEPLOYMENT_QUERIES.getAll,
      { input },
      'deployments',
      index,
    );
    return deployments.map((deployment) => ({ json: simplifyResponse(deployment) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_QUERIES.getAll,
    { input, first: limit },
    index,
  );

  const deployments = response.deployments as IDataObject;
  const edges = (deployments.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function cancel(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_MUTATIONS.cancel,
    { id: deploymentId },
    index,
  );

  return [{ json: { success: true, deploymentId, action: 'cancelled' } }];
}

export async function rollback(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_MUTATIONS.rollback,
    { id: deploymentId },
    index,
  );

  const deployment = response.deploymentRollback as IDataObject;
  return [{ json: simplifyResponse(deployment) }];
}

export async function redeploy(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_MUTATIONS.redeploy,
    { id: deploymentId },
    index,
  );

  const deployment = response.deploymentRedeploy as IDataObject;
  return [{ json: simplifyResponse(deployment) }];
}

export async function restart(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_MUTATIONS.restart,
    { id: deploymentId },
    index,
  );

  return [{ json: { success: true, deploymentId, action: 'restarted' } }];
}

export async function getLogs(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_QUERIES.getLogs,
    { deploymentId },
    index,
  );

  const logs = response.deploymentLogs as IDataObject[];
  return logs.map((log) => ({ json: simplifyResponse(log) }));
}

export async function getBuildLogs(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const deploymentId = this.getNodeParameter('deploymentId', index) as string;

  validateRequired(this, { deploymentId }, ['deploymentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DEPLOYMENT_QUERIES.getBuildLogs,
    { deploymentId },
    index,
  );

  const logs = response.buildLogs as IDataObject[];
  return logs.map((log) => ({ json: simplifyResponse(log) }));
}
