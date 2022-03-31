import {
    getClient,
    config,
    globalHooks,
    SubscriptionCallback,
    SubscriptionCallbackArguments,
    AckMessageException,
    PubSubException,
} from '@/index'

import { MessageOptions } from '@google-cloud/pubsub/build/src/topic'
import { Hooks } from '@poppinss/hooks'

/**
 * Class to create custom events.
 */
export class Event<DataType extends Record<any, any>, Name extends string> {
    /**
     * Stores a mapping of all events so that consumer can use them.
     */
    public static events: {
        [topic: string]: {
            [eventName: string]: Event<any, any>
        }
    } = {}

    /**
     * Stores list of callbacks for the event to consume
     */
    public callbacks: SubscriptionCallback<DataType>[] = []
    public topic: string
    public hooks: Hooks

    constructor(public name: Name, topic?: string) {
        let topicName: string | undefined = topic

        if (!topicName) {
            if (config.get('defaultTopic')) {
                topicName = config.get('defaultTopic')!
            } else {
                throw new PubSubException(
                    'Either define default topic or provide topic in constructor when creating event'
                )
            }
        }

        Event.events[topicName] = Event.events[topicName] || {}

        if (Event.events[topicName][this.name]) {
            throw new PubSubException(
                `${this.name} event is already declared for ${topicName} topic!`
            )
        }

        Event.events[topicName][this.name] = this

        this.topic = topicName
        this.hooks = new Hooks()
    }

    /**
     * Publish this event to pub-sub topic
     *
     * - Executes before & after `publish` hook
     */
    public async publish({
        data,
        ...options
    }: Pick<
        MessageOptions,
        'messageId' | 'attributes' | 'orderingKey' | 'publishTime'
    > & {
        data: DataType
    }) {
        const client = getClient()

        options.attributes = {
            ...(options.attributes || {}),
            event: this.name,
            publishedAt: (new Date().getTime() / 1000).toString(),
        }
        const eventOptions = {
            data,
            ...options,
        }

        await globalHooks.exec('before', 'publish', eventOptions)
        await this.hooks.exec('before', 'publish', eventOptions)

        const messageId = await client.topic(this.topic).publishMessage({
            // specifically send event options here so that users can mutate event options using hooks
            // TODO: find a better way for this
            ...eventOptions,
            data: undefined,
            json: eventOptions.data,
        })

        await globalHooks.exec('after', 'publish', {
            eventOptions,
            messageId,
        })
        await this.hooks.exec('after', 'publish', {
            eventOptions,
            messageId,
        })

        return messageId
    }

    /**
     * Register subscriber function for this event
     */
    public async subscribe(callback: SubscriptionCallback<DataType>) {
        this.callbacks.push(callback)
    }

    /**
     * Consume event of this type.
     * Calls every subscriber callback for this event in a loop,
     * if any of them fails then message is not acknowledged.
     *
     * - Executes before & after `consume` hook
     */
    public async consume(args: SubscriptionCallbackArguments<DataType>) {
        await globalHooks.exec('before', 'consume', args)
        await this.hooks.exec('before', 'consume', args)

        for (const callback of this.callbacks) {
            try {
                await callback(args)
            } catch (e) {
                if (e instanceof AckMessageException) {
                    return
                }

                throw e
            }
        }

        await globalHooks.exec('after', 'consume', args)
        await this.hooks.exec('after', 'consume', args)
    }
}

/**
 * Convenient function to declare new events.
 * Breaks the declaration in 2 parts so that `name` is not repeated twice.
 *
 * TODO: find a better solution for this
 */
export function event<DataType extends Record<any, any>>() {
    return {
        create: <Name extends string>(name: Name, topic?: string) => {
            return new Event<DataType, Name>(name, topic)
        },
    }
}
