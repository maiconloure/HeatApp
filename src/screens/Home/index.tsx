import React from "react"
import { View, Text } from "react-native"
import { Header } from "../../components/Header"
import { MessageList } from "../../components/MessageLIst"
import { styles } from "./styles"

export function Home() {
  return (
    <View style={styles.container}>
      <Header />
      <MessageList />
    </View>
  )
}