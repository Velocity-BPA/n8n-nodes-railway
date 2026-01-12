/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeTypeDescription } from 'n8n-workflow';
import {
  getDeploymentStatusOptions,
  getPluginTypeOptions,
  getTeamRoleOptions,
  getProjectRoleOptions,
  getRegionOptions,
} from './utils/helpers';

export const nodeDescription: INodeTypeDescription = {
  displayName: 'Railway',
  name: 'railway',
  icon: 'file:railway.svg',
  group: ['transform'],
  version: 1,
  subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
  description: 'Manage Railway projects, services, deployments, and infrastructure',
  defaults: { name: 'Railway' },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [{ name: 'railwayApi', required: true }],
  properties: [
    {
      displayName: 'Resource',
      name: 'resource',
      type: 'options',
      noDataExpression: true,
      options: [
        { name: 'Deployment', value: 'deployment' },
        { name: 'Domain', value: 'domain' },
        { name: 'Environment', value: 'environment' },
        { name: 'Plugin (Database)', value: 'plugin' },
        { name: 'Project', value: 'project' },
        { name: 'Service', value: 'service' },
        { name: 'TCP Proxy', value: 'tcpProxy' },
        { name: 'Team', value: 'team' },
        { name: 'Usage', value: 'usage' },
        { name: 'Variable', value: 'variable' },
        { name: 'Volume', value: 'volume' },
        { name: 'Webhook', value: 'webhook' },
      ],
      default: 'project',
    },
    // Project Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['project'] } },
      options: [
        { name: 'Add Member', value: 'addMember', action: 'Add member to project' },
        { name: 'Create', value: 'create', action: 'Create project' },
        { name: 'Delete', value: 'delete', action: 'Delete project' },
        { name: 'Get', value: 'get', action: 'Get project' },
        { name: 'Get Many', value: 'getAll', action: 'Get many projects' },
        { name: 'Get Members', value: 'getMembers', action: 'Get project members' },
        { name: 'Remove Member', value: 'removeMember', action: 'Remove member' },
        { name: 'Transfer', value: 'transfer', action: 'Transfer project' },
        { name: 'Update', value: 'update', action: 'Update project' },
      ],
      default: 'get',
    },
    // Service Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['service'] } },
      options: [
        { name: 'Connect', value: 'connect', action: 'Connect to repo' },
        { name: 'Create', value: 'create', action: 'Create service' },
        { name: 'Delete', value: 'delete', action: 'Delete service' },
        { name: 'Disconnect', value: 'disconnect', action: 'Disconnect source' },
        { name: 'Get', value: 'get', action: 'Get service' },
        { name: 'Get Instance', value: 'getInstance', action: 'Get instance' },
        { name: 'Get Many', value: 'getAll', action: 'Get many services' },
        { name: 'Redeploy', value: 'redeploy', action: 'Redeploy service' },
        { name: 'Update', value: 'update', action: 'Update service' },
        { name: 'Update Instance', value: 'updateInstance', action: 'Update instance' },
      ],
      default: 'get',
    },
    // Deployment Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['deployment'] } },
      options: [
        { name: 'Cancel', value: 'cancel', action: 'Cancel deployment' },
        { name: 'Get', value: 'get', action: 'Get deployment' },
        { name: 'Get Build Logs', value: 'getBuildLogs', action: 'Get build logs' },
        { name: 'Get Logs', value: 'getLogs', action: 'Get logs' },
        { name: 'Get Many', value: 'getAll', action: 'Get many deployments' },
        { name: 'Redeploy', value: 'redeploy', action: 'Redeploy' },
        { name: 'Restart', value: 'restart', action: 'Restart' },
        { name: 'Rollback', value: 'rollback', action: 'Rollback' },
      ],
      default: 'get',
    },
    // Environment Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['environment'] } },
      options: [
        { name: 'Create', value: 'create', action: 'Create environment' },
        { name: 'Delete', value: 'delete', action: 'Delete environment' },
        { name: 'Duplicate', value: 'duplicate', action: 'Duplicate environment' },
        { name: 'Get', value: 'get', action: 'Get environment' },
        { name: 'Get Many', value: 'getAll', action: 'Get many environments' },
        { name: 'Update', value: 'update', action: 'Update environment' },
      ],
      default: 'get',
    },
    // Variable Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['variable'] } },
      options: [
        { name: 'Bulk Upsert', value: 'bulkUpsert', action: 'Bulk upsert' },
        { name: 'Copy to Environment', value: 'copyToEnvironment', action: 'Copy variables' },
        { name: 'Create', value: 'create', action: 'Create variable' },
        { name: 'Delete', value: 'delete', action: 'Delete variable' },
        { name: 'Get', value: 'get', action: 'Get variable' },
        { name: 'Get Many', value: 'getAll', action: 'Get many variables' },
        { name: 'Update', value: 'update', action: 'Update variable' },
      ],
      default: 'get',
    },
    // Volume Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['volume'] } },
      options: [
        { name: 'Attach', value: 'attach', action: 'Attach volume' },
        { name: 'Create', value: 'create', action: 'Create volume' },
        { name: 'Delete', value: 'delete', action: 'Delete volume' },
        { name: 'Detach', value: 'detach', action: 'Detach volume' },
        { name: 'Get', value: 'get', action: 'Get volume' },
        { name: 'Get Many', value: 'getAll', action: 'Get many volumes' },
        { name: 'Update', value: 'update', action: 'Update volume' },
      ],
      default: 'get',
    },
    // Domain Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['domain'] } },
      options: [
        { name: 'Check Status', value: 'checkStatus', action: 'Check status' },
        { name: 'Create', value: 'create', action: 'Create domain' },
        { name: 'Delete', value: 'delete', action: 'Delete domain' },
        { name: 'Get', value: 'get', action: 'Get domain' },
        { name: 'Get Many', value: 'getAll', action: 'Get many domains' },
      ],
      default: 'get',
    },
    // TCP Proxy Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['tcpProxy'] } },
      options: [
        { name: 'Create', value: 'create', action: 'Create proxy' },
        { name: 'Delete', value: 'delete', action: 'Delete proxy' },
        { name: 'Get', value: 'get', action: 'Get proxy' },
        { name: 'Get Many', value: 'getAll', action: 'Get many proxies' },
      ],
      default: 'get',
    },
    // Plugin Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['plugin'] } },
      options: [
        { name: 'Create', value: 'create', action: 'Create plugin' },
        { name: 'Delete', value: 'delete', action: 'Delete plugin' },
        { name: 'Get', value: 'get', action: 'Get plugin' },
        { name: 'Get Connection String', value: 'getConnectionString', action: 'Get connection' },
        { name: 'Get Many', value: 'getAll', action: 'Get many plugins' },
        { name: 'Restart', value: 'restart', action: 'Restart plugin' },
      ],
      default: 'get',
    },
    // Team Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['team'] } },
      options: [
        { name: 'Get', value: 'get', action: 'Get team' },
        { name: 'Get Many', value: 'getAll', action: 'Get many teams' },
        { name: 'Get Members', value: 'getMembers', action: 'Get members' },
        { name: 'Invite Member', value: 'inviteMember', action: 'Invite member' },
        { name: 'Remove Member', value: 'removeMember', action: 'Remove member' },
        { name: 'Update', value: 'update', action: 'Update team' },
        { name: 'Update Member Role', value: 'updateMemberRole', action: 'Update role' },
      ],
      default: 'get',
    },
    // Usage Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['usage'] } },
      options: [
        { name: 'Get Estimated Bill', value: 'getEstimatedBill', action: 'Get bill' },
        { name: 'Get Project Usage', value: 'getProjectUsage', action: 'Get project usage' },
        { name: 'Get Team Usage', value: 'getTeamUsage', action: 'Get team usage' },
      ],
      default: 'getProjectUsage',
    },
    // Webhook Operations
    {
      displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
      displayOptions: { show: { resource: ['webhook'] } },
      options: [
        { name: 'Create', value: 'create', action: 'Create webhook' },
        { name: 'Delete', value: 'delete', action: 'Delete webhook' },
        { name: 'Get', value: 'get', action: 'Get webhook' },
        { name: 'Get Many', value: 'getAll', action: 'Get many webhooks' },
      ],
      default: 'get',
    },
    // Project ID fields
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['project'], operation: ['get', 'update', 'delete', 'transfer', 'getMembers', 'addMember', 'removeMember'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['service'], operation: ['create', 'getAll'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['environment'], operation: ['create', 'getAll'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['variable'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['volume'], operation: ['create', 'getAll'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['domain'], operation: ['getAll'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['plugin'], operation: ['create', 'getAll', 'getConnectionString'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['webhook'] } },
    },
    {
      displayName: 'Project', name: 'projectId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getProjects', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'project-id' },
      ],
      displayOptions: { show: { resource: ['usage'], operation: ['getProjectUsage'] } },
    },
    // Service ID fields
    {
      displayName: 'Service', name: 'serviceId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getServices', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'service-id' },
      ],
      displayOptions: { show: { resource: ['service'], operation: ['get', 'update', 'delete', 'updateInstance', 'redeploy', 'connect', 'disconnect', 'getInstance'] } },
    },
    {
      displayName: 'Service', name: 'serviceId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getServices', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'service-id' },
      ],
      displayOptions: { show: { resource: ['domain'] } },
    },
    {
      displayName: 'Service', name: 'serviceId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getServices', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'service-id' },
      ],
      displayOptions: { show: { resource: ['tcpProxy'] } },
    },
    {
      displayName: 'Service', name: 'serviceId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getServices', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'service-id' },
      ],
      displayOptions: { show: { resource: ['volume'], operation: ['attach'] } },
    },
    // Environment ID fields
    {
      displayName: 'Environment', name: 'environmentId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getEnvironments', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'env-id' },
      ],
      displayOptions: { show: { resource: ['environment'], operation: ['get', 'update', 'delete', 'duplicate'] } },
    },
    {
      displayName: 'Environment', name: 'environmentId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getEnvironments', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'env-id' },
      ],
      displayOptions: { show: { resource: ['service'], operation: ['updateInstance', 'redeploy', 'getInstance'] } },
    },
    {
      displayName: 'Environment', name: 'environmentId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getEnvironments', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'env-id' },
      ],
      displayOptions: { show: { resource: ['variable'], operation: ['create', 'get', 'getAll', 'update', 'delete', 'bulkUpsert'] } },
    },
    {
      displayName: 'Environment', name: 'environmentId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getEnvironments', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'env-id' },
      ],
      displayOptions: { show: { resource: ['volume'], operation: ['create', 'attach'] } },
    },
    {
      displayName: 'Environment', name: 'environmentId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getEnvironments', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'env-id' },
      ],
      displayOptions: { show: { resource: ['domain', 'tcpProxy'] } },
    },
    {
      displayName: 'Environment', name: 'environmentId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getEnvironments', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'env-id' },
      ],
      displayOptions: { show: { resource: ['plugin'], operation: ['restart', 'getConnectionString'] } },
    },
    // Team ID fields
    {
      displayName: 'Team', name: 'teamId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getTeams', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'team-id' },
      ],
      displayOptions: { show: { resource: ['team'], operation: ['get', 'update', 'getMembers', 'inviteMember', 'removeMember', 'updateMemberRole'] } },
    },
    {
      displayName: 'Team', name: 'teamId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getTeams', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'team-id' },
      ],
      displayOptions: { show: { resource: ['project'], operation: ['transfer'] } },
    },
    {
      displayName: 'Team', name: 'teamId', type: 'resourceLocator', default: { mode: 'list', value: '' }, required: true,
      modes: [
        { displayName: 'From List', name: 'list', type: 'list', typeOptions: { searchListMethod: 'getTeams', searchable: true } },
        { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'team-id' },
      ],
      displayOptions: { show: { resource: ['usage'], operation: ['getTeamUsage'] } },
    },
    // Simple string IDs
    { displayName: 'Deployment ID', name: 'deploymentId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['deployment'], operation: ['get', 'cancel', 'rollback', 'redeploy', 'restart', 'getLogs', 'getBuildLogs'] } } },
    { displayName: 'Volume ID', name: 'volumeId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['volume'], operation: ['get', 'update', 'delete', 'attach'] } } },
    { displayName: 'Volume Instance ID', name: 'volumeInstanceId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['volume'], operation: ['detach'] } } },
    { displayName: 'Domain ID', name: 'domainId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['domain'], operation: ['get', 'delete', 'checkStatus'] } } },
    { displayName: 'TCP Proxy ID', name: 'tcpProxyId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['tcpProxy'], operation: ['get', 'delete'] } } },
    { displayName: 'Plugin ID', name: 'pluginId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['plugin'], operation: ['get', 'delete', 'restart', 'getConnectionString'] } } },
    { displayName: 'Webhook ID', name: 'webhookId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['webhook'], operation: ['get', 'delete'] } } },
    { displayName: 'User ID', name: 'userId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['project', 'team'], operation: ['addMember', 'removeMember', 'updateMemberRole'] } } },
    // Project create/update fields
    { displayName: 'Name', name: 'name', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['project'], operation: ['create'] } } },
    {
      displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['project'], operation: ['create'] } },
      options: [
        { displayName: 'Description', name: 'description', type: 'string', default: '' },
        { displayName: 'Is Public', name: 'isPublic', type: 'boolean', default: false },
        { displayName: 'PR Deploys', name: 'prDeploys', type: 'boolean', default: true },
        { displayName: 'Team ID', name: 'teamId', type: 'string', default: '' },
        { displayName: 'Default Environment Name', name: 'defaultEnvironmentName', type: 'string', default: 'production' },
      ],
    },
    {
      displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['project'], operation: ['update'] } },
      options: [
        { displayName: 'Name', name: 'name', type: 'string', default: '' },
        { displayName: 'Description', name: 'description', type: 'string', default: '' },
        { displayName: 'Is Public', name: 'isPublic', type: 'boolean', default: false },
        { displayName: 'PR Deploys', name: 'prDeploys', type: 'boolean', default: true },
      ],
    },
    // Service fields
    {
      displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['service'], operation: ['create'] } },
      options: [
        { displayName: 'Name', name: 'name', type: 'string', default: '' },
        { displayName: 'Source Type', name: 'sourceType', type: 'options', options: [{ name: 'Docker Image', value: 'image' }, { name: 'GitHub Repository', value: 'repo' }], default: 'repo' },
        { displayName: 'Docker Image', name: 'image', type: 'string', default: '' },
        { displayName: 'Repository', name: 'repo', type: 'string', default: '' },
        { displayName: 'Branch', name: 'branch', type: 'string', default: 'main' },
      ],
    },
    {
      displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['service'], operation: ['update'] } },
      options: [
        { displayName: 'Name', name: 'name', type: 'string', default: '' },
        { displayName: 'Icon', name: 'icon', type: 'string', default: '' },
      ],
    },
    {
      displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['service'], operation: ['updateInstance'] } },
      options: [
        { displayName: 'Build Command', name: 'buildCommand', type: 'string', default: '' },
        { displayName: 'Start Command', name: 'startCommand', type: 'string', default: '' },
        { displayName: 'Root Directory', name: 'rootDirectory', type: 'string', default: '' },
        { displayName: 'Healthcheck Path', name: 'healthcheckPath', type: 'string', default: '' },
        { displayName: 'Sleep Application', name: 'sleepApplication', type: 'boolean', default: false },
        { displayName: 'Number of Replicas', name: 'numReplicas', type: 'number', default: 1 },
        { displayName: 'Region', name: 'region', type: 'options', options: getRegionOptions(), default: 'us-west1' },
        { displayName: 'Watch Patterns', name: 'watchPatterns', type: 'string', default: '' },
      ],
    },
    { displayName: 'Repository', name: 'repo', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['service'], operation: ['connect'] } } },
    { displayName: 'Branch', name: 'branch', type: 'string', default: '', displayOptions: { show: { resource: ['service'], operation: ['connect'] } } },
    // Deployment filters
    {
      displayName: 'Filters', name: 'filters', type: 'collection', placeholder: 'Add Filter', default: {},
      displayOptions: { show: { resource: ['deployment'], operation: ['getAll'] } },
      options: [
        { displayName: 'Project ID', name: 'projectId', type: 'string', default: '' },
        { displayName: 'Service ID', name: 'serviceId', type: 'string', default: '' },
        { displayName: 'Environment ID', name: 'environmentId', type: 'string', default: '' },
        { displayName: 'Status', name: 'status', type: 'options', options: getDeploymentStatusOptions(), default: '' },
      ],
    },
    // Environment fields
    { displayName: 'Name', name: 'name', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['environment'], operation: ['create', 'duplicate'] } } },
    {
      displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['environment'], operation: ['create', 'duplicate'] } },
      options: [{ displayName: 'Is Ephemeral', name: 'isEphemeral', type: 'boolean', default: false }],
    },
    {
      displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['environment'], operation: ['update'] } },
      options: [{ displayName: 'Name', name: 'name', type: 'string', default: '' }],
    },
    // Variable fields
    { displayName: 'Variable Name', name: 'name', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['variable'], operation: ['create', 'get', 'update', 'delete'] } } },
    { displayName: 'Value', name: 'value', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['variable'], operation: ['create', 'update'] } } },
    { displayName: 'Service ID (Optional)', name: 'serviceId', type: 'string', default: '', displayOptions: { show: { resource: ['variable'] } } },
    { displayName: 'Variables (JSON)', name: 'variables', type: 'string', typeOptions: { rows: 5 }, default: '{}', required: true, displayOptions: { show: { resource: ['variable'], operation: ['bulkUpsert'] } } },
    { displayName: 'Source Environment', name: 'sourceEnvironmentId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['variable'], operation: ['copyToEnvironment'] } } },
    { displayName: 'Target Environment', name: 'targetEnvironmentId', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['variable'], operation: ['copyToEnvironment'] } } },
    // Volume fields
    { displayName: 'Mount Path', name: 'mountPath', type: 'string', default: '/data', required: true, displayOptions: { show: { resource: ['volume'], operation: ['create', 'attach'] } } },
    {
      displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['volume'], operation: ['create'] } },
      options: [
        { displayName: 'Name', name: 'name', type: 'string', default: '' },
        { displayName: 'Service ID', name: 'serviceId', type: 'string', default: '' },
      ],
    },
    {
      displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['volume'], operation: ['update'] } },
      options: [{ displayName: 'Name', name: 'name', type: 'string', default: '' }],
    },
    // Domain fields
    { displayName: 'Domain Type', name: 'domainType', type: 'options', options: [{ name: 'Custom Domain', value: 'custom' }, { name: 'Railway Subdomain', value: 'railway' }], default: 'railway', required: true, displayOptions: { show: { resource: ['domain'], operation: ['create'] } } },
    { displayName: 'Domain', name: 'domain', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['domain'], operation: ['create'], domainType: ['custom'] } } },
    {
      displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['domain'], operation: ['create'] } },
      options: [{ displayName: 'Target Port', name: 'targetPort', type: 'number', default: 80 }],
    },
    // TCP Proxy fields
    { displayName: 'Application Port', name: 'applicationPort', type: 'number', default: 5432, required: true, displayOptions: { show: { resource: ['tcpProxy'], operation: ['create'] } } },
    // Plugin fields
    { displayName: 'Plugin Type', name: 'pluginType', type: 'options', options: getPluginTypeOptions(), default: 'postgresql', required: true, displayOptions: { show: { resource: ['plugin'], operation: ['create'] } } },
    {
      displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['plugin'], operation: ['create'] } },
      options: [{ displayName: 'Friendly Name', name: 'friendlyName', type: 'string', default: '' }],
    },
    // Team fields
    { displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true, displayOptions: { show: { resource: ['team'], operation: ['inviteMember'] } } },
    { displayName: 'Role', name: 'role', type: 'options', options: getTeamRoleOptions(), default: 'MEMBER', displayOptions: { show: { resource: ['team'], operation: ['inviteMember', 'updateMemberRole'] } } },
    { displayName: 'Role', name: 'role', type: 'options', options: getProjectRoleOptions(), default: 'MEMBER', displayOptions: { show: { resource: ['project'], operation: ['addMember'] } } },
    {
      displayName: 'Update Fields', name: 'updateFields', type: 'collection', placeholder: 'Add Field', default: {},
      displayOptions: { show: { resource: ['team'], operation: ['update'] } },
      options: [
        { displayName: 'Name', name: 'name', type: 'string', default: '' },
        { displayName: 'Avatar URL', name: 'avatar', type: 'string', default: '' },
      ],
    },
    // Usage fields
    { displayName: 'Scope', name: 'scope', type: 'options', options: [{ name: 'Project', value: 'project' }, { name: 'Team', value: 'team' }], default: 'project', displayOptions: { show: { resource: ['usage'], operation: ['getEstimatedBill'] } } },
    { displayName: 'Start Date', name: 'startDate', type: 'dateTime', default: '', required: true, displayOptions: { show: { resource: ['usage'], operation: ['getProjectUsage', 'getTeamUsage'] } } },
    { displayName: 'End Date', name: 'endDate', type: 'dateTime', default: '', required: true, displayOptions: { show: { resource: ['usage'], operation: ['getProjectUsage', 'getTeamUsage'] } } },
    // Webhook fields
    { displayName: 'Webhook URL', name: 'url', type: 'string', default: '', required: true, displayOptions: { show: { resource: ['webhook'], operation: ['create'] } } },
    // Pagination
    { displayName: 'Return All', name: 'returnAll', type: 'boolean', default: false, displayOptions: { show: { operation: ['getAll', 'getMembers'] } } },
    { displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 1, maxValue: 100 }, default: 50, displayOptions: { show: { operation: ['getAll', 'getMembers'], returnAll: [false] } } },
  ],
};
