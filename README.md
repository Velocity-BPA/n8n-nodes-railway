# n8n-nodes-railway

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Railway's GraphQL API, enabling full programmatic management of projects, services, deployments, environments, variables, volumes, and team resources.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Railway](https://img.shields.io/badge/Railway-API-purple)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **12 Resource Categories** with 60+ operations
- **Full CRUD Support** for all Railway resources
- **GraphQL API Integration** with cursor-based pagination
- **Multiple Authentication Types** (Personal, Team, Project tokens)
- **Webhook Trigger Node** for real-time event handling
- **Dynamic Resource Loading** with searchable dropdowns
- **Comprehensive Error Handling** with retry support

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings > Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-railway`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-railway

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-railway.git
cd n8n-nodes-railway

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-railway

# Restart n8n
```

## Credentials Setup

Railway supports three types of API tokens:

| Token Type | Header | Scope | How to Create |
|------------|--------|-------|---------------|
| Personal | `Authorization: Bearer <token>` | All personal resources | Account Settings > Tokens |
| Team | `Team-Access-Token: <token>` | All team resources | Team Settings > Tokens |
| Project | `Project-Access-Token: <token>` | Single project/environment | Project Settings > Tokens |

### Creating a Personal Token

1. Go to [Railway Dashboard](https://railway.app/account/tokens)
2. Click **Create Token**
3. Give it a descriptive name
4. Copy the token (shown only once)

### Configuring in n8n

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for **Railway API**
4. Select your token type
5. Paste your API token
6. Click **Save**

## Resources & Operations

### Project

| Operation | Description |
|-----------|-------------|
| Create | Create a new project |
| Get | Get project details |
| Get Many | List all projects |
| Update | Update project settings |
| Delete | Delete a project |
| Transfer | Transfer project to team |
| Get Members | List project members |
| Add Member | Add member to project |
| Remove Member | Remove member from project |

### Service

| Operation | Description |
|-----------|-------------|
| Create | Create a new service |
| Get | Get service details |
| Get Many | List all services in project |
| Update | Update service settings |
| Delete | Delete a service |
| Update Instance | Update service instance settings |
| Redeploy | Trigger redeployment |
| Connect | Connect to GitHub repo |
| Disconnect | Disconnect from source |
| Get Instance | Get service instance details |

### Deployment

| Operation | Description |
|-----------|-------------|
| Get | Get deployment details |
| Get Many | List deployments |
| Cancel | Cancel running deployment |
| Rollback | Rollback to previous deployment |
| Redeploy | Create new deployment from existing |
| Restart | Restart deployment |
| Get Logs | Get deployment logs |
| Get Build Logs | Get build logs |

### Environment

| Operation | Description |
|-----------|-------------|
| Create | Create a new environment |
| Get | Get environment details |
| Get Many | List environments in project |
| Update | Update environment settings |
| Delete | Delete an environment |
| Duplicate | Duplicate environment with all variables |

### Variable

| Operation | Description |
|-----------|-------------|
| Create | Create a variable |
| Get | Get variable value |
| Get Many | List all variables |
| Update | Update a variable |
| Delete | Delete a variable |
| Bulk Upsert | Create/update multiple variables |
| Copy to Environment | Copy variables to another environment |

### Volume

| Operation | Description |
|-----------|-------------|
| Create | Create a volume |
| Get | Get volume details |
| Get Many | List volumes in project |
| Update | Update volume settings |
| Delete | Delete a volume |
| Attach | Attach volume to service |
| Detach | Detach volume from service |

### Domain

| Operation | Description |
|-----------|-------------|
| Create | Add a custom domain or Railway subdomain |
| Get | Get domain details |
| Get Many | List domains for service |
| Delete | Remove a domain |
| Check Status | Check DNS configuration status |

### TCP Proxy

| Operation | Description |
|-----------|-------------|
| Create | Create a TCP proxy |
| Get | Get TCP proxy details |
| Get Many | List TCP proxies |
| Delete | Delete a TCP proxy |

### Plugin (Database)

| Operation | Description |
|-----------|-------------|
| Create | Create a database plugin (PostgreSQL, MySQL, Redis, MongoDB) |
| Get | Get plugin details |
| Get Many | List plugins in project |
| Delete | Delete a plugin |
| Restart | Restart plugin instance |
| Get Connection String | Get database connection URL |

### Team

| Operation | Description |
|-----------|-------------|
| Get | Get team details |
| Get Many | List all teams |
| Update | Update team settings |
| Get Members | List team members |
| Invite Member | Invite user to team |
| Remove Member | Remove member from team |
| Update Member Role | Change member role |

### Usage

| Operation | Description |
|-----------|-------------|
| Get Project Usage | Get usage metrics for project |
| Get Team Usage | Get usage metrics for team |
| Get Estimated Bill | Get estimated billing |

### Webhook

| Operation | Description |
|-----------|-------------|
| Create | Create a webhook |
| Get | Get webhook details |
| Get Many | List webhooks for project |
| Delete | Delete a webhook |

## Trigger Node

The **Railway Trigger** node listens for webhook events from Railway:

| Event | Description |
|-------|-------------|
| DEPLOY_STARTED | Deployment has started |
| DEPLOY_COMPLETED | Deployment completed successfully |
| DEPLOY_FAILED | Deployment failed |
| DEPLOY_CRASHED | Deployment crashed |
| SERVICE_CREATED | New service created |
| SERVICE_DELETED | Service deleted |
| VOLUME_CREATED | New volume created |
| VOLUME_DELETED | Volume deleted |

### Setting Up Triggers

1. Add a **Railway Trigger** node to your workflow
2. Configure Railway API credentials
3. Enter your Project ID
4. Select the events to listen for
5. Activate the workflow

## Usage Examples

### Deploy on Git Push

```
1. Railway Trigger (DEPLOY_COMPLETED)
2. IF: Check deployment status
3. Slack: Send notification
```

### Environment Variable Sync

```
1. Schedule Trigger (daily)
2. Railway: Get Many Variables (source env)
3. Railway: Bulk Upsert (target env)
```

### Auto-Scale Based on Metrics

```
1. Railway Trigger (DEPLOY_COMPLETED)
2. HTTP Request: Get metrics
3. IF: Check threshold
4. Railway: Update Instance (numReplicas)
```

## Railway Concepts

### Projects
Projects are the top-level organizational unit in Railway. They contain services, environments, and configuration.

### Services
Services are individual applications or databases within a project. Each service can have multiple instances across environments.

### Environments
Environments (e.g., production, staging) provide isolated deployments with their own variables and configurations.

### Deployments
Deployments represent a specific version of a service running in an environment.

### Plugins
Plugins are managed databases (PostgreSQL, MySQL, Redis, MongoDB) provisioned by Railway.

## Error Handling

The node handles Railway-specific errors:

| Error Code | Description | Resolution |
|------------|-------------|------------|
| UNAUTHORIZED | Invalid or missing token | Check credentials |
| NOT_FOUND | Resource doesn't exist | Verify resource ID |
| FORBIDDEN | Insufficient permissions | Check token scope |
| BAD_USER_INPUT | Invalid parameters | Review input values |
| RATE_LIMITED | Too many requests | Wait and retry |

## Security Best Practices

1. **Use Project Tokens** for automated workflows scoped to specific projects
2. **Rotate Tokens Regularly** and revoke unused tokens
3. **Limit Token Scope** to minimum required permissions
4. **Store Credentials Securely** using n8n's credential system
5. **Monitor API Usage** via Railway dashboard

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Watch mode
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-railway/issues)
- **Documentation**: [Railway API Docs](https://docs.railway.app/reference/public-api)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Railway](https://railway.app) for their excellent platform and API
- [n8n](https://n8n.io) for the workflow automation platform
- The open-source community for inspiration and contributions
