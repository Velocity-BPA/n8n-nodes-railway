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
import { TCP_PROXY_QUERIES, TCP_PROXY_MUTATIONS } from '../../constants/queries';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const applicationPort = this.getNodeParameter('applicationPort', index) as number;

  validateRequired(this, { serviceId, environmentId, applicationPort }, ['serviceId', 'environmentId', 'applicationPort'], index);

  const input: IDataObject = {
    serviceId,
    environmentId,
    applicationPort,
  };

  const response = await railwayGraphQLRequest.call(
    this,
    TCP_PROXY_MUTATIONS.create,
    { input },
    index,
  );

  const tcpProxy = response.tcpProxyCreate as IDataObject;
  return [{ json: simplifyResponse(tcpProxy) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const tcpProxyId = this.getNodeParameter('tcpProxyId', index) as string;

  validateRequired(this, { tcpProxyId }, ['tcpProxyId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    TCP_PROXY_QUERIES.get,
    { id: tcpProxyId },
    index,
  );

  const tcpProxy = response.tcpProxy as IDataObject;
  return [{ json: simplifyResponse(tcpProxy) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { serviceId, environmentId }, ['serviceId', 'environmentId'], index);

  if (returnAll) {
    const tcpProxies = await railwayGraphQLRequestAllItems.call(
      this,
      TCP_PROXY_QUERIES.getAll,
      { serviceId, environmentId },
      'tcpProxies',
      index,
    );
    return tcpProxies.map((tcpProxy) => ({ json: simplifyResponse(tcpProxy) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    TCP_PROXY_QUERIES.getAll,
    { serviceId, environmentId, first: limit },
    index,
  );

  const tcpProxies = response.tcpProxies as IDataObject;
  const edges = (tcpProxies.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function deleteTcpProxy(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const tcpProxyId = this.getNodeParameter('tcpProxyId', index) as string;

  validateRequired(this, { tcpProxyId }, ['tcpProxyId'], index);

  await railwayGraphQLRequest.call(
    this,
    TCP_PROXY_MUTATIONS.delete,
    { id: tcpProxyId },
    index,
  );

  return [{ json: { success: true, tcpProxyId } }];
}
