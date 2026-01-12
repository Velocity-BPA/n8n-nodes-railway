/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Base types
export interface IRailwayCredentials {
  apiToken: string;
  tokenType: 'personal' | 'team' | 'project';
}

export interface IGraphQLResponse {
  data?: IDataObject;
  errors?: IGraphQLError[];
}

export interface IGraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface IEdge<T> {
  cursor: string;
  node: T;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
}

// Railway Domain Types
export interface IProject {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  prDeploys: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  teamId?: string;
  services?: IConnection<IService>;
  environments?: IConnection<IEnvironment>;
  plugins?: IConnection<IPlugin>;
  volumes?: IConnection<IVolume>;
  webhooks?: IConnection<IWebhook>;
  members?: IConnection<IProjectMember>;
}

export interface IService {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  icon?: string;
  templateThreadSlug?: string;
  deployments?: IConnection<IDeployment>;
  repoTriggers?: IRepoTrigger[];
  serviceInstances?: IConnection<IServiceInstance>;
}

export interface IServiceInstance {
  id: string;
  serviceId: string;
  environmentId: string;
  buildCommand?: string;
  startCommand?: string;
  rootDirectory?: string;
  healthcheckPath?: string;
  sleepApplication?: boolean;
  numReplicas?: number;
  region?: string;
  watchPatterns?: string[];
  source?: IServiceSource;
  domains?: IConnection<IDomain>;
  latestDeployment?: IDeployment;
}

export interface IServiceSource {
  image?: string;
  repo?: string;
  branch?: string;
}

export interface IRepoTrigger {
  id: string;
  repository: string;
  branch: string;
  provider: string;
}

export interface IDeployment {
  id: string;
  serviceId: string;
  environmentId: string;
  projectId: string;
  status: DeploymentStatus;
  createdAt: string;
  updatedAt: string;
  url?: string;
  staticUrl?: string;
  meta?: IDeploymentMeta;
  canRedeploy: boolean;
  canRollback: boolean;
}

export type DeploymentStatus =
  | 'BUILDING'
  | 'DEPLOYING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CRASHED'
  | 'REMOVED'
  | 'REMOVING'
  | 'CANCELLED'
  | 'CANCELLING'
  | 'SLEEPING'
  | 'SKIPPED'
  | 'WAITING'
  | 'QUEUED'
  | 'INITIALIZING'
  | 'NEEDS_APPROVAL';

export interface IDeploymentMeta {
  image?: string;
  repo?: string;
  branch?: string;
  commitHash?: string;
  commitMessage?: string;
  commitAuthor?: string;
}

export interface IEnvironment {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isEphemeral?: boolean;
  sourceEnvironmentId?: string;
  serviceInstances?: IConnection<IServiceInstance>;
  variables?: IConnection<IVariable>;
  deploymentTriggers?: IConnection<IDeploymentTrigger>;
}

