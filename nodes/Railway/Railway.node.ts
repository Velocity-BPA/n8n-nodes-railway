/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { emitLicenseNotice, railwayGraphQLRequest } from './transport';
import { PROJECT_QUERIES, SERVICE_QUERIES, ENVIRONMENT_QUERIES } from './constants/queries';
import {
  getDeploymentStatusOptions,
  getPluginTypeOptions,
  getTeamRoleOptions,
  getProjectRoleOptions,
  getRegionOptions,
} from './utils/helpers';

import * as projectOperations from './actions/project/project.operations';
import * as serviceOperations from './actions/service/service.operations';
import * as deploymentOperations from './actions/deployment/deployment.operations';
import * as environmentOperations from './actions/environment/environment.operations';
import * as variableOperations from './actions/variable/variable.operations';
import * as volumeOperations from './actions/volume/volume.operations';
import * as domainOperations from './actions/domain/domain.operations';
import * as tcpProxyOperations from './actions/tcpProxy/tcpProxy.operations';
import * as pluginOperations from './actions/plugin/plugin.operations';
import * as teamOperations from './actions/team/team.operations';
import * as usageOperations from './actions/usage/usage.operations';
import * as webhookOperations from './actions/webhook/webhook.operations';

import { nodeDescription } from './Railway.description';

export class Railway implements INodeType {
  description: INodeTypeDescription = nodeDescription;

