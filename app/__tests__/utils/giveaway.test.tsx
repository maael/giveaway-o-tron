import { defaultSettings } from '../../src/utils/misc'
import { getChatGiveaway } from '../../src/utils/giveaways'
import { mockChatItem } from '../jest-utils'

const TEST_SETTINGS = {
  ...defaultSettings,
  followersOnly: false,
}

describe('Giveaway', () => {
  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not break when winner has messages after match', async () => {
    const chatItems = [
      mockChatItem('Test.1234', 'user-1', 'User1'),
      mockChatItem('Example Message', 'user-1', 'User1'),
      mockChatItem('Test.5678', 'user-2', 'User2'),
      mockChatItem('Example Message', 'user-2', 'User2'),
    ]
    const result = await getChatGiveaway({} as any, {}, chatItems, '$gw2_account$', TEST_SETTINGS, {}, [])
    expect(result.winners).toHaveLength(1)
    expect(result.winners[0].login).toBe('user-1')
    expect(result.winners[0].otherUsersWithEntry).toHaveLength(0)
  })

  it('should handle when winner only has match', async () => {
    const chatItems = [
      mockChatItem('Test.1234', 'user-3', 'User3'),
      mockChatItem('Test.5678', 'user-4', 'User4'),
      mockChatItem('Example Message', 'user-4', 'User4'),
    ]
    const result = await getChatGiveaway({} as any, {}, chatItems, '$gw2_account$', TEST_SETTINGS, {}, [])
    expect(result.winners).toHaveLength(1)
    expect(result.winners[0].login).toBe('user-3')
    expect(result.winners[0].otherUsersWithEntry).toHaveLength(0)
  })
})
