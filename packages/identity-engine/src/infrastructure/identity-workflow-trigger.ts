import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { IIdentityEventBus, IdentityEventType, IdentityEvent } from '@forge/identity-types';

interface IWorkflowTriggerService {
  runWorkflows(params: {
    triggerType: string;
    source: string;
    event: string;
    projectId: string;
    identityId: string;
    data: Record<string, unknown>;
  }): Promise<void>;
}

@Injectable()
export class IdentityWorkflowTrigger implements OnModuleInit {
  private readonly logger = new Logger(IdentityWorkflowTrigger.name);
  private eventBus!: IIdentityEventBus;

  constructor(
    @Inject('IIdentityEventBus')
    eventBus: IIdentityEventBus,
    @Inject('IWorkflowTriggerService')
    private readonly workflowTriggerService: IWorkflowTriggerService | null,
  ) {
    this.eventBus = eventBus;
  }

  onModuleInit(): void {
    if (!this.workflowTriggerService) {
      this.logger.warn('IWorkflowTriggerService not provided — identity events will not trigger workflows');
      return;
    }

    const eventTypes: IdentityEventType[] = [
      'identity.created', 'identity.login', 'identity.logout',
      'identity.email_verified', 'identity.phone_verified',
      'identity.password_changed', 'identity.status_changed',
      'wallet.linked', 'wallet.unlinked', 'wallet.verified',
      'session.created', 'session.revoked', 'session.expired',
      'role.assigned', 'role.removed',
      'organization.created', 'organization.joined', 'organization.left',
      'organization.member_added', 'organization.member_removed',
      'organization.member_role_changed',
      'mfa.enabled', 'mfa.disabled', 'mfa.challenge_completed',
      'kyc.submitted', 'kyc.approved', 'kyc.rejected', 'kyc.expired',
    ];

    for (const eventType of eventTypes) {
      this.eventBus.subscribe(eventType, async (event: IdentityEvent) => {
        await this.workflowTriggerService!.runWorkflows({
          triggerType: 'identity_event',
          source: 'identity',
          event: event.type,
          projectId: event.projectId,
          identityId: event.identityId,
          data: {
            identityId: event.identityId,
            eventType: event.type,
            timestamp: event.timestamp,
            ...event.data,
          },
        }).catch(err => {
          this.logger.error(`Workflow trigger failed for ${event.type}: ${err.message}`);
        });
      });
    }

    this.logger.log(`Subscribed to ${eventTypes.length} identity event types for workflow triggers`);
  }
}