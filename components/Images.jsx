import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Image, Alert, StyleSheet, Text ,Modal, TouchableOpacity, Dimensions,  } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth, storage } from '../configs/FirebaseConfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import FolderList from './FolderList';

const Images = () => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null);
  // Function to add a new folder to Firestore
  const addFolder = async (folderName) => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }
  
    try {
      // Check if a folder with the same name already exists for the current user
      const q = query(collection(db, 'folders'), where('userId', '==', auth.currentUser.uid), where('name', '==', folderName));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        Alert.alert('Error', 'A folder with this name already exists');
        return;
      }
  
      const newFolder = {
        id: Math.random().toString(),
        name: folderName,
        photos: [],
        userId: auth.currentUser.uid, // Associate folder with the logged-in user
      };
  
      // Add the folder to Firestore
      await addDoc(collection(db, 'folders'), newFolder);
  
      // Update the local state
      setFolders((prevFolders) => [...prevFolders, newFolder]);
  
      Alert.alert('Success', 'Folder created successfully');
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', `Failed to create folder: ${error.message}`);
    }
  };
  
// Load folders from Firestore when the user logs in
const loadFolders = async () => {
  try {
    const q = query(collection(db, 'folders'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const loadedFolders = [];

    // Load folders and photos
    for (const docSnap of querySnapshot.docs) {
      const folderData = docSnap.data();
      const folderId = docSnap.id;

      // Fetch photos for the folder
      const photosQuery = query(collection(db, 'photos'), where('folderId', '==', folderId));
      const photosSnapshot = await getDocs(photosQuery);
      const folderPhotos = photosSnapshot.docs.map(doc => doc.data().url);

      // Add photos to folder
      loadedFolders.push({ ...folderData, id: folderId, photos: folderPhotos });
    }

    setFolders(loadedFolders); // Set folders with associated photos
  } catch (error) {
    console.error('Error loading folders:', error);
    Alert.alert('Error', 'Failed to load folders');
  }
};
 // Open full-screen image viewer
 const openFullScreenImage = (imageUrl) => {
  setSelectedImage(imageUrl);
  setIsModalVisible(true);
};

// Close full-screen image viewer
const closeFullScreenImage = () => {
  setIsModalVisible(false);
  setSelectedImage(null);
};


useEffect(() => {
  if (auth.currentUser) {
    loadFolders(); // Load folders from Firestore
  } else {
    Alert.alert('Error', 'Please log in');
  }
}, [auth.currentUser]);
  

  

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to the gallery');
      return false;
    }
    return true;
  };

  if (!auth.currentUser) {
    Alert.alert('Error', 'You need to sign in first');
    return;
  }
// Upload photo to Firebase Storage and Firestore
const pickImage = async () => {
  if (!currentFolder) {
    Alert.alert('No Folder Selected', 'Please select or create a folder first.');
    return;
  }

  try {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      quality: 1,
    });

    if (!result.canceled) {
      setUploading(true);
      const localUri = result.assets[0].uri;
      const fileName = localUri.split('/').pop();

      const userStoragePath = `users/${auth.currentUser.uid}/photos/${fileName}`;
      const storageRef = ref(storage, userStoragePath);

      const response = await fetch(localUri);
      const blob = await response.blob();

      try {
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        // Add photo to Firestore with folderId
        await addDoc(collection(db, 'photos'), {
          url: downloadURL,
          userId: auth.currentUser.uid,
          path: userStoragePath,
          timestamp: new Date().toISOString(),
          folderId: currentFolder.id, // Make sure to associate the photo with the folder
        });

        // Update the folder in local state (add the new photo URL to the selected folder)
        const updatedFolders = folders.map((folder) => {
          if (folder.id === currentFolder.id) {
            return { ...folder, photos: [...folder.photos, downloadURL] };
          }
          return folder;
        });

        setFolders(updatedFolders);

        Alert.alert('Success', 'Photo uploaded successfully');
      } catch (uploadError) {
        console.log("Upload error:", uploadError);
        Alert.alert('Error', `Failed to save image: ${uploadError.message}`);
      }
    }
  } catch (error) {
    console.error('Error saving image:', error);
    Alert.alert('Error', `Failed to save image: ${error.message}`);
  } finally {
    setUploading(false);
  }
};

useEffect(() => {
  if (auth.currentUser) {
    loadFolders(); // Load folders and images from Firestore when logged in
  } else {
    // Don't delete images when the user logs out
    console.log('User logged out, but photos remain in Firestore and Storage');
  }
}, [auth.currentUser]);

// Function to delete a photo from Firebase Storage and Firestore
const deletePhoto = async (photoURL) => {
  try {
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef); // Only delete from Firebase Storage

    // Delete the photo from Firestore
    const q = query(collection(db, 'photos'), where('url', '==', photoURL));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref); // Only delete the document in Firestore
    });

    // Update the folder state without the deleted photo
    const updatedFolders = folders.map((folder) => {
      if (folder.id === currentFolder.id) {
        return { ...folder, photos: folder.photos.filter((url) => url !== photoURL) };
      }
      return folder;
    });

    setFolders(updatedFolders);

    Alert.alert('Success', 'Photo deleted successfully');
  } catch (error) {
    console.error('Error deleting photo:', error);
    Alert.alert('Error', `Failed to delete photo: ${error.message}`);
  }
};

  

  useEffect(() => {
    if (currentFolder) {
      const updatedFolder = folders.find((folder) => folder.id === currentFolder.id);
      if (updatedFolder) {
        setCurrentFolder(updatedFolder);
      }
    }
  }, [folders, currentFolder]); // This will automatically refresh the folder when the state changes
  
  return (
    <View style={styles.container}>
      
      <FolderList
        folders={folders}
        onSelectFolder={setCurrentFolder}
        onCreateFolder={addFolder}
      />
      
      

      {currentFolder && (
        <>
        <TouchableOpacity><Text style={styles.folderTitle}>Selected Folder: {currentFolder.name}</Text></TouchableOpacity>
          
          <Button
            title={uploading ? "Uploading..." : "Upload Photo"}
            onPress={pickImage}
            disabled={uploading}
          />
          <FlatList
            data={currentFolder.photos}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={styles.photoContainer}>
                <TouchableOpacity onPress={() => openFullScreenImage(item)}>
                  <Image
                    source={{ uri: item }}
                    style={styles.photo}
                    onError={(error) => console.error('Image loading error:', error)}
                  />
                </TouchableOpacity>
                <Button title="Delete" onPress={() => deletePhoto(item)} />
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No photos in this folder</Text>
            )}
          />
        </>
      )}

      {/* Full-Screen Image Modal */}
      <Modal visible={isModalVisible} transparent={true} onRequestClose={closeFullScreenImage}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeFullScreenImage}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
    backgroundColor: '#f0f0f0',
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: "80%"
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'green',
  },
});

export default Images;