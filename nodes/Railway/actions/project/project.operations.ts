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
import { PROJECT_QUERIES, PROJECT_MUTATIONS } from '../../constants/queries';
import { cleanObject, buildUpdateInput } from '../../utils/helpers';

export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  validateRequired(this, { name }, ['name'], index);

  const input: IDataObject = {
    name,
    ...cleanObject(additionalFields),
  };

  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_MUTATIONS.create,
    { input },
    index,
  );

  const project = response.projectCreate as IDataObject;
  return [{ json: simplifyResponse(project) }];
}

export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;

  validateRequired(this, { projectId }, ['projectId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_QUERIES.get,
    { id: projectId },
    index,
  );

  const project = response.project as IDataObject;
  return [{ json: simplifyResponse(project) }];
}

export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  if (returnAll) {
    const projects = await railwayGraphQLRequestAllItems.call(
      this,
      PROJECT_QUERIES.getAll,
      {},
      'projects',
      index,
    );
    return projects.map((project) => ({ json: simplifyResponse(project) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_QUERIES.getAll,
    { first: limit },
    index,
  );

  const projects = response.projects as IDataObject;
  const edges = (projects.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  validateRequired(this, { projectId }, ['projectId'], index);

  const input = buildUpdateInput(updateFields, ['name', 'description', 'isPublic', 'prDeploys']);

  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_MUTATIONS.update,
    { id: projectId, input },
    index,
  );

  const project = response.projectUpdate as IDataObject;
  return [{ json: simplifyResponse(project) }];
}

export async function deleteProject(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;

  validateRequired(this, { projectId }, ['projectId'], index);

  await railwayGraphQLRequest.call(
    this,
    PROJECT_MUTATIONS.delete,
    { id: projectId },
    index,
  );

  return [{ json: { success: true, projectId } }];
}

export async function transfer(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const teamId = this.getNodeParameter('teamId', index) as string;

  validateRequired(this, { projectId, teamId }, ['projectId', 'teamId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_MUTATIONS.transfer,
    {
      id: projectId,
      input: { teamId },
    },
    index,
  );

  const project = response.projectTransferToTeam as IDataObject;
  return [{ json: simplifyResponse(project) }];
}

export async function getMembers(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

  validateRequired(this, { projectId }, ['projectId'], index);

  if (returnAll) {
    const members = await railwayGraphQLRequestAllItems.call(
      this,
      PROJECT_QUERIES.getMembers,
      { projectId },
      'project.members',
      index,
    );
    return members.map((member) => ({ json: simplifyResponse(member) }));
  }

  const limit = this.getNodeParameter('limit', index, 50) as number;
  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_QUERIES.getMembers,
    { projectId, first: limit },
    index,
  );

  const project = response.project as IDataObject;
  const members = project.members as IDataObject;
  const edges = (members.edges as Array<{ node: IDataObject }>) || [];
  return edges.map((edge) => ({ json: simplifyResponse(edge.node) }));
}

export async function addMember(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const userId = this.getNodeParameter('userId', index) as string;
  const role = this.getNodeParameter('role', index, 'MEMBER') as string;

  validateRequired(this, { projectId, userId }, ['projectId', 'userId'], index);

  const response = await railwayGraphQLRequest.call(
    this,
    PROJECT_MUTATIONS.addMember,
    {
      input: {
        projectId,
        userId,
        role,
      },
    },
    index,
  );

  const member = response.projectMemberCreate as IDataObject;
  return [{ json: simplifyResponse(member) }];
}

export async function removeMember(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const projectId = this.getNodeParameter('projectId', index) as string;
  const userId = this.getNodeParameter('userId', index) as string;

  validateRequired(this, { projectId, userId }, ['projectId', 'userId'], index);

  await railwayGraphQLRequest.call(
    this,
    PROJECT_MUTATIONS.removeMember,
    {
      input: {
        projectId,
        userId,
      },
    },
    index,
  );

  return [{ json: { success: true, projectId, userId } }];
}
