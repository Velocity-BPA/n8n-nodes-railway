/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  IDataObject,
} from 'n8n-workflow';
import { emitLicenseNotice, railwayGraphQLRequest } from './transport';
import { WEBHOOK_MUTATIONS, WEBHOOK_QUERIES } from './constants/queries';
import { getWebhookEventOptions } from './utils/helpers';

export class RailwayTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Railway Trigger',
    name: 'railwayTrigger',
    icon: 'file:railway.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["events"].join(", ")}}',
    description: 'Starts the workflow when Railway events occur',
    defaults: {
      name: 'Railway Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'railwayApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'string',
        default: '',
        required: true,
        description: 'The Railway project ID to watch for events',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: getWebhookEventOptions(),
        default: ['DEPLOY_COMPLETED'],
        required: true,
        description: 'Events to listen for',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        emitLicenseNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const projectId = this.getNodeParameter('projectId') as string;

        try {
          const response = await railwayGraphQLRequest.call(
            this,
            WEBHOOK_QUERIES.getAll,
            { projectId },
          );

          const project = response.project as IDataObject;
          const webhooks = project.webhooks as IDataObject;
          const edges = (webhooks.edges as Array<{ node: { id: string; url: string } }>) || [];

          // Check if a webhook with our URL already exists
          const existingWebhook = edges.find((edge) => edge.node.url === webhookUrl);

          if (existingWebhook) {
            // Store the webhook ID for later deletion
            const webhookData = this.getWorkflowStaticData('node');
            webhookData.webhookId = existingWebhook.node.id;
            return true;
          }

          return false;
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        emitLicenseNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const projectId = this.getNodeParameter('projectId') as string;

        try {
          const response = await railwayGraphQLRequest.call(
            this,
            WEBHOOK_MUTATIONS.create,
            {
              input: {
                projectId,
                url: webhookUrl,
              },
            },
          );

          const webhook = response.webhookCreate as { id: string };

          if (webhook?.id) {
            const webhookData = this.getWorkflowStaticData('node');
            webhookData.webhookId = webhook.id;
            return true;
          }

          return false;
        } catch {
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        emitLicenseNotice();

        const webhookData = this.getWorkflowStaticData('node');
        const webhookId = webhookData.webhookId as string;

        if (!webhookId) {
          return true;
        }

        try {
          await railwayGraphQLRequest.call(
            this,
            WEBHOOK_MUTATIONS.delete,
            { id: webhookId },
          );

          delete webhookData.webhookId;
          return true;
        } catch {
          return false;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    emitLicenseNotice();

    const bodyData = this.getBodyData() as IDataObject;
    const events = this.getNodeParameter('events') as string[];

    // Extract event type from the payload
    const eventType = bodyData.type as string;

    // Check if this event is one we're listening for
    if (eventType && !events.includes(eventType)) {
      // Not an event we're interested in, acknowledge but don't trigger
      return {
        noWebhookResponse: true,
      };
    }

    // Return the webhook payload
    return {
      workflowData: [
        this.helpers.returnJsonArray([
          {
            event: eventType,
            timestamp: bodyData.timestamp || new Date().toISOString(),
            project: bodyData.project,
            environment: bodyData.environment,
            service: bodyData.service,
            deployment: bodyData.deployment,
            volume: bodyData.volume,
            meta: bodyData.meta,
            rawPayload: bodyData,
          },
        ]),
      ],
    };
  }
}
