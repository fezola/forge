import type { PaymentWebhook } from "../types/payments";
import { eventBus } from "./eventBus";

export interface DeliveryResult {
  success: boolean;
  statusCode: number;
  durationMs: number;
  error?: string;
}

export interface DeliveryAttempt {
  webhookId: string;
  event: string;
  attempt: number;
  maxAttempts: number;
  result: DeliveryResult;
  timestamp: number;
}

const MAX_RETRIES = 5;

const RETRY_DELAYS: number[] = [
  0,
  10_000,
  60_000,
  600_000,
  3_600_000,
];

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, payloadData);
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${hex}`;
}

export class WebhookDeliverer {
  private attempts: Map<string, DeliveryAttempt[]> = new Map();
  private activeDeliveries: Set<string> = new Set();
  private onDeliveryComplete?: (webhookId: string, result: DeliveryResult) => void;

  setOnDeliveryComplete(callback: (webhookId: string, result: DeliveryResult) => void): void {
    this.onDeliveryComplete = callback;
  }

  async deliver(
    webhook: PaymentWebhook,
    event: string,
    payload: Record<string, unknown>
  ): Promise<DeliveryResult> {
    const deliveryKey = `${webhook.id}:${event}`;
    const startTime = Date.now();

    if (this.activeDeliveries.has(deliveryKey)) {
      return { success: false, statusCode: 0, durationMs: 0, error: "Already delivering" };
    }

    this.activeDeliveries.add(deliveryKey);

    try {
      const body = JSON.stringify({
        event,
        data: payload,
        timestamp: new Date().toISOString(),
        webhookId: webhook.id,
      });

      const signature = await signPayload(body, webhook.secret);

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Timestamp": new Date().toISOString(),
          "User-Agent": "ForgePayments/1.0",
        },
        body,
      });

      const durationMs = Date.now() - startTime;
      const result: DeliveryResult = {
        success: response.ok,
        statusCode: response.status,
        durationMs,
      };

      this.recordAttempt(webhook.id, event, 1, result);

      if (!response.ok) {
        await this.handleRetry(webhook, event, payload, 2);
      }

      return result;

    } catch (err) {
      const durationMs = Date.now() - startTime;
      const result: DeliveryResult = {
        success: false,
        statusCode: 0,
        durationMs,
        error: err instanceof Error ? err.message : "Delivery failed",
      };

      this.recordAttempt(webhook.id, event, 1, result);

      if (webhook.isActive) {
        this.handleRetry(webhook, event, payload, 2);
      }

      return result;

    } finally {
      this.activeDeliveries.delete(deliveryKey);
    }
  }

  private async handleRetry(
    webhook: PaymentWebhook,
    event: string,
    payload: Record<string, unknown>,
    attempt: number
  ): Promise<void> {
    if (attempt > MAX_RETRIES || !webhook.isActive) return;

    const delay = RETRY_DELAYS[attempt - 1] || 3600000;

    await new Promise((resolve) => setTimeout(resolve, delay));

    const body = JSON.stringify({
      event,
      data: payload,
      timestamp: new Date().toISOString(),
      webhookId: webhook.id,
      isRetry: true,
      attempt,
    });

    try {
      const signature = await signPayload(body, webhook.secret);

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Timestamp": new Date().toISOString(),
          "X-Webhook-Retry": String(attempt),
          "User-Agent": "ForgePayments/1.0",
        },
        body,
      });

      const result: DeliveryResult = {
        success: response.ok,
        statusCode: response.status,
        durationMs: 0,
      };

      this.recordAttempt(webhook.id, event, attempt, result);

      if (!response.ok && attempt < MAX_RETRIES) {
        await this.handleRetry(webhook, event, payload, attempt + 1);
      }

      if (response.ok || attempt >= MAX_RETRIES) {
        eventBus.emit("webhook.delivery.complete", {
          webhookId: webhook.id,
          event,
          success: response.ok,
          attempts: attempt,
        });
      }

    } catch {
      if (attempt < MAX_RETRIES) {
        await this.handleRetry(webhook, event, payload, attempt + 1);
      }
    }
  }

  private recordAttempt(
    webhookId: string,
    event: string,
    attempt: number,
    result: DeliveryResult
  ): void {
    const key = `${webhookId}:${event}`;
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }

    const deliveryAttempt: DeliveryAttempt = {
      webhookId,
      event,
      attempt,
      maxAttempts: MAX_RETRIES,
      result,
      timestamp: Date.now(),
    };

    this.attempts.get(key)!.push(deliveryAttempt);

    this.onDeliveryComplete?.(webhookId, result);
  }

  getAttempts(webhookId: string, event?: string): DeliveryAttempt[] {
    if (event) {
      return this.attempts.get(`${webhookId}:${event}`) || [];
    }

    const results: DeliveryAttempt[] = [];
    for (const [, attempts] of this.attempts) {
      if (attempts[0]?.webhookId === webhookId) {
        results.push(...attempts);
      }
    }
    return results;
  }

  clearAttempts(webhookId?: string): void {
    if (webhookId) {
      for (const [key] of this.attempts) {
        if (key.startsWith(webhookId)) {
          this.attempts.delete(key);
        }
      }
    } else {
      this.attempts.clear();
    }
  }

  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    const expected = await signPayload(payload, secret);
    return expected === signature;
  }
}

export const webhookDeliverer = new WebhookDeliverer();
