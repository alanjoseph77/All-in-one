import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../configs/FirebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const Note = () => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const saveNote = async () => {
    if (!note.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'notes'), {
        text: note,
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(),
      });
      setNote('');
      await fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.noteInput}
        placeholder="Write a note..."
        value={note}
        onChangeText={setNote}
        multiline
      />
      <Button title="Save Note" onPress={saveNote} />

      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text>{item.text}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No notes yet</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 16,
    minHeight: 60,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
});

export default Note;
