import { config } from '@/index'

import { PubSub } from '@google-cloud/pubsub'

/**
 * Keeps reference of pubsub client so that multiple clients are not generated
 */
let client: PubSub

/**
 * Get {@link PubSub} client instance.
 */
export function getClient() {
    if (!client) {
        client = new PubSub({
            projectId: config.get('projectId'),
        })
    }

    return client
}
