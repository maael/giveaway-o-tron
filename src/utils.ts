import { ChatItem } from './chat'
import { ControlConfig } from './components/screens/ControlsConfig'

export function getTeamCommandVotes(mode: Settings['mode'], config: ControlConfig[], chatItems: ChatItem[], baron?: string | null) {
  const commands = config.reduce(
    (acc, { command, team }) => ({ ...acc, [team || 'default']: (acc[team || 'default'] || []).concat(command) }),
    {}
  )
  const chatCalculations = chatItems.reduce<{ [k: string]: { [k: string]: number } }>((acc, c) => {
    const team = 'default'
    const matchedCommand = (commands[team] || []).find((cmd) => c.words.some((w) => w === cmd))
    if (!matchedCommand || mode === 'baron' && c.displayName !== baron) return acc
    const existingTeam = acc[team] || {}
    return {
      ...acc,
      [team]: {
        ...existingTeam,
        [matchedCommand]: (existingTeam[matchedCommand] || 0) + 1,
      },
    }
  }, {})
  return chatCalculations
}

export function getMatchedActions(config: ControlConfig[], chatItems: ChatItem[]) {
  const chatCalculations = getTeamCommandVotes('democracy', config, chatItems)
  const teamActionSelections = Object.entries(chatCalculations).reduce<{
    [k: string]: ControlConfig | undefined
  }>((acc, [cmdTeam, commandWeights]) => {
    const selectedCommand = (
      Object.entries(commandWeights)
        .sort(([_a, aWeight], [_b, bWeight]) => aWeight - bWeight)
        .pop() || []
    ).shift()
    const action = config.find(({ team, command }) => command === selectedCommand && (team || 'default') === cmdTeam)
    return {
      ...acc,
      [cmdTeam]: action,
    }
  }, {})
  return teamActionSelections
}

export function translateActionToCommand([team, action]: [string, ControlConfig | undefined]) {
  if (!action) return ''
  const clicks = action.actions
    .filter((a) => a.endsWith('Click'))
    .map((c) => `sendmouse ${c.startsWith('Right') ? 'right' : 'left'} click`)
  const scrolls = action.actions
    .filter((a) => a.startsWith('Scroll'))
    .map((s) => `sendmouse wheel ${s.endsWith('Up') ? 120 : -120}`)
  let keys = action.actions
    .filter((a) => !a.startsWith('Scroll') && !a.endsWith('Click'))
    .map((k) => {
      if (k.startsWith('F')) return k
      if (k.length === 1 && k.match(/^[a-z0-9]$/)) return k
      if (k === 'ArrowLeft') return '0x25'
      if (k === 'ArrowRight') return '0x27'
      if (k === 'ArrowUp') return '0x26'
      if (k === 'ArrowDown') return '0x28'
      const kSafe = k.toLowerCase().replace(' ', '')
      if (kSafe === 'control') return 'ctrl'
      if (kSafe === 'space') return 'spc'
      if (kSafe === 'backspace') return kSafe
      if (kSafe === 'alt') return kSafe
      if (kSafe === 'shift') return kSafe
      if (kSafe === 'escape') return 'esc'
      if (kSafe === 'enter') return kSafe
      console.warn('No matching key for', k, kSafe)
      return ''
    })
    .filter(Boolean)
  const keyCombo = keys.length ? `sendkeypress ${keys.join('+')}` : ''
  ;([] as string[])
    .concat(scrolls)
    .concat(clicks)
    .concat([keyCombo])
    .forEach((c) => {
      if (!c) return
      console.info('[send]', c)
      window['myApp'].callScript(c)
    })
  return `[${team}] ${action.name}`
}

export interface Settings {
  waitDuration: number
  autoConnect: boolean
  mode: 'democracy' | 'anarchy' | 'baron'
}

let INSTANCE_ID = 1;

export function setInstance (i: number) {
  if (typeof i === 'number' && !isNaN(i)) {
    INSTANCE_ID = i
    console.info('[instance:set]', i)
  }
}

export function getInstance () {
  return INSTANCE_ID;
}

export function getRandomArrayItem<T> (items: T[]) {
  return items[Math.floor(Math.random()*items.length)];
}
