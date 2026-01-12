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
import { PLUGIN_QUERIES, PLUGIN_MUTATIONS, VARIABLE_QUERIES } from '../../constants/queries';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const pluginType = this.getNodeParameter('pluginType', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { projectId, pluginType }, ['projectId', 'pluginType'], index);

  const input: IDataObject = {
    projectId,
    name: pluginType,
  };

  if (additionalFields.friendlyName) {
    input.friendlyName = additionalFields.friendlyName;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    PLUGIN_MUTATIONS.create,
    { input },
    index,
  );

  const plugin = response.pluginCreate as IDataObject;
  return [{ json: simplifyResponse(plugin) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pluginId = this.getNodeParameter('pluginId', index) as string;

  validateRequired(this, { pluginId }, ['pluginId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    PLUGIN_QUERIES.get,
    { id: pluginId },
    index,
  );

  const plugin = response.plugin as IDataObject;
  return [{ json: simplifyResponse(plugin) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId }, ['projectId'], index);

  if (returnAll) {
    const plugins = await railwayGraphQLRequestAllItems.call(
      this,
      PLUGIN_QUERIES.getAll,
      { projectId },
      'project.plugins',
      index,
    );
    return plugins.map((plugin) => ({ json: simplifyResponse(plugin) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    PLUGIN_QUERIES.getAll,
    { projectId, first: limit },
    index,
  );

  const project = response.project as IDataObject;
  const plugins = project.plugins as IDataObject;
  const edges = (plugins.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function deletePlugin(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pluginId = this.getNodeParameter('pluginId', index) as string;

  validateRequired(this, { pluginId }, ['pluginId'], index);

  await railwayGraphQLRequest.call(
    this,
    PLUGIN_MUTATIONS.delete,
    { id: pluginId },
    index,
  );

  return [{ json: { success: true, pluginId } }];
}

export async function restart(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pluginId = this.getNodeParameter('pluginId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;

  validateRequired(this, { pluginId, environmentId }, ['pluginId', 'environmentId'], index);

  await railwayGraphQLRequest.call(
    this,
    PLUGIN_MUTATIONS.restart,
    { id: pluginId, environmentId },
    index,
  );

  return [{ json: { success: true, pluginId, environmentId, action: 'restarted' } }];
}

export async function getConnectionString(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const pluginId = this.getNodeParameter('pluginId', index) as string;

  validateRequired(this, { projectId, environmentId, pluginId }, ['projectId', 'environmentId', 'pluginId'], index);

  // Plugin connection strings are stored as variables
  // Common variable names: DATABASE_URL, REDIS_URL, etc.
  const response = await railwayGraphQLRequest.call(
    this,
    VARIABLE_QUERIES.getAll,
    { projectId, environmentId, serviceId: pluginId },
    index,
  );

  const variables = response.variables as Record<string, string>;
  
  // Look for common connection string variable names
  const connectionStringKeys = [
    'DATABASE_URL',
    'DATABASE_PRIVATE_URL',
    'DATABASE_PUBLIC_URL',
    'REDIS_URL',
    'REDIS_PRIVATE_URL',
    'REDIS_PUBLIC_URL',
    'MONGO_URL',
    'MONGO_PRIVATE_URL',
    'MONGO_PUBLIC_URL',
    'MYSQL_URL',
    'MYSQL_PRIVATE_URL',
    'MYSQL_PUBLIC_URL',
  ];

  const connectionStrings: IDataObject = {};
  for (const key of connectionStringKeys) {
    if (variables[key]) {
      connectionStrings[key] = variables[key];
    }
  }

  return [{ json: { pluginId, environmentId, connectionStrings } }];
}
