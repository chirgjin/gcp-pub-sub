# gcp-pub-sub
Easy to use google's pub sub event system for typescript

# Introduction
This package aims to implement a event based system using Google Cloud Platform's pub/sub system.

## Installation
```bash
# npm
npm i --save gcp-pub-sub @google-cloud/pubsub

# yarn
yarn add gcp-pub-sub @google-cloud/pubsub
```

### Initialization
PubSub needs to be configured before it can be used.
For the authentication part, refer to [google-auth-library](https://www.npmjs.com/package/google-auth-library).

*Make sure this file is loaded before you declare any events*
```ts
import { config } from 'gcp-pub-sub'

config.init({
    subscription: 'my-subscription-name', // this can also be a function to generate subscription name on runtime
    projectId: 'my-gcp-project-id', // this is optional. If not provied then it will be inferred from your credentials
    defaultTopic: 'my-topic', // This topic will be used for all events by default. However, you can also provide a different topic when creating events
})
```

### Creating Events
Events are created using `event` function.
Example:

```ts
import { event } from 'gcp-pub-sub'

export const myEvent = event<{
    someEventData: string
    anotherEventData: string
}>().create('myEvent')
```

### Consuming Events

events.ts
```ts
import { event } from 'gcp-pub-sub'

export const myEvent = event<{
    someEventData: string
    anotherEventData: string
}>().create('myEvent')

myEvent.subscribe((eventData) => {
    console.log(
        `SomeEventData = ${eventData.data.someEventData}, EventName = ${eventData.attributes.event}`
    )
})
```

consumer.ts
```ts
import './events.ts' // to make sure events are loaded in memory
import { runConsumer } from 'gcp-pub-sub'

runConsumer()
```

then execute
```bash
ts-node consumer.ts
```
