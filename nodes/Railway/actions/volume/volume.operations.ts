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
import { VOLUME_QUERIES, VOLUME_MUTATIONS } from '../../constants/queries';
import { buildUpdateInput } from '../../utils/helpers';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const mountPath = this.getNodeParameter('mountPath', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { projectId, environmentId, mountPath }, ['projectId', 'environmentId', 'mountPath'], index);

  const input: IDataObject = {
    projectId,
    environmentId,
    mountPath,
  };

  if (additionalFields.name) {
    input.name = additionalFields.name;
  }

  if (additionalFields.serviceId) {
    input.serviceId = additionalFields.serviceId;
  }

  const response = await railwayGraphQLRequest.call(
    this,
    VOLUME_MUTATIONS.create,
    { input },
    index,
  );

  const volume = response.volumeCreate as IDataObject;
  return [{ json: simplifyResponse(volume) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const volumeId = this.getNodeParameter('volumeId', index) as string;

  validateRequired(this, { volumeId }, ['volumeId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    VOLUME_QUERIES.get,
    { id: volumeId },
    index,
  );

  const volume = response.volume as IDataObject;
  return [{ json: simplifyResponse(volume) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId }, ['projectId'], index);

  if (returnAll) {
    const volumes = await railwayGraphQLRequestAllItems.call(
      this,
      VOLUME_QUERIES.getAll,
      { projectId },
      'project.volumes',
      index,
    );
    return volumes.map((volume) => ({ json: simplifyResponse(volume) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    VOLUME_QUERIES.getAll,
    { projectId, first: limit },
    index,
  );

  const project = response.project as IDataObject;
  const volumes = project.volumes as IDataObject;
  const edges = (volumes.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const volumeId = this.getNodeParameter('volumeId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  validateRequired(this, { volumeId }, ['volumeId'], index);

  const input = buildUpdateInput(updateFields, ['name']);

  const response = await railwayGraphQLRequest.call(
    this,
    VOLUME_MUTATIONS.update,
    { id: volumeId, input },
    index,
  );

  const volume = response.volumeUpdate as IDataObject;
  return [{ json: simplifyResponse(volume) }];
}

export async function deleteVolume(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const volumeId = this.getNodeParameter('volumeId', index) as string;

  validateRequired(this, { volumeId }, ['volumeId'], index);

  await railwayGraphQLRequest.call(
    this,
    VOLUME_MUTATIONS.delete,
    { id: volumeId },
    index,
  );

  return [{ json: { success: true, volumeId } }];
}

export async function attach(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const volumeId = this.getNodeParameter('volumeId', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const mountPath = this.getNodeParameter('mountPath', index) as string;

  validateRequired(
    this,
    { volumeId, serviceId, environmentId, mountPath },
    ['volumeId', 'serviceId', 'environmentId', 'mountPath'],
    index,
  );

  const input: IDataObject = {
    serviceId,
    environmentId,
    mountPath,
  };

  const response = await railwayGraphQLRequest.call(
    this,
    VOLUME_MUTATIONS.attach,
    { volumeId, input },
    index,
  );

  const volumeInstance = response.volumeInstanceCreate as IDataObject;
  return [{ json: simplifyResponse(volumeInstance) }];
}

export async function detach(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const volumeInstanceId = this.getNodeParameter('volumeInstanceId', index) as string;

  validateRequired(this, { volumeInstanceId }, ['volumeInstanceId'], index);

  await railwayGraphQLRequest.call(
    this,
    VOLUME_MUTATIONS.detach,
    { id: volumeInstanceId },
    index,
  );

  return [{ json: { success: true, volumeInstanceId } }];
}
