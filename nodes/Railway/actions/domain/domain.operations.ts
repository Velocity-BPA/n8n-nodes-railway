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
import { DOMAIN_QUERIES, DOMAIN_MUTATIONS } from '../../constants/queries';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const domainType = this.getNodeParameter('domainType', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { serviceId, environmentId }, ['serviceId', 'environmentId'], index);

  if (domainType === 'custom') {
    const domain = this.getNodeParameter('domain', index) as string;
    validateRequired(this, { domain }, ['domain'], index);

    const input: IDataObject = {
      serviceId,
      environmentId,
      domain,
    };

    if (additionalFields.targetPort) {
      input.targetPort = additionalFields.targetPort;
    }

    const response = await railwayGraphQLRequest.call(
      this,
      DOMAIN_MUTATIONS.create,
      { input },
      index,
    );

    const customDomain = response.customDomainCreate as IDataObject;
    return [{ json: simplifyResponse(customDomain) }];
  } else {
    // Generate Railway subdomain
    const input: IDataObject = {
      serviceId,
      environmentId,
    };

    if (additionalFields.targetPort) {
      input.targetPort = additionalFields.targetPort;
    }

    const response = await railwayGraphQLRequest.call(
      this,
      DOMAIN_MUTATIONS.createServiceDomain,
      { input },
      index,
    );

    const serviceDomain = response.serviceDomainCreate as IDataObject;
    return [{ json: simplifyResponse(serviceDomain) }];
  }
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const domainId = this.getNodeParameter('domainId', index) as string;

  validateRequired(this, { domainId }, ['domainId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DOMAIN_QUERIES.get,
    { id: domainId },
    index,
  );

  const domain = response.domain as IDataObject;
  return [{ json: simplifyResponse(domain) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const environmentId = this.getNodeParameter('environmentId', index) as string;
  const serviceId = this.getNodeParameter('serviceId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId, environmentId, serviceId }, ['projectId', 'environmentId', 'serviceId'], index);

  if (returnAll) {
    const domains = await railwayGraphQLRequestAllItems.call(
      this,
      DOMAIN_QUERIES.getAll,
      { projectId, environmentId, serviceId },
      'domains',
      index,
    );
    return domains.map((domain) => ({ json: simplifyResponse(domain) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    DOMAIN_QUERIES.getAll,
    { projectId, environmentId, serviceId, first: limit },
    index,
  );

  const domains = response.domains as IDataObject;
  const edges = (domains.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function deleteDomain(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const domainId = this.getNodeParameter('domainId', index) as string;

  validateRequired(this, { domainId }, ['domainId'], index);

  await railwayGraphQLRequest.call(
    this,
    DOMAIN_MUTATIONS.delete,
    { id: domainId },
    index,
  );

  return [{ json: { success: true, domainId } }];
}

export async function checkStatus(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const domainId = this.getNodeParameter('domainId', index) as string;

  validateRequired(this, { domainId }, ['domainId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    DOMAIN_QUERIES.checkStatus,
    { id: domainId },
    index,
  );

  const customDomain = response.customDomain as IDataObject;
  return [{ json: simplifyResponse(customDomain) }];
}
