import {useState, useEffect, useCallback, Dispatch, SetStateAction} from 'react'
import { getInstance } from '../../utils';

export default function useStorage<T> (key: string, initialValue: T, onInit?: (value: T) => void): [T, Dispatch<SetStateAction<T>>, boolean] {
  const serialize = JSON.stringify;
  const deserialize = JSON.parse;
  const [state, setState] = useState<T>(initialValue);
  const [syncedState, setSyncedState] = useState<T>(state);
  const [initialised, setInitialised] = useState(false)
  const getKey = useCallback((key: string) => {
    return `${getInstance()}-${key}`
  }, [])
  useEffect(() => {
    const value = state;
    (async () => {
      if (syncedState === value) return
      try {
        console.info('[storage:set]', getKey(key), value)
        await Neutralino.storage.setData(getKey(key), serialize(value))
        setSyncedState(value)
      } catch (e) {
        console.warn('[storage:error]', e);
      }
    })()
  }, [state, getKey]);
  useEffect(() => {
    (async () => {
      let value = initialValue
      try {
        try {
          value = deserialize(await Neutralino.storage.getData(getKey(key)))
        } catch (e) {
          console.warn('[storage:warn]', e);
        }
        setState(value)
        console.info('[storage:loaded]', getKey(key), value)
        try {
          await Neutralino.storage.setData(getKey(key), serialize(value))
        } catch (e) {
          console.warn('[storage:warn]', e);
        }
      } finally {
        if (onInit) onInit(value);
        setInitialised(true)
      }
    })()
  }, [key, getKey])
  return [state, setState, initialised];
}