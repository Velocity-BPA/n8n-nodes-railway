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
import { TEAM_QUERIES, TEAM_MUTATIONS } from '../../constants/queries';
import { buildUpdateInput } from '../../utils/helpers';

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;

  validateRequired(this, { teamId }, ['teamId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    TEAM_QUERIES.get,
    { id: teamId },
    index,
  );

  const team = response.team as IDataObject;
  return [{ json: simplifyResponse(team) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const response = await railwayGraphQLRequest.call(
    this,
    TEAM_QUERIES.getAll,
    {},
    index,
  );

  const teams = response.teams as IDataObject;
  const edges = (teams.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  validateRequired(this, { teamId }, ['teamId'], index);

  const input = buildUpdateInput(updateFields, ['name', 'avatar']);

  const response = await railwayGraphQLRequest.call(
    this,
    TEAM_MUTATIONS.update,
    { id: teamId, input },
    index,
  );

  const team = response.teamUpdate as IDataObject;
  return [{ json: simplifyResponse(team) }];
}

export async function getMembers(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { teamId }, ['teamId'], index);

  if (returnAll) {
    const members = await railwayGraphQLRequestAllItems.call(
      this,
      TEAM_QUERIES.getMembers,
      { teamId },
      'team.members',
      index,
    );
    return members.map((member) => ({ json: simplifyResponse(member) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    TEAM_QUERIES.getMembers,
    { teamId, first: limit },
    index,
  );

  const team = response.team as IDataObject;
  const members = team.members as IDataObject;
  const edges = (members.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function inviteMember(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;
  const email = this.getNodeParameter('email', index) as string;
  const role = this.getNodeParameter('role', index, 'MEMBER') as string;

  validateRequired(this, { teamId, email }, ['teamId', 'email'], index);

  const input: IDataObject = {
    email,
    role,
  };

  await railwayGraphQLRequest.call(
    this,
    TEAM_MUTATIONS.inviteMember,
    { id: teamId, input },
    index,
  );

  return [{ json: { success: true, teamId, email, role } }];
}

export async function removeMember(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;
  const userId = this.getNodeParameter('userId', index) as string;

  validateRequired(this, { teamId, userId }, ['teamId', 'userId'], index);

  await railwayGraphQLRequest.call(
    this,
    TEAM_MUTATIONS.removeMember,
    { teamId, userId },
    index,
  );

  return [{ json: { success: true, teamId, userId } }];
}

export async function updateMemberRole(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const teamId = this.getNodeParameter('teamId', index) as string;
  const userId = this.getNodeParameter('userId', index) as string;
  const role = this.getNodeParameter('role', index) as string;

  validateRequired(this, { teamId, userId, role }, ['teamId', 'userId', 'role'], index);

  await railwayGraphQLRequest.call(
    this,
    TEAM_MUTATIONS.updateMemberRole,
    { teamId, userId, role },
    index,
  );

  return [{ json: { success: true, teamId, userId, role } }];
}
