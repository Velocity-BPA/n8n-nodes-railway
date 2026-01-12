/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Base fragments for reusable query parts
export const FRAGMENTS = {
  pageInfo: `
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  `,
  project: `
    id
    name
    description
    isPublic
    prDeploys
    createdAt
    updatedAt
    teamId
  `,
  service: `
    id
    name
    projectId
    createdAt
    updatedAt
    icon
  `,
  deployment: `
    id
    serviceId
    environmentId
    projectId
    status
    createdAt
    updatedAt
    url
    staticUrl
    canRedeploy
    canRollback
    meta {
      image
      repo
      branch
      commitHash
      commitMessage
      commitAuthor
    }
  `,
  environment: `
    id
    name
    projectId
    createdAt
    updatedAt
    isEphemeral
    sourceEnvironmentId
  `,
  variable: `
    name
    value
    serviceId
    environmentId
  `,
  volume: `
    id
    name
    projectId
    createdAt
    updatedAt
  `,
  volumeInstance: `
    id
    volumeId
    serviceId
    environmentId
    mountPath
    sizeMB
    currentSizeMB
    state
  `,
  domain: `
    id
    domain
    serviceId
    environmentId
    projectId
    targetPort
    createdAt
    updatedAt
  `,
  tcpProxy: `
    id
    serviceId
    environmentId
    applicationPort
    proxyPort
    domain
    createdAt
    updatedAt
  `,
  plugin: `
    id
    name
    friendlyName
    status
    projectId
    createdAt
    updatedAt
  `,
  team: `
    id
    name
    avatar
    createdAt
    updatedAt
  `,
  teamMember: `
    id
    userId
    teamId
    role
    user {
      id
      email
      name
      avatar
    }
  `,
  projectMember: `
    id
    userId
    projectId
    role
    user {
      id
      email
      name
      avatar
    }
  `,
  webhook: `
    id
    projectId
    url
    createdAt
    updatedAt
  `,
  user: `
    id
    email
    name
    avatar
  `,
  serviceInstance: `
    id
    serviceId
    environmentId
    buildCommand
    startCommand
    rootDirectory
    healthcheckPath
    sleepApplication
    numReplicas
    region
    watchPatterns
    source {
      image
      repo
      branch
    }
  `,
};

