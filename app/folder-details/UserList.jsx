import { View, Text, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../configs/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // ✅ Fetch only users stored in Firestore (who signed up via your app)
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => user.uid !== auth.currentUser.uid); // Exclude current user

      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const startChat = (otherUser) => {
    router.push({
      pathname: '/folder-details/Chat',
      params: {
        otherUserId: otherUser.uid,
        otherUserEmail: otherUser.email,
        otherUserName: otherUser.displayName || otherUser.email.split('@')[0]
      }
    });
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      onPress={() => startChat(item)}
      style={{
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        alignItems: 'center',
      }}
    >
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E1E1E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        {item.photoURL ? (
          <Image
            source={{ uri: item.photoURL }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
        ) : (
          <Text>{item.displayName ? item.displayName.toUpperCase() : "Unknown"}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>
          {item.displayName || item.email.split('@')[0]}
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          {item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen 
        options={{
          title: 'Select User',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />

      <View style={{
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
      }}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#F0F0F0',
          borderRadius: 10,
          padding: 8,
          alignItems: 'center',
        }}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredUsers} // Use filteredUsers instead of users for search functionality
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderUser} // Ensure each user is rendered properly
        />
      )}
    </View>
  );
};

export default UsersScreen;