  methods = {
    loadOptions: {
      async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await railwayGraphQLRequest.call(this, PROJECT_QUERIES.getAll, { first: 100 });
          const projects = response.projects as { edges: Array<{ node: { id: string; name: string } }> };
          return projects.edges.map((edge) => ({ name: edge.node.name, value: edge.node.id }));
        } catch {
          return [];
        }
      },
      async getServices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const projectId = this.getCurrentNodeParameter('projectId') as { value: string } | string;
        const id = typeof projectId === 'object' ? projectId.value : projectId;
        if (!id) return [];
        try {
          const response = await railwayGraphQLRequest.call(this, SERVICE_QUERIES.getAll, { projectId: id, first: 100 });
          const project = response.project as { services: { edges: Array<{ node: { id: string; name: string } }> } };
          return project.services.edges.map((edge) => ({ name: edge.node.name, value: edge.node.id }));
        } catch {
          return [];
        }
      },
      async getEnvironments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const projectId = this.getCurrentNodeParameter('projectId') as { value: string } | string;
        const id = typeof projectId === 'object' ? projectId.value : projectId;
        if (!id) return [];
        try {
          const response = await railwayGraphQLRequest.call(this, ENVIRONMENT_QUERIES.getAll, { projectId: id, first: 100 });
          const project = response.project as { environments: { edges: Array<{ node: { id: string; name: string } }> } };
          return project.environments.edges.map((edge) => ({ name: edge.node.name, value: edge.node.id }));
        } catch {
          return [];
        }
      },
      async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await railwayGraphQLRequest.call(this, `query { teams { edges { node { id name } } } }`, {});
          const teams = response.teams as { edges: Array<{ node: { id: string; name: string } }> };
          return teams.edges.map((edge) => ({ name: edge.node.name, value: edge.node.id }));
        } catch {
          return [];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    emitLicenseNotice();
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        // Execute the appropriate operation based on resource and operation
        switch (resource) {
          case 'project':
            switch (operation) {
              case 'create': result = await projectOperations.create.call(this, i); break;
              case 'get': result = await projectOperations.get.call(this, i); break;
              case 'getAll': result = await projectOperations.getAll.call(this, i); break;
              case 'update': result = await projectOperations.update.call(this, i); break;
              case 'delete': result = await projectOperations.deleteProject.call(this, i); break;
              case 'transfer': result = await projectOperations.transfer.call(this, i); break;
              case 'getMembers': result = await projectOperations.getMembers.call(this, i); break;
              case 'addMember': result = await projectOperations.addMember.call(this, i); break;
              case 'removeMember': result = await projectOperations.removeMember.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'service':
            switch (operation) {
              case 'create': result = await serviceOperations.create.call(this, i); break;
              case 'get': result = await serviceOperations.get.call(this, i); break;
              case 'getAll': result = await serviceOperations.getAll.call(this, i); break;
              case 'update': result = await serviceOperations.update.call(this, i); break;
              case 'delete': result = await serviceOperations.deleteService.call(this, i); break;
              case 'updateInstance': result = await serviceOperations.updateInstance.call(this, i); break;
              case 'redeploy': result = await serviceOperations.redeploy.call(this, i); break;
              case 'connect': result = await serviceOperations.connect.call(this, i); break;
              case 'disconnect': result = await serviceOperations.disconnect.call(this, i); break;
              case 'getInstance': result = await serviceOperations.getInstance.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'deployment':
            switch (operation) {
              case 'get': result = await deploymentOperations.get.call(this, i); break;
              case 'getAll': result = await deploymentOperations.getAll.call(this, i); break;
              case 'cancel': result = await deploymentOperations.cancel.call(this, i); break;
              case 'rollback': result = await deploymentOperations.rollback.call(this, i); break;
              case 'redeploy': result = await deploymentOperations.redeploy.call(this, i); break;
              case 'restart': result = await deploymentOperations.restart.call(this, i); break;
              case 'getLogs': result = await deploymentOperations.getLogs.call(this, i); break;
              case 'getBuildLogs': result = await deploymentOperations.getBuildLogs.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'environment':
            switch (operation) {
              case 'create': result = await environmentOperations.create.call(this, i); break;
              case 'get': result = await environmentOperations.get.call(this, i); break;
              case 'getAll': result = await environmentOperations.getAll.call(this, i); break;
              case 'update': result = await environmentOperations.update.call(this, i); break;
              case 'delete': result = await environmentOperations.deleteEnvironment.call(this, i); break;
              case 'duplicate': result = await environmentOperations.duplicate.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'variable':
            switch (operation) {
              case 'create': result = await variableOperations.create.call(this, i); break;
              case 'get': result = await variableOperations.get.call(this, i); break;
              case 'getAll': result = await variableOperations.getAll.call(this, i); break;
              case 'update': result = await variableOperations.update.call(this, i); break;
              case 'delete': result = await variableOperations.deleteVariable.call(this, i); break;
              case 'bulkUpsert': result = await variableOperations.bulkUpsert.call(this, i); break;
              case 'copyToEnvironment': result = await variableOperations.copyToEnvironment.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'volume':
            switch (operation) {
              case 'create': result = await volumeOperations.create.call(this, i); break;
              case 'get': result = await volumeOperations.get.call(this, i); break;
              case 'getAll': result = await volumeOperations.getAll.call(this, i); break;
              case 'update': result = await volumeOperations.update.call(this, i); break;
              case 'delete': result = await volumeOperations.deleteVolume.call(this, i); break;
              case 'attach': result = await volumeOperations.attach.call(this, i); break;
              case 'detach': result = await volumeOperations.detach.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'domain':
            switch (operation) {
              case 'create': result = await domainOperations.create.call(this, i); break;
              case 'get': result = await domainOperations.get.call(this, i); break;
              case 'getAll': result = await domainOperations.getAll.call(this, i); break;
              case 'delete': result = await domainOperations.deleteDomain.call(this, i); break;
              case 'checkStatus': result = await domainOperations.checkStatus.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'tcpProxy':
            switch (operation) {
              case 'create': result = await tcpProxyOperations.create.call(this, i); break;
              case 'get': result = await tcpProxyOperations.get.call(this, i); break;
              case 'getAll': result = await tcpProxyOperations.getAll.call(this, i); break;
              case 'delete': result = await tcpProxyOperations.deleteTcpProxy.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'plugin':
            switch (operation) {
              case 'create': result = await pluginOperations.create.call(this, i); break;
              case 'get': result = await pluginOperations.get.call(this, i); break;
              case 'getAll': result = await pluginOperations.getAll.call(this, i); break;
              case 'delete': result = await pluginOperations.deletePlugin.call(this, i); break;
              case 'restart': result = await pluginOperations.restart.call(this, i); break;
              case 'getConnectionString': result = await pluginOperations.getConnectionString.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'team':
            switch (operation) {
              case 'get': result = await teamOperations.get.call(this, i); break;
              case 'getAll': result = await teamOperations.getAll.call(this, i); break;
              case 'update': result = await teamOperations.update.call(this, i); break;
              case 'getMembers': result = await teamOperations.getMembers.call(this, i); break;
              case 'inviteMember': result = await teamOperations.inviteMember.call(this, i); break;
              case 'removeMember': result = await teamOperations.removeMember.call(this, i); break;
              case 'updateMemberRole': result = await teamOperations.updateMemberRole.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'usage':
            switch (operation) {
              case 'getProjectUsage': result = await usageOperations.getProjectUsage.call(this, i); break;
              case 'getTeamUsage': result = await usageOperations.getTeamUsage.call(this, i); break;
              case 'getEstimatedBill': result = await usageOperations.getEstimatedBill.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          case 'webhook':
            switch (operation) {
              case 'create': result = await webhookOperations.create.call(this, i); break;
              case 'get': result = await webhookOperations.get.call(this, i); break;
              case 'getAll': result = await webhookOperations.getAll.call(this, i); break;
              case 'delete': result = await webhookOperations.deleteWebhook.call(this, i); break;
              default: throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
            }
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }
    return [returnData];
  }
}
