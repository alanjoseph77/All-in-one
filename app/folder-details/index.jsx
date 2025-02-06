import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Link href="/folder-details/UserList" asChild>  
       
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white' }}>Start Chat</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
