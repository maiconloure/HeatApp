import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Message } from '../Message';
import { api } from '../services/api';
import { io } from 'socket.io-client';

import { styles } from './styles';

import { MESSAGES_EXAMPLE } from '../../utils/messages'

let messagesQueue: Message[] = MESSAGES_EXAMPLE;

const socket = io(String(api.defaults.baseURL))
socket.on('new_message', (newMessage: Message) => {
  messagesQueue.push(newMessage);
})

export function MessageList() {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]); 

  useEffect(() => {
    async function fetchMessages() {
      const messagesResponse = await api.get<Message[]>('/messages/last3');
      setCurrentMessages(messagesResponse.data)
    }
    fetchMessages();
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setCurrentMessages(prevState => [messagesQueue[0],prevState[0], prevState[1]])
        messagesQueue.shift()
      }
    }, 3000)

    return () => clearInterval(timer);
  }, [])


    return (
        <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="never"
        >
          {currentMessages.map((message) => <Message key={message.id} data={message} />)}
        </ScrollView>
    )
}