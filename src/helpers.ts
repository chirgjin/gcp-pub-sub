import { config } from '@/index'

/**
 * Generate subscription name for a given topic.
 *
 * Uses {@link config}'s `subscription` property
 */
export function getSubscriptionName(topic: string) {
    const subscription = config.get('subscription')

    if (typeof subscription === 'string') {
        return subscription
    }

    return subscription(topic)
}
