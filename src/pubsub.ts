import { EventEmitter } from 'events';
import { PubSubEngine } from './pubsub-engine';

export interface PubSubOptions {
  eventEmitter?: EventEmitter;
}

export class PubSub<
  Events extends { [event: string]: unknown } = Record<string, never>
> extends PubSubEngine {
  protected ee: EventEmitter;
  private subscriptions: { [key: string]: [string, (...args: any[]) => void] };
  private subIdCounter: number;

  constructor(options: PubSubOptions = {}) {
    super();
    this.ee = options.eventEmitter || new EventEmitter();
    this.subscriptions = {};
    this.subIdCounter = 0;
  }

  public publish<K extends keyof Events>(
    triggerName: K & string,
    payload: Events[K] extends never ? any : Events[K]
  ): Promise<void> {
    this.ee.emit(triggerName, payload);
    return Promise.resolve();
  }

  public subscribe<K extends keyof Events>(
    triggerName: K & string,
    onMessage: (...args: any[]) => void
  ): Promise<number> {
    this.ee.addListener(triggerName, onMessage);
    this.subIdCounter = this.subIdCounter + 1;
    this.subscriptions[this.subIdCounter] = [triggerName, onMessage];

    return Promise.resolve(this.subIdCounter);
  }

  public unsubscribe(subId: number) {
    const [triggerName, onMessage] = this.subscriptions[subId];
    delete this.subscriptions[subId];
    this.ee.removeListener(triggerName, onMessage);
  }
}
