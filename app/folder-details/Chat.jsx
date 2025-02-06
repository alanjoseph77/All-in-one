import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Image,Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  getDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { auth, db } from '../../configs/FirebaseConfig';

const ChatScreen = () => {
  const { otherUserId, otherUserEmail, otherUserName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);


  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const storage = getStorage();

  const getChatRoomId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
    if (!auth.currentUser || !otherUserId) return;

    const roomId = getChatRoomId(auth.currentUser.uid, otherUserId);

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString(),
      }));
      setMessages(messageList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [otherUserId]);

  const sendMessage = async (imageUrl = null) => {
    if ((!newMessage.trim() && !imageUrl) || !auth.currentUser || !otherUserId) return;

    try {
      const roomId = getChatRoomId(auth.currentUser.uid, otherUserId);
      
      const messageData = {
        roomId,
        text: imageUrl ? '' : newMessage,
        sender: auth.currentUser.uid,
        senderEmail: auth.currentUser.email,
        receiver: otherUserId,
        receiverEmail: otherUserEmail,
        timestamp: serverTimestamp(),
        read: false,
        imageUrl: imageUrl || null,
      };

      await addDoc(collection(db, 'messages'), messageData);

      const roomRef = doc(db, 'chatRooms', roomId);
      await setDoc(roomRef, {
        lastMessage: imageUrl ? '📷 Image' : newMessage,
        lastMessageTime: serverTimestamp(),
      }, { merge: true });

      setNewMessage('');
      setImage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `chatImages/${auth.currentUser.uid}_${new Date().getTime()}.jpg`;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      null,
      (error) => console.error(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        sendMessage(downloadURL);
      }
    );
  };


  const downloadImage = async (imageUrl) => {
    try {
      // Get file name from URL
      const filename = imageUrl.split('/').pop();
      const directory = FileSystem.documentDirectory + 'chatImages/'; // Use 'chatImages/' only once
      const fileUri = directory + filename;
  
      // Check if the directory exists and create it if not
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
  
      // Proceed with downloading the image
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
  
      // Request media library permission to save image
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(uri);
        alert('Image saved to gallery!');
      } else {
        alert('Permission required to save images.');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  



  


  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === auth.currentUser?.uid;
  
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.imageUrl) {
            setSelectedImage(item.imageUrl);
          }
        }}
        style={{
          flexDirection: 'row',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          marginVertical: 4,
          marginHorizontal: 8,
        }}
      >
        <View style={{
          backgroundColor: isCurrentUser ? '#007AFF' : '#E8E8E8',
          borderRadius: 20,
          padding: 12,
          maxWidth: '70%',
        }}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: 200, height: 200, borderRadius: 10 }} />
          ) : (
            <Text style={{
              color: isCurrentUser ? 'white' : 'black',
              fontSize: 16,
            }}>
              {item.text}
            </Text>
          )}
          <Text style={{
            color: isCurrentUser ? '#E0E0E0' : '#666',
            fontSize: 12,
            marginTop: 4,
          }}>
            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : ''}
          </Text>
        </View>

        
      </TouchableOpacity>
      
    );
    
  };
  

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <Stack.Screen 
        options={{
          title: otherUserName || otherUserEmail?.split('@')[0] || 'Chat',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        style={{ flex: 1 }}
      />

      <View style={{
        flexDirection: 'row',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        backgroundColor: '#fff',
      }}>
        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="camera" size={28} color="#007AFF" style={{ marginHorizontal: 10 }} />
        </TouchableOpacity>
        <TextInput
          style={{
            flex: 1,
            borderRadius: 20,
            backgroundColor: '#F0F0F0',
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            fontSize: 16,
          }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity onPress={() => sendMessage()}>
          <Ionicons name="send" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {selectedImage && (
  <Modal visible={true} transparent={true} animationType="fade">
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Image source={{ uri: selectedImage }} style={{ width: '90%', height: '80%', borderRadius: 10 }} />
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <TouchableOpacity onPress={() => setSelectedImage(null)} style={{ marginHorizontal: 10 }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => downloadImage(selectedImage)} style={{ marginHorizontal: 10 }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Download</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  </Modal>
)}


    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
