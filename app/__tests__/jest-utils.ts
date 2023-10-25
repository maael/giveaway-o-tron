import { ChatItem } from '~/chat'

export function mockChatItem(msg: string, username: string = 'test', userId: string = 'test-1'): ChatItem {
  return {
    id: 'test-1',
    isMod: false,
    isSubscriber: false,
    color: '#FF0000',
    displayName: 'Test',
    userId,
    username,
    type: '',
    turbo: false,
    tmiTs: Date.now(),
    receivedTs: Date.now(),
    returningChatter: false,
    firstMessage: false,
    formattedTmiTs: 'test',
    msg,
  }
}