export interface IVariable {
  id: string;
  name: string;
  value: string;
  serviceId?: string;
  environmentId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IVolume {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  volumeInstances?: IConnection<IVolumeInstance>;
}

export interface IVolumeInstance {
  id: string;
  volumeId: string;
  serviceId: string;
  environmentId: string;
  mountPath: string;
  sizeMB: number;
  state?: string;
  currentSizeMB?: number;
}

export interface IDomain {
  id: string;
  domain: string;
  serviceId: string;
  environmentId: string;
  projectId: string;
  targetPort?: number;
  suffix?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ICustomDomain extends IDomain {
  cnameCheck?: ICnameCheck;
}

export interface ICnameCheck {
  status: string;
  message?: string;
  dnsRecords?: IDnsRecord[];
}

export interface IDnsRecord {
  type: string;
  hostName: string;
  requiredValue: string;
  currentValue?: string;
  status: string;
}

export interface ITcpProxy {
  id: string;
  serviceId: string;
  environmentId: string;
  applicationPort: number;
  proxyPort: number;
  domain: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface IPlugin {
  id: string;
  name: string;
  friendlyName: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type PluginType = 'postgresql' | 'mysql' | 'redis' | 'mongodb';

export interface ITeam {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  projects?: IConnection<IProject>;
  members?: IConnection<ITeamMember>;
}

export interface ITeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: string;
  updatedAt: string;
  user?: IUser;
}

export type TeamRole = 'ADMIN' | 'MEMBER';

export interface IProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  user?: IUser;
}

export type ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWebhook {
  id: string;
  projectId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDeploymentTrigger {
  id: string;
  environmentId: string;
  projectId: string;
  serviceId: string;
  type: string;
  repository?: string;
  branch?: string;
  provider?: string;
}

export interface IUsageItem {
  resourceType: string;
  resourceId: string;
  quantity: number;
  totalCost: number;
  startDate: string;
  endDate: string;
}

export interface IEstimatedBill {
  total: number;
  items: IUsageItem[];
}

// Input types
export interface IProjectCreateInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  prDeploys?: boolean;
  teamId?: string;
  defaultEnvironmentName?: string;
}

export interface IProjectUpdateInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  prDeploys?: boolean;
}

export interface IServiceCreateInput {
  projectId: string;
  name?: string;
  source?: IServiceSourceInput;
  variables?: Record<string, string>;
}

export interface IServiceSourceInput {
  image?: string;
  repo?: string;
  branch?: string;
}

export interface IServiceUpdateInput {
  name?: string;
  icon?: string;
}

export interface IServiceInstanceUpdateInput {
  buildCommand?: string;
  startCommand?: string;
  rootDirectory?: string;
  healthcheckPath?: string;
  sleepApplication?: boolean;
  numReplicas?: number;
  region?: string;
  watchPatterns?: string[];
  source?: IServiceSourceInput;
}

export interface IEnvironmentCreateInput {
  projectId: string;
  name: string;
  isEphemeral?: boolean;
}

export interface IEnvironmentUpdateInput {
  name?: string;
}

export interface IVariableUpsertInput {
  projectId: string;
  environmentId: string;
  serviceId?: string;
  name: string;
  value: string;
}

export interface IVolumeCreateInput {
  projectId: string;
  environmentId: string;
  serviceId?: string;
  name?: string;
  mountPath: string;
}

export interface IVolumeUpdateInput {
  name?: string;
}

export interface IDomainCreateInput {
  serviceId: string;
  environmentId: string;
  domain?: string;
  targetPort?: number;
}

export interface ITcpProxyCreateInput {
  serviceId: string;
  environmentId: string;
  applicationPort: number;
}

export interface IWebhookCreateInput {
  projectId: string;
  url: string;
}

export interface ITeamUpdateInput {
  name?: string;
  avatar?: string;
}

export interface IInviteMemberInput {
  email: string;
  role?: TeamRole;
}

// Resource types for n8n
export type RailwayResource =
  | 'project'
  | 'service'
  | 'deployment'
  | 'environment'
  | 'variable'
  | 'volume'
  | 'domain'
  | 'tcpProxy'
  | 'plugin'
  | 'team'
  | 'usage'
  | 'webhook';

// Webhook event types
export type WebhookEvent =
  | 'DEPLOY_STARTED'
  | 'DEPLOY_COMPLETED'
  | 'DEPLOY_FAILED'
  | 'DEPLOY_CRASHED'
  | 'SERVICE_CREATED'
  | 'SERVICE_DELETED'
  | 'VOLUME_CREATED'
  | 'VOLUME_DELETED';

export interface IWebhookPayload {
  type: WebhookEvent;
  timestamp: string;
  project?: Partial<IProject>;
  environment?: Partial<IEnvironment>;
  service?: Partial<IService>;
  deployment?: Partial<IDeployment>;
  volume?: Partial<IVolume>;
  meta?: IDataObject;
}
