import { useEffect, useCallback } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import {
  ProcessErrorHandler,
  ProcessEventsHandler,
  ReceivedEventData,
} from '@azure/event-hubs'
import subscribeEventHubConsumer from '../utils/subscribeEventHubConsumer'
import eventsAtom from '../state/eventsAtom'
import connectionAtom from '../state/connectionAtom'
import eventAtom from '../state/eventAtom'

const useSubscribeEventhub = () => {
  const setEvents = useSetRecoilState(eventsAtom)
  const setEvent = useSetRecoilState(eventAtom)
  const setConnection = useSetRecoilState(connectionAtom)
  const { config: connectionConfig } = useRecoilValue(connectionAtom)

  const processEvent: ProcessEventsHandler = useCallback(
    async (events: ReceivedEventData[]) => {
      setEvents(current => {
        return [...current, ...events]
      })
    },
    [setEvents]
  )

  const processError: ProcessErrorHandler = useCallback(async error => {
    // console.log(error)
  }, [])

  useEffect(() => {
    let closeConnection: () => void

    setEvents([])

    setEvent(null)

    setConnection(current => ({
      ...current,
      state: {
        isConnected: false,
        isConnecting: true,
        isError: false,
        error: '',
      },
    }))

    subscribeEventHubConsumer(connectionConfig, processEvent, processError)
      .then(closeConnection_ => {
        closeConnection = closeConnection_
        setConnection(current => ({
          ...current,
          state: {
            isConnected: true,
            isConnecting: false,
            isError: false,
            error: '',
          },
        }))
      })
      .catch(err => {
        setConnection(current => ({
          ...current,
          state: {
            isConnected: false,
            isConnecting: false,
            isError: true,
            error: err.toString(),
          },
        }))
      })

    return () => {
      closeConnection && closeConnection()
    }
  }, [
    connectionConfig,
    processError,
    processEvent,
    setConnection,
    setEvent,
    setEvents,
  ])
}

export default useSubscribeEventhub