// Project Queries
export const PROJECT_QUERIES = {
  get: `
    query GetProject($id: String!) {
      project(id: $id) {
        ${FRAGMENTS.project}
      }
    }
  `,
  getAll: `
    query GetProjects($after: String, $first: Int) {
      projects(after: $after, first: $first) {
        edges {
          cursor
          node {
            ${FRAGMENTS.project}
          }
        }
        ${FRAGMENTS.pageInfo}
      }
    }
  `,
  getMembers: `
    query GetProjectMembers($projectId: String!, $after: String, $first: Int) {
      project(id: $projectId) {
        members(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.projectMember}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
};

export const PROJECT_MUTATIONS = {
  create: `
    mutation CreateProject($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        ${FRAGMENTS.project}
      }
    }
  `,
  update: `
    mutation UpdateProject($id: String!, $input: ProjectUpdateInput!) {
      projectUpdate(id: $id, input: $input) {
        ${FRAGMENTS.project}
      }
    }
  `,
  delete: `
    mutation DeleteProject($id: String!) {
      projectDelete(id: $id)
    }
  `,
  transfer: `
    mutation TransferProject($id: String!, $input: ProjectTransferInput!) {
      projectTransferToTeam(id: $id, input: $input) {
        ${FRAGMENTS.project}
      }
    }
  `,
  addMember: `
    mutation AddProjectMember($input: ProjectMemberCreateInput!) {
      projectMemberCreate(input: $input) {
        ${FRAGMENTS.projectMember}
      }
    }
  `,
  removeMember: `
    mutation RemoveProjectMember($input: ProjectMemberRemoveInput!) {
      projectMemberRemove(input: $input)
    }
  `,
};

// Service Queries
export const SERVICE_QUERIES = {
  get: `
    query GetService($id: String!) {
      service(id: $id) {
        ${FRAGMENTS.service}
      }
    }
  `,
  getAll: `
    query GetServices($projectId: String!, $after: String, $first: Int) {
      project(id: $projectId) {
        services(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.service}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
  getInstance: `
    query GetServiceInstance($environmentId: String!, $serviceId: String!) {
      serviceInstance(environmentId: $environmentId, serviceId: $serviceId) {
        ${FRAGMENTS.serviceInstance}
      }
    }
  `,
};

export const SERVICE_MUTATIONS = {
  create: `
    mutation CreateService($input: ServiceCreateInput!) {
      serviceCreate(input: $input) {
        ${FRAGMENTS.service}
      }
    }
  `,
  update: `
    mutation UpdateService($id: String!, $input: ServiceUpdateInput!) {
      serviceUpdate(id: $id, input: $input) {
        ${FRAGMENTS.service}
      }
    }
  `,
  delete: `
    mutation DeleteService($id: String!) {
      serviceDelete(id: $id)
    }
  `,
  updateInstance: `
    mutation UpdateServiceInstance($environmentId: String!, $serviceId: String!, $input: ServiceInstanceUpdateInput!) {
      serviceInstanceUpdate(environmentId: $environmentId, serviceId: $serviceId, input: $input)
    }
  `,
  connect: `
    mutation ConnectServiceRepo($id: String!, $input: ServiceConnectInput!) {
      serviceConnect(id: $id, input: $input) {
        ${FRAGMENTS.service}
      }
    }
  `,
  disconnect: `
    mutation DisconnectServiceRepo($id: String!) {
      serviceDisconnect(id: $id) {
        ${FRAGMENTS.service}
      }
    }
  `,
  redeploy: `
    mutation RedeployService($environmentId: String!, $serviceId: String!) {
      serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
    }
  `,
};

// Deployment Queries
export const DEPLOYMENT_QUERIES = {
  get: `
    query GetDeployment($id: String!) {
      deployment(id: $id) {
        ${FRAGMENTS.deployment}
      }
    }
  `,
  getAll: `
    query GetDeployments($input: DeploymentListInput!, $after: String, $first: Int) {
      deployments(input: $input, after: $after, first: $first) {
        edges {
          cursor
          node {
            ${FRAGMENTS.deployment}
          }
        }
        ${FRAGMENTS.pageInfo}
      }
    }
  `,
  getLogs: `
    query GetDeploymentLogs($deploymentId: String!) {
      deploymentLogs(deploymentId: $deploymentId) {
        message
        timestamp
        severity
      }
    }
  `,
  getBuildLogs: `
    query GetBuildLogs($deploymentId: String!) {
      buildLogs(deploymentId: $deploymentId) {
        message
        timestamp
      }
    }
  `,
};

export const DEPLOYMENT_MUTATIONS = {
  cancel: `
    mutation CancelDeployment($id: String!) {
      deploymentCancel(id: $id)
    }
  `,
  rollback: `
    mutation RollbackDeployment($id: String!) {
      deploymentRollback(id: $id) {
        ${FRAGMENTS.deployment}
      }
    }
  `,
  redeploy: `
    mutation RedeployDeployment($id: String!) {
      deploymentRedeploy(id: $id) {
        ${FRAGMENTS.deployment}
      }
    }
  `,
  restart: `
    mutation RestartDeployment($id: String!) {
      deploymentRestart(id: $id)
    }
  `,
};

// Environment Queries
export const ENVIRONMENT_QUERIES = {
  get: `
    query GetEnvironment($id: String!) {
      environment(id: $id) {
        ${FRAGMENTS.environment}
      }
    }
  `,
  getAll: `
    query GetEnvironments($projectId: String!, $after: String, $first: Int) {
      project(id: $projectId) {
        environments(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.environment}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
};

export const ENVIRONMENT_MUTATIONS = {
  create: `
    mutation CreateEnvironment($input: EnvironmentCreateInput!) {
      environmentCreate(input: $input) {
        ${FRAGMENTS.environment}
      }
    }
  `,
  update: `
    mutation UpdateEnvironment($id: String!, $input: EnvironmentUpdateInput!) {
      environmentUpdate(id: $id, input: $input) {
        ${FRAGMENTS.environment}
      }
    }
  `,
  delete: `
    mutation DeleteEnvironment($id: String!) {
      environmentDelete(id: $id)
    }
  `,
  duplicate: `
    mutation DuplicateEnvironment($id: String!, $input: EnvironmentDuplicateInput!) {
      environmentDuplicate(id: $id, input: $input) {
        ${FRAGMENTS.environment}
      }
    }
  `,
};

// Variable Queries
export const VARIABLE_QUERIES = {
  getAll: `
    query GetVariables($projectId: String!, $environmentId: String!, $serviceId: String) {
      variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
    }
  `,
  get: `
    query GetVariable($projectId: String!, $environmentId: String!, $serviceId: String, $name: String!) {
      variable(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId, name: $name)
    }
  `,
};

export const VARIABLE_MUTATIONS = {
  upsert: `
    mutation UpsertVariable($input: VariableUpsertInput!) {
      variableUpsert(input: $input)
    }
  `,
  delete: `
    mutation DeleteVariable($input: VariableDeleteInput!) {
      variableDelete(input: $input)
    }
  `,
  bulkUpsert: `
    mutation BulkUpsertVariables($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }
  `,
};

// Volume Queries
export const VOLUME_QUERIES = {
  get: `
    query GetVolume($id: String!) {
      volume(id: $id) {
        ${FRAGMENTS.volume}
        volumeInstances {
          edges {
            node {
              ${FRAGMENTS.volumeInstance}
            }
          }
        }
      }
    }
  `,
  getAll: `
    query GetVolumes($projectId: String!, $after: String, $first: Int) {
      project(id: $projectId) {
        volumes(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.volume}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
};

export const VOLUME_MUTATIONS = {
  create: `
    mutation CreateVolume($input: VolumeCreateInput!) {
      volumeCreate(input: $input) {
        ${FRAGMENTS.volume}
      }
    }
  `,
  update: `
    mutation UpdateVolume($id: String!, $input: VolumeUpdateInput!) {
      volumeUpdate(id: $id, input: $input) {
        ${FRAGMENTS.volume}
      }
    }
  `,
  delete: `
    mutation DeleteVolume($id: String!) {
      volumeDelete(id: $id)
    }
  `,
  attach: `
    mutation AttachVolume($volumeId: String!, $input: VolumeInstanceCreateInput!) {
      volumeInstanceCreate(volumeId: $volumeId, input: $input) {
        ${FRAGMENTS.volumeInstance}
      }
    }
  `,
  detach: `
    mutation DetachVolume($id: String!) {
      volumeInstanceDelete(id: $id)
    }
  `,
};

// Domain Queries
export const DOMAIN_QUERIES = {
  get: `
    query GetDomain($id: String!) {
      domain(id: $id) {
        ${FRAGMENTS.domain}
      }
    }
  `,
  getAll: `
    query GetDomains($projectId: String!, $environmentId: String!, $serviceId: String!, $after: String, $first: Int) {
      domains(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId, after: $after, first: $first) {
        edges {
          cursor
          node {
            ${FRAGMENTS.domain}
          }
        }
        ${FRAGMENTS.pageInfo}
      }
    }
  `,
  checkStatus: `
    query CheckDomainStatus($id: String!) {
      customDomain(id: $id) {
        ${FRAGMENTS.domain}
        cnameCheck {
          status
          message
          dnsRecords {
            type
            hostName
            requiredValue
            currentValue
            status
          }
        }
      }
    }
  `,
};

export const DOMAIN_MUTATIONS = {
  create: `
    mutation CreateDomain($input: CustomDomainCreateInput!) {
      customDomainCreate(input: $input) {
        ${FRAGMENTS.domain}
      }
    }
  `,
  createServiceDomain: `
    mutation CreateServiceDomain($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) {
        ${FRAGMENTS.domain}
      }
    }
  `,
  delete: `
    mutation DeleteDomain($id: String!) {
      domainDelete(id: $id)
    }
  `,
};

// TCP Proxy Queries
export const TCP_PROXY_QUERIES = {
  get: `
    query GetTcpProxy($id: String!) {
      tcpProxy(id: $id) {
        ${FRAGMENTS.tcpProxy}
      }
    }
  `,
  getAll: `
    query GetTcpProxies($serviceId: String!, $environmentId: String!, $after: String, $first: Int) {
      tcpProxies(serviceId: $serviceId, environmentId: $environmentId, after: $after, first: $first) {
        edges {
          cursor
          node {
            ${FRAGMENTS.tcpProxy}
          }
        }
        ${FRAGMENTS.pageInfo}
      }
    }
  `,
};

export const TCP_PROXY_MUTATIONS = {
  create: `
    mutation CreateTcpProxy($input: TcpProxyCreateInput!) {
      tcpProxyCreate(input: $input) {
        ${FRAGMENTS.tcpProxy}
      }
    }
  `,
  delete: `
    mutation DeleteTcpProxy($id: String!) {
      tcpProxyDelete(id: $id)
    }
  `,
};

// Plugin Queries
export const PLUGIN_QUERIES = {
  get: `
    query GetPlugin($id: String!) {
      plugin(id: $id) {
        ${FRAGMENTS.plugin}
      }
    }
  `,
  getAll: `
    query GetPlugins($projectId: String!, $after: String, $first: Int) {
      project(id: $projectId) {
        plugins(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.plugin}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
};

export const PLUGIN_MUTATIONS = {
  create: `
    mutation CreatePlugin($input: PluginCreateInput!) {
      pluginCreate(input: $input) {
        ${FRAGMENTS.plugin}
      }
    }
  `,
  delete: `
    mutation DeletePlugin($id: String!) {
      pluginDelete(id: $id)
    }
  `,
  restart: `
    mutation RestartPlugin($id: String!, $environmentId: String!) {
      pluginRestart(id: $id, environmentId: $environmentId)
    }
  `,
};

// Team Queries
export const TEAM_QUERIES = {
  get: `
    query GetTeam($id: String!) {
      team(id: $id) {
        ${FRAGMENTS.team}
      }
    }
  `,
  getAll: `
    query GetTeams {
      teams {
        edges {
          node {
            ${FRAGMENTS.team}
          }
        }
      }
    }
  `,
  getMembers: `
    query GetTeamMembers($teamId: String!, $after: String, $first: Int) {
      team(id: $teamId) {
        members(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.teamMember}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
};

export const TEAM_MUTATIONS = {
  update: `
    mutation UpdateTeam($id: String!, $input: TeamUpdateInput!) {
      teamUpdate(id: $id, input: $input) {
        ${FRAGMENTS.team}
      }
    }
  `,
  inviteMember: `
    mutation InviteTeamMember($id: String!, $input: TeamInviteMemberInput!) {
      teamInviteMember(id: $id, input: $input)
    }
  `,
  removeMember: `
    mutation RemoveTeamMember($teamId: String!, $userId: String!) {
      teamMemberRemove(teamId: $teamId, userId: $userId)
    }
  `,
  updateMemberRole: `
    mutation UpdateTeamMemberRole($teamId: String!, $userId: String!, $role: TeamRole!) {
      teamMemberRoleUpdate(teamId: $teamId, userId: $userId, role: $role)
    }
  `,
};

// Usage Queries
export const USAGE_QUERIES = {
  getProjectUsage: `
    query GetProjectUsage($projectId: String!, $startDate: DateTime!, $endDate: DateTime!) {
      projectUsage(projectId: $projectId, startDate: $startDate, endDate: $endDate) {
        resourceType
        resourceId
        quantity
        totalCost
        startDate
        endDate
      }
    }
  `,
  getTeamUsage: `
    query GetTeamUsage($teamId: String!, $startDate: DateTime!, $endDate: DateTime!) {
      teamUsage(teamId: $teamId, startDate: $startDate, endDate: $endDate) {
        resourceType
        resourceId
        quantity
        totalCost
        startDate
        endDate
      }
    }
  `,
  getEstimatedBill: `
    query GetEstimatedBill($teamId: String, $projectId: String) {
      estimatedBill(teamId: $teamId, projectId: $projectId) {
        total
        items {
          resourceType
          resourceId
          quantity
          totalCost
        }
      }
    }
  `,
};

// Webhook Queries
export const WEBHOOK_QUERIES = {
  get: `
    query GetWebhook($id: String!) {
      webhook(id: $id) {
        ${FRAGMENTS.webhook}
      }
    }
  `,
  getAll: `
    query GetWebhooks($projectId: String!, $after: String, $first: Int) {
      project(id: $projectId) {
        webhooks(after: $after, first: $first) {
          edges {
            cursor
            node {
              ${FRAGMENTS.webhook}
            }
          }
          ${FRAGMENTS.pageInfo}
        }
      }
    }
  `,
};

export const WEBHOOK_MUTATIONS = {
  create: `
    mutation CreateWebhook($input: WebhookCreateInput!) {
      webhookCreate(input: $input) {
        ${FRAGMENTS.webhook}
      }
    }
  `,
  delete: `
    mutation DeleteWebhook($id: String!) {
      webhookDelete(id: $id)
    }
  `,
};

// Me Query (for authentication test)
export const ME_QUERY = `
  query Me {
    me {
      ${FRAGMENTS.user}
    }
  }
`;

// Railway GraphQL API endpoint
export const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2';

// Default pagination size
export const DEFAULT_PAGE_SIZE = 100;

// Rate limit constants
export const RATE_LIMITS = {
  default: { requests: 1, perSeconds: 1 },
  burst: { requests: 3, perSeconds: 1 },
  getMachine: { requests: 5, perSeconds: 1 },
};
