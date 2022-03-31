import { Message } from '@google-cloud/pubsub'

/**
 * Type of arguments passed to a subscription callback function
 */
export type SubscriptionCallbackArguments<DataType extends Record<any, any>> = {
    data: DataType
    attributes: EventAttributes
    message: Message
}

/**
 * Type of a subscription callback function
 */
export type SubscriptionCallback<DataType extends Record<any, any>> = (
    args: SubscriptionCallbackArguments<DataType>
) => any

/**
 * Attributes provided to every event.
 * You can extend this if you wish to add more attributes
 */
export interface EventAttributes {
    event: string
    publishedAt: string
}
