/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
  railwayGraphQLRequest,
  validateRequired,
} from '../../transport';
import { VARIABLE_QUERIES, VARIABLE_MUTATIONS } from '../../constants/queries';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const name = this.getNodeParameter('name', index) as string;
  const value = this.getNodeParameter('value', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index, '') as string;

  validateRequired(this, { projectId, environmentId, name }, ['projectId', 'environmentId', 'name'], index);

  const input: IDataObject = {
    projectId,
    environmentId,
    name,
    value,
  };

  if (serviceId) {
    input.serviceId = serviceId;
  }

  await railwayGraphQLRequest.call(
    this,
    VARIABLE_MUTATIONS.upsert,
    { input },
    index,
  );

  return [{ json: { success: true, name, environmentId, serviceId: serviceId || null } }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const name = this.getNodeParameter('name', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index, '') as string;

  validateRequired(this, { projectId, environmentId, name }, ['projectId', 'environmentId', 'name'], index);

  const variables: IDataObject = {
    projectId,
    environmentId,
    name,
  };

  if (serviceId) {
    variables.serviceId = serviceId;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    VARIABLE_QUERIES.get,
    variables,
    index,
  );

  const value = response.variable as string;
  return [{ json: { name, value, environmentId, serviceId: serviceId || null } }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index, '') as string;

  validateRequired(this, { projectId, environmentId }, ['projectId', 'environmentId'], index);

  const variables: IDataObject = {
    projectId,
    environmentId,
  };

  if (serviceId) {
    variables.serviceId = serviceId;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    VARIABLE_QUERIES.getAll,
    variables,
    index,
  );

  // Variables are returned as a JSON object { name: value, ... }
  const variablesData = response.variables as Record<string, string>;
  const results: INodeExecutionData[] = [];

  for (const [name, value] of Object.entries(variablesData)) {
    results.push({
      json: {
        name,
        value,
        environmentId,
        serviceId: serviceId || null,
      },
    });
  }

  return results;
}

export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  // Update is the same as create (upsert)
  return create.call(this, index);
}

export async function deleteVariable(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const name = this.getNodeParameter('name', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index, '') as string;

  validateRequired(this, { projectId, environmentId, name }, ['projectId', 'environmentId', 'name'], index);

  const input: IDataObject = {
    projectId,
    environmentId,
    name,
  };

  if (serviceId) {
    input.serviceId = serviceId;
  }

  await railwayGraphQLRequest.call(
    this,
    VARIABLE_MUTATIONS.delete,
    { input },
    index,
  );

  return [{ json: { success: true, name, environmentId, serviceId: serviceId || null } }];
}

export async function bulkUpsert(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index, '') as string;
  const variablesJson = this.getNodeParameter('variables', index) as string;

  validateRequired(this, { projectId, environmentId, variablesJson }, ['projectId', 'environmentId', 'variables'], index);

  let variables: Record<string, string>;
  try {
    variables = JSON.parse(variablesJson) as Record<string, string>;
  } catch {
    throw new Error('Variables must be a valid JSON object');
  }

  const input: IDataObject = {
    projectId,
    environmentId,
    variables,
  };

  if (serviceId) {
    input.serviceId = serviceId;
  }

  await railwayGraphQLRequest.call(
    this,
    VARIABLE_MUTATIONS.bulkUpsert,
    { input },
    index,
  );

  return [{ json: { success: true, count: Object.keys(variables).length, environmentId, serviceId: serviceId || null } }];
}

export async function copyToEnvironment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const sourceEnvironmentId = this.getNodeParameter('sourceEnvironmentId', index) as string;
  const targetEnvironmentId = this.getNodeParameter('targetEnvironmentId', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index, '') as string;

  validateRequired(
    this,
    { projectId, sourceEnvironmentId, targetEnvironmentId },
    ['projectId', 'sourceEnvironmentId', 'targetEnvironmentId'],
    index,
  );

  // First, get all variables from source environment
  const sourceVariables: IDataObject = {
    projectId,
    environmentId: sourceEnvironmentId,
  };

  if (serviceId) {
    sourceVariables.serviceId = serviceId;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    VARIABLE_QUERIES.getAll,
    sourceVariables,
    index,
  );

  const variablesData = response.variables as Record<string, string>;

  // Then, upsert all variables to target environment
  const input: IDataObject = {
    projectId,
    environmentId: targetEnvironmentId,
    variables: variablesData,
  };

  if (serviceId) {
    input.serviceId = serviceId;
  }

  await railwayGraphQLRequest.call(
    this,
    VARIABLE_MUTATIONS.bulkUpsert,
    { input },
    index,
  );

  return [{
    json: {
      success: true,
      count: Object.keys(variablesData).length,
      sourceEnvironmentId,
      targetEnvironmentId,
      serviceId: serviceId || null,
    },
  }];
}
