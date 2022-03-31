import { PubSubException } from '@/index'

/**
 * Config for pub-sub events
 */
export type PubSubConfig = {
    projectId?: string
    defaultTopic?: string
    /**
     * You can provide either a constant string for subscription name
     * or a function which will generate a subscription name.
     *
     * @example
     * function (topic:string) {
     *     return `${topic}-subscription`
     * }
     */
    subscription: string | ((topic: string) => string)
}

let config: PubSubConfig

/**
 * Get a configuration value.
 * @throws {@link PubSubException} when trying to access values before initialization
 */
export function get<Property extends keyof PubSubConfig>(
    property: Property
): PubSubConfig[Property] {
    if (!config) {
        throw new PubSubException('PubSub has not been initialized yet!')
    }

    return config[property]
}

/**
 * Set a configuration value.
 * @throws {@link PubSubException} when trying to access values before initialization
 */
export function set<Property extends keyof PubSubConfig>(
    property: Property,
    value: PubSubConfig[Property]
) {
    if (!config) {
        throw new PubSubException('PubSub has not been initialized yet!')
    }

    config[property] = value
}

/**
 * Initialize pub-sub.
 */
export function init(conf: PubSubConfig) {
    config = {
        ...conf,
    }

    if (!config.subscription) {
        throw new PubSubException(
            'Subscription is required in order to use pub-sub'
        )
    }
}
