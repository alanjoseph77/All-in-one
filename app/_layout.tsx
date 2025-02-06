import { Stack } from "expo-router";

export default function RootLayout() {
  return(
   <Stack screenOptions={{
    headerShown: false,
   }}>
    <Stack.Screen name="(tabs)"/>
    <Stack.Screen name="login"/>
    <Stack.Screen name="history"/>
   
    <Stack.Screen name="add-myfiles"/>
    <Stack.Screen name="add-notes"/>
    <Stack.Screen name="folder-details" />
    <Stack.Screen name="smartwatch" />
    <Stack.Screen name="action-model"
    
    options={{
      presentation:'modal',
    }}/>
  </Stack>
  
  )
}
