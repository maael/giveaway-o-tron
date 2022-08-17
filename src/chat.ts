import {useCallback, useEffect, useState} from 'react'
import tmi from 'tmi.js';
import { ControlConfig } from './components/screens/ControlsConfig';

export interface ChatItem {
  id: string,
  color: string,
  displayName: string,
  isSubscriber: boolean,
  turbo: boolean,
  username: string,
  type: string,
  msg: string,
  words: string[]
}

export class ChatEvent extends EventTarget {
  emit (data: ChatItem) {
    this.dispatchEvent(new CustomEvent('chat', {detail: data}))
  }
};

export const chatEmitter = new ChatEvent();

export function useChatEvents (onChat: (chat: ChatItem) => void): [ChatItem[], () => void] {
  const [chat, setChat] = useState<ChatItem[]>([])
  useEffect(() => {
    function handleChat (d: CustomEvent<ChatItem>) {
      setChat((c) => c.concat(d.detail))
      onChat(d.detail)
    }
    chatEmitter.addEventListener('chat', handleChat)
    return () => {
      chatEmitter.removeEventListener('chat', handleChat);
    }
  }, [setChat, onChat])
  const resetChat = useCallback(() => {
    setChat([])
  }, [setChat])
  return [chat, resetChat]
}

export default function init(channel: string) {
  // Define configuration options
  const opts = {
    channels: [
      channel
    ]
  };

  // Create a client with our options
  const client = new tmi.client(opts);

  // Register our event handlers (defined below)
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);

  // Connect to Twitch:
  client.connect();

  // Called every time a message comes in
  function onMessageHandler(target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const words = msg.trim().toLowerCase().split(' ');

    const data: ChatItem = {
      id: context.id,
      color: context.color,
      displayName: context['display-name'],
      isSubscriber: context.subscriber,
      turbo: context.turbo,
      username: context.username,
      type: context['message-type'],
      msg,
      words
    }

    chatEmitter.emit(data);
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }
  return client;
};

export function getCommandFromChat (controls: ControlConfig[], chat: ChatItem) {
  const words = chat.msg.split(' ')
  return controls.find(({ command }) => words.some((w) => w.toLowerCase() === command.toLowerCase()))
}