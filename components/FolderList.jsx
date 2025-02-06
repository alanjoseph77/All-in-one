import { View, Text,StyleSheet,FlatList,TextInput,Button } from 'react-native'
import React, { useState } from 'react'


const FolderList = ({ folders, onSelectFolder, onCreateFolder, onDeleteFolder }) => {
    const [newFolderName, setNewFolderName] = useState('');
  
    return (
      <View>
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.folderContainer}>
              <Button title={item.name} onPress={() => onSelectFolder(item)} />
              <Button title="Delete Folder" onPress={() => onDeleteFolder(item.id)} />
            </View>
          )}
        />
        <TextInput
          placeholder="New Folder Name"
          value={newFolderName}
          onChangeText={setNewFolderName}
        />
        <Button title="Create Folder" onPress={() => {
          onCreateFolder(newFolderName);
          setNewFolderName('');
        }} />
      </View>
    );
  };
  
    
    
    const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
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
        folderContainer: {
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
        },
      });
      export default FolderList;