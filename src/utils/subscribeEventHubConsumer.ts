import {
  EventHubConsumerClient,
  ProcessErrorHandler,
  ProcessEventsHandler,
} from '@azure/event-hubs'

type TConfigConnection = {
  consumerGroup: string
  connectionString: string
  eventHubName: string
}

const subscribeEventHubConsumer = async (
  configConnection: TConfigConnection,
  processEvents: ProcessEventsHandler,
  processError: ProcessErrorHandler
): Promise<() => void> => {
  const client = new EventHubConsumerClient(
    configConnection.consumerGroup,
    configConnection.connectionString,
    configConnection.eventHubName
  )

  const todayDate = new Date().setHours(0, 0, 0)

  const partitionIds = await client.getPartitionIds()

  const subscription = client.subscribe(
    partitionIds[0],
    {
      processEvents,
      processError,
    },
    {
      startPosition: {
        enqueuedOn: todayDate,
      },
    }
  )

  return async () => {
    await subscription.close()
    await client.close()
  }
}

export default subscribeEventHubConsumer
