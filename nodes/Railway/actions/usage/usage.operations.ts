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
  simplifyResponse,
  formatDate,
} from '../../transport';
import { USAGE_QUERIES } from '../../constants/queries';

export async function getProjectUsage(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  validateRequired(this, { projectId, startDate, endDate }, ['projectId', 'startDate', 'endDate'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    USAGE_QUERIES.getProjectUsage,
    {
      projectId,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    index,
  );

  const usage = response.projectUsage as IDataObject[];
  return usage.map((item) => ({ json: simplifyResponse(item) }));
}

export async function getTeamUsage(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  validateRequired(this, { teamId, startDate, endDate }, ['teamId', 'startDate', 'endDate'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    USAGE_QUERIES.getTeamUsage,
    {
      teamId,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    index,
  );

  const usage = response.teamUsage as IDataObject[];
  return usage.map((item) => ({ json: simplifyResponse(item) }));
}

export async function getEstimatedBill(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const scope = this.getNodeParameter('scope', index) as string;

  let variables: IDataObject = {};

  if (scope === 'team') {
    const teamId = this.getNodeParameter('teamId', index) as string;
    validateRequired(this, { teamId }, ['teamId'], index);
    variables = { teamId };
  } else if (scope === 'project') {
    const projectId = this.getNodeParameter('projectId', index) as string;
    validateRequired(this, { projectId }, ['projectId'], index);
    variables = { projectId };
  }

  const response = await railwayGraphQLRequest.call(
    this,
    USAGE_QUERIES.getEstimatedBill,
    variables,
    index,
  );

  const bill = response.estimatedBill as IDataObject;
  return [{ json: simplifyResponse(bill) }];
}
