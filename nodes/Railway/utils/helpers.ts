/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodePropertyOptions } from 'n8n-workflow';

/**
 * Format deployment status for display
 */
export function formatDeploymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    BUILDING: '🔨 Building',
    DEPLOYING: '🚀 Deploying',
    SUCCESS: '✅ Success',
    FAILED: '❌ Failed',
    CRASHED: '💥 Crashed',
    REMOVED: '🗑️ Removed',
    REMOVING: '🗑️ Removing',
    CANCELLED: '⏹️ Cancelled',
    CANCELLING: '⏹️ Cancelling',
    SLEEPING: '😴 Sleeping',
    SKIPPED: '⏭️ Skipped',
    WAITING: '⏳ Waiting',
    QUEUED: '📋 Queued',
    INITIALIZING: '🔄 Initializing',
    NEEDS_APPROVAL: '⏸️ Needs Approval',
  };
  return statusMap[status] || status;
}

/**
 * Get deployment status options for filters
 */
export function getDeploymentStatusOptions(): INodePropertyOptions[] {
  return [
    { name: 'Building', value: 'BUILDING' },
    { name: 'Deploying', value: 'DEPLOYING' },
    { name: 'Success', value: 'SUCCESS' },
    { name: 'Failed', value: 'FAILED' },
    { name: 'Crashed', value: 'CRASHED' },
    { name: 'Removed', value: 'REMOVED' },
    { name: 'Removing', value: 'REMOVING' },
    { name: 'Cancelled', value: 'CANCELLED' },
    { name: 'Cancelling', value: 'CANCELLING' },
    { name: 'Sleeping', value: 'SLEEPING' },
    { name: 'Skipped', value: 'SKIPPED' },
    { name: 'Waiting', value: 'WAITING' },
    { name: 'Queued', value: 'QUEUED' },
    { name: 'Initializing', value: 'INITIALIZING' },
    { name: 'Needs Approval', value: 'NEEDS_APPROVAL' },
  ];
}

/**
 * Get plugin type options
 */
export function getPluginTypeOptions(): INodePropertyOptions[] {
  return [
    { name: 'PostgreSQL', value: 'postgresql' },
    { name: 'MySQL', value: 'mysql' },
    { name: 'Redis', value: 'redis' },
    { name: 'MongoDB', value: 'mongodb' },
  ];
}

/**
 * Get team role options
 */
export function getTeamRoleOptions(): INodePropertyOptions[] {
  return [
    { name: 'Admin', value: 'ADMIN' },
    { name: 'Member', value: 'MEMBER' },
  ];
}

/**
 * Get project role options
 */
export function getProjectRoleOptions(): INodePropertyOptions[] {
  return [
    { name: 'Admin', value: 'ADMIN' },
    { name: 'Member', value: 'MEMBER' },
    { name: 'Viewer', value: 'VIEWER' },
  ];
}

/**
 * Get region options
 */
export function getRegionOptions(): INodePropertyOptions[] {
  return [
    { name: 'US West 1', value: 'us-west1' },
    { name: 'US West 2', value: 'us-west2' },
    { name: 'US East 4', value: 'us-east4' },
    { name: 'Europe West 1', value: 'europe-west1' },
    { name: 'Asia Southeast 1', value: 'asia-southeast1' },
  ];
}

/**
 * Build filter object from n8n parameters
 */
export function buildFilterObject(
  filters: IDataObject | undefined,
  allowedKeys: string[],
): IDataObject {
  if (!filters) {
    return {};
  }

  const result: IDataObject = {};
  for (const key of allowedKeys) {
    if (filters[key] !== undefined && filters[key] !== '') {
      result[key] = filters[key];
    }
  }
  return result;
}

/**
 * Clean empty values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value as IDataObject);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Parse comma-separated string to array
 */
export function parseArrayString(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date to locale string
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Get webhook event options
 */
export function getWebhookEventOptions(): INodePropertyOptions[] {
  return [
    { name: 'Deploy Started', value: 'DEPLOY_STARTED' },
    { name: 'Deploy Completed', value: 'DEPLOY_COMPLETED' },
    { name: 'Deploy Failed', value: 'DEPLOY_FAILED' },
    { name: 'Deploy Crashed', value: 'DEPLOY_CRASHED' },
    { name: 'Service Created', value: 'SERVICE_CREATED' },
    { name: 'Service Deleted', value: 'SERVICE_DELETED' },
    { name: 'Volume Created', value: 'VOLUME_CREATED' },
    { name: 'Volume Deleted', value: 'VOLUME_DELETED' },
  ];
}

/**
 * Validate Railway ID format (UUID-like)
 */
export function isValidRailwayId(id: string): boolean {
  // Railway IDs are typically UUID format or similar alphanumeric strings
  return /^[a-f0-9-]{36}$/.test(id) || /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Truncate string for display
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Build update input from optional parameters
 */
export function buildUpdateInput(
  params: IDataObject,
  allowedFields: string[],
): IDataObject {
  const input: IDataObject = {};
  
  for (const field of allowedFields) {
    if (params[field] !== undefined && params[field] !== '') {
      input[field] = params[field];
    }
  }
  
  return input;
}

/**
 * Extract connection items from GraphQL response
 */
export function extractConnectionItems(
  connection: IDataObject | undefined,
): IDataObject[] {
  if (!connection) {
    return [];
  }
  
  const edges = connection.edges as Array<{ node: IDataObject }> | undefined;
  if (!edges) {
    return [];
  }
  
  return edges.map((edge) => edge.node).filter((node) => node !== null);
}
