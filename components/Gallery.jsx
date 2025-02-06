import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Notes from './notes';
import Images from './Images';
import { auth } from '../configs/FirebaseConfig';

const GalleryScreen = () => {
  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Please login to access the gallery</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Images />
      <Notes />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
});

export default GalleryScreen;
