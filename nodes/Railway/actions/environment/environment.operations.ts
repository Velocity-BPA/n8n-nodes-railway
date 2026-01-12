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
import { ENVIRONMENT_QUERIES, ENVIRONMENT_MUTATIONS } from '../../constants/queries';
import { buildUpdateInput } from '../../utils/helpers';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const name = this.getNodeParameter('name', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { projectId, name }, ['projectId', 'name'], index);

  const input: IDataObject = {
    projectId,
    name,
  };

  if (additionalFields.isEphemeral !== undefined) {
    input.isEphemeral = additionalFields.isEphemeral;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    ENVIRONMENT_MUTATIONS.create,
    { input },
    index,
  );

  const environment = response.environmentCreate as IDataObject;
  return [{ json: simplifyResponse(environment) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const environmentId = this.getNodeParameter('environmentId', index) as string;

  validateRequired(this, { environmentId }, ['environmentId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    ENVIRONMENT_QUERIES.get,
    { id: environmentId },
    index,
  );

  const environment = response.environment as IDataObject;
  return [{ json: simplifyResponse(environment) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId }, ['projectId'], index);

  if (returnAll) {
    const environments = await railwayGraphQLRequestAllItems.call(
      this,
      ENVIRONMENT_QUERIES.getAll,
      { projectId },
      'project.environments',
      index,
    );
    return environments.map((environment) => ({ json: simplifyResponse(environment) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    ENVIRONMENT_QUERIES.getAll,
    { projectId, first: limit },
    index,
  );

  const project = response.project as IDataObject;
  const environments = project.environments as IDataObject;
  const edges = (environments.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  validateRequired(this, { environmentId }, ['environmentId'], index);

  const input = buildUpdateInput(updateFields, ['name']);

  const response = await railwayGraphQLRequest.call(
    this,
    ENVIRONMENT_MUTATIONS.update,
    { id: environmentId, input },
    index,
  );

  const environment = response.environmentUpdate as IDataObject;
  return [{ json: simplifyResponse(environment) }];
}

export async function deleteEnvironment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const environmentId = this.getNodeParameter('environmentId', index) as string;

  validateRequired(this, { environmentId }, ['environmentId'], index);

  await railwayGraphQLRequest.call(
    this,
    ENVIRONMENT_MUTATIONS.delete,
    { id: environmentId },
    index,
  );

  return [{ json: { success: true, environmentId } }];
}

export async function duplicate(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const name = this.getNodeParameter('name', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { environmentId, name }, ['environmentId', 'name'], index);

  const input: IDataObject = {
    name,
  };

  if (additionalFields.isEphemeral !== undefined) {
    input.isEphemeral = additionalFields.isEphemeral;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    ENVIRONMENT_MUTATIONS.duplicate,
    { id: environmentId, input },
    index,
  );

  const environment = response.environmentDuplicate as IDataObject;
  return [{ json: simplifyResponse(environment) }];
}
