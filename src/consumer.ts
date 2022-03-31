import { getSubscriptionName } from '@/helpers'
import { Event, getClient } from '@/index'

import {
    Message,
    CreateSubscriptionOptions,
    SubscriberOptions,
} from '@google-cloud/pubsub'

/**
 * Run worker for consumer.
 * This uses {@link createSubscriber} to create both subscription as well as the subscriber worker.
 *
 * - `createSubscriptionOptions` will be passed to createSubscription method
 * - `subscriberOptions` will be passed to the subscriber worker
 */
export async function runConsumer({
    createSubscriptionOptions,
    subscriberOptions,
}: {
    createSubscriptionOptions?: CreateSubscriptionOptions
    subscriberOptions?: SubscriberOptions
} = {}) {
    const subscriptions: Record<string, string> = {}

    for (const topic in Event.events) {
        subscriptions[topic] = getSubscriptionName(topic)
    }

    for (const [topic, subscription] of Object.entries(subscriptions)) {
        await createSubscriber({
            subscriptionName: subscription,
            topicName: topic,
            createSubscriptionOptions,
            subscriberOptions,
        })
    }
}

/**
 * Creates both a new subscription & subscriber worker for given topic & subscription
 */
export async function createSubscriber({
    subscriptionName,
    topicName,
    createSubscriptionOptions,
    subscriberOptions,
}: {
    subscriptionName: string
    topicName: string
    createSubscriptionOptions?: CreateSubscriptionOptions
    subscriberOptions?: SubscriberOptions
}) {
    const client = getClient()

    await client
        .topic(topicName)
        .createSubscription(subscriptionName, createSubscriptionOptions)
        .catch((err) => {
            if (err.code === 6) {
                // subscription already exists and this error can be safely ignored
                return
            }

            throw err
        })

    const subscription = client.subscription(
        subscriptionName,
        subscriberOptions
    )

    subscription.on('message', async (message: Message) => {
        const { event: eventName } = message.attributes

        if (!eventName) {
            console.warn('Received message with no event')

            return message.ack()
        } else if (
            !Event.events[topicName] ||
            !Event.events[topicName][eventName]
        ) {
            console.warn(
                `Event ${eventName} not registered for topic ${topicName}`
            )

            return message.ack()
        }

        const event = Event.events[topicName][eventName]

        const attributes: any = message.attributes

        await event.consume({
            message,
            data: JSON.parse(message.data.toString('utf-8')),
            attributes,
        })

        message.ack()
    })

    console.log(
        `Created subscription ${subscriptionName} for ${topicName} topic`
    )
}
