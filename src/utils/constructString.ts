import { ReceivedEventData } from '@azure/event-hubs'

type o = {
  [key: string]: unknown
}

const constructString = (s: string, object: ReceivedEventData) => {
  try {
    const c = s.split('+').map((a: string) => {
      if (/[a-b.]/gi.test(a)) {
        return getPropFromObject(a, object)
      } else {
        return a.replace(/"/g, '')
      }
    })
    return c
  } catch (e) {
    return object.sequenceNumber
  }
}

const getPropFromObject = (chain: string, object: ReceivedEventData) => {
  const prop = chain
    .replace(/\s/g, '')
    .split('.')
    .reduce((acc: o, cur: string) => {
      return acc[cur]
    }, object)

  if (prop === undefined) throw new Error()

  if (prop instanceof Object) throw new Error()

  return String(prop)
}

export default constructString
