/**
 * Exception class used by pub-sub to indicate errors
 */
export class PubSubException extends Error {}

/**
 * Exception which indicates that event handling is done & message
 * can now be acknowledged.
 *
 * This will skip any other callback in the event handling queue
 */
export class AckMessageException extends Error {}
