import { handleChatCommand } from '../../src/utils/misc'
import { mockChatItem } from '../jest-utils'

const cases = [
  {
    command: 'basic',
    msg: 'this is a basic of commands',
    match: 'basic',
    expected: true,
  },
  {
    command: 'basic',
    msg: 'this is a of commands',
    expected: false,
  },
  {
    command: 'insensitive',
    msg: 'this is test a of INSENSITIVE commands',
    match: 'insensitive',
    expected: true,
  },
  {
    command: '$gw2_account$',
    msg: 'this is test a of Mael.1234 commands',
    match: 'Mael.1234',
    expected: true,
  },
  {
    command: '$gw2_account$',
    msg: 'this is test a of !Mael.1234 commands',
    expected: false,
  },
  {
    command: '$gw2_account$',
    msg: 'this is test a of commands',
    expected: false,
  },
  {
    command: '$steam_friend$',
    msg: 'this is test a 12345678 of commands',
    match: '12345678',
    expected: true,
  },
  {
    command: '$steam_friend$',
    msg: 'this is test a 123456789 of commands',
    expected: false,
  },
  {
    command: '$steam_friend$',
    msg: 'this is test a 1234 of commands',
    expected: false,
  },
  {
    command: '$gw2_or_steam$',
    msg: 'this is test a of Mael.1234 commands',
    match: 'Mael.1234',
    expected: true,
  },
  {
    command: '$steam_friend$',
    msg: 'this is test a 12345678 of commands',
    match: '12345678',
    expected: true,
  },
  {
    command: 'space command',
    msg: 'this is test a space command of commands',
    match: 'space command',
    expected: true,
  },
  {
    command: 'space command',
    msg: 'this is test a spacecommand of commands',
    expected: false,
  },
  {
    command: '$gw2_account$ combined',
    msg: 'this is test a Mael.1234 combined of commands',
    match: 'Mael.1234 combined',
    expected: true,
  },
  {
    command: '$gw2_account$ combined',
    msg: 'this is test a Mael.1234 of commands',
    expected: false,
  },
  {
    command: '$gw2_account$ combined',
    msg: 'this is test a combined of commands',
    expected: false,
  },
  {
    command: '$gw2_account$ combined with .+ regex things',
    msg: 'this is test a Mael.1234 combined with .+ regex things of commands',
    match: 'Mael.1234 combined with .+ regex things',
    expected: true,
  },
  {
    command: '$gw2_account$ combined with CASE INSENSITIVE .+ regex things',
    msg: 'this is test a Mael.1234 combined with case insensitive .+ regex things of commands',
    match: 'Mael.1234 combined with case insensitive .+ regex things',
    expected: true,
  },
  {
    command: '$gw2_account$ combined with .+ regex things',
    msg: 'this is test a Mael.1234 combined with lots of other regex things of commands',
    expected: false,
  },
  {
    command: '$gw2_or_steam_or_paypal$',
    msg: 'this is test a case sensitive Paypal of commands',
    match: 'Paypal',
    expected: true,
  },
  {
    command: '$gw2_or_steam_or_paypal$',
    msg: 'this is test a case sensitive paypal of commands',
    match: 'paypal',
    expected: true,
  },
]

describe('Misc', () => {
  test.each(cases)('handleChatCommand() | $command = $expected', ({ command, msg, expected, match }) => {
    const handled = handleChatCommand(mockChatItem(msg), command)
    expect(handled.isMatch).toBe(expected)
    if (match) {
      expect(handled.match).toBe(match)
    }
  })
})
