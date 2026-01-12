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
import { SERVICE_QUERIES, SERVICE_MUTATIONS } from '../../constants/queries';
import { cleanObject, buildUpdateInput } from '../../utils/helpers';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { projectId }, ['projectId'], index);

  const input: IDataObject = {
    projectId,
  };

  if (additionalFields.name) {
    input.name = additionalFields.name;
  }

  // Handle source configuration
  if (additionalFields.sourceType) {
    const source: IDataObject = {};
    if (additionalFields.sourceType === 'image') {
      source.image = additionalFields.image;
    } else if (additionalFields.sourceType === 'repo') {
      source.repo = additionalFields.repo;
      if (additionalFields.branch) {
        source.branch = additionalFields.branch;
      }
    }
    if (Object.keys(source).length > 0) {
      input.source = source;
    }
  }

  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.create,
    { input },
    index,
  );

  const service = response.serviceCreate as IDataObject;
  return [{ json: simplifyResponse(service) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;

  validateRequired(this, { serviceId }, ['serviceId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_QUERIES.get,
    { id: serviceId },
    index,
  );

  const service = response.service as IDataObject;
  return [{ json: simplifyResponse(service) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId }, ['projectId'], index);

  if (returnAll) {
    const services = await railwayGraphQLRequestAllItems.call(
      this,
      SERVICE_QUERIES.getAll,
      { projectId },
      'project.services',
      index,
    );
    return services.map((service) => ({ json: simplifyResponse(service) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_QUERIES.getAll,
    { projectId, first: limit },
    index,
  );

  const project = response.project as IDataObject;
  const services = project.services as IDataObject;
  const edges = (services.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  validateRequired(this, { serviceId }, ['serviceId'], index);

  const input = buildUpdateInput(updateFields, ['name', 'icon']);

  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.update,
    { id: serviceId, input },
    index,
  );

  const service = response.serviceUpdate as IDataObject;
  return [{ json: simplifyResponse(service) }];
}

export async function deleteService(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;

  validateRequired(this, { serviceId }, ['serviceId'], index);

  await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.delete,
    { id: serviceId },
    index,
  );

  return [{ json: { success: true, serviceId } }];
}

export async function updateInstance(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  validateRequired(this, { serviceId, environmentId }, ['serviceId', 'environmentId'], index);

  const input = buildUpdateInput(updateFields, [
    'buildCommand',
    'startCommand',
    'rootDirectory',
    'healthcheckPath',
    'sleepApplication',
    'numReplicas',
    'region',
  ]);

  // Handle watch patterns
  if (updateFields.watchPatterns) {
    const patterns = updateFields.watchPatterns as string;
    input.watchPatterns = patterns.split(',').map((p) => p.trim());
  }

  // Handle source update
  if (updateFields.sourceType) {
    const source: IDataObject = {};
    if (updateFields.sourceType === 'image') {
      source.image = updateFields.image;
    } else if (updateFields.sourceType === 'repo') {
      source.repo = updateFields.repo;
      if (updateFields.branch) {
        source.branch = updateFields.branch;
      }
    }
    if (Object.keys(source).length > 0) {
      input.source = source;
    }
  }

  await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.updateInstance,
    { serviceId, environmentId, input: cleanObject(input) },
    index,
  );

  return [{ json: { success: true, serviceId, environmentId } }];
}

export async function redeploy(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;

  validateRequired(this, { serviceId, environmentId }, ['serviceId', 'environmentId'], index);

  await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.redeploy,
    { serviceId, environmentId },
    index,
  );

  return [{ json: { success: true, serviceId, environmentId, action: 'redeploy' } }];
}

export async function connect(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const repo = this.getNodeParameter('repo', index) as string;
  const branch = this.getNodeParameter('branch', index, '') as string;

  validateRequired(this, { serviceId, repo }, ['serviceId', 'repo'], index);

  const input: IDataObject = { repo };
  if (branch) {
    input.branch = branch;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.connect,
    { id: serviceId, input },
    index,
  );

  const service = response.serviceConnect as IDataObject;
  return [{ json: simplifyResponse(service) }];
}

export async function disconnect(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;

  validateRequired(this, { serviceId }, ['serviceId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_MUTATIONS.disconnect,
    { id: serviceId },
    index,
  );

  const service = response.serviceDisconnect as IDataObject;
  return [{ json: simplifyResponse(service) }];
}

export async function getInstance(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;

  validateRequired(this, { serviceId, environmentId }, ['serviceId', 'environmentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    SERVICE_QUERIES.getInstance,
    { serviceId, environmentId },
    index,
  );

  const instance = response.serviceInstance as IDataObject;
  return [{ json: simplifyResponse(instance) }];
}
