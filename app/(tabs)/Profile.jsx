import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../configs/FirebaseConfig';
import { removeLocalStorage } from '../../service/Storage';
import { useRouter } from 'expo-router';

const Profile = () => {
  const router = useRouter();


  const handleLogout = async () => {
    try {
      await signOut(auth);
      await removeLocalStorage(); // Clear local storage
      router.replace('/login'); // Redirect to login screen
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };
  


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Profile</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                {/* Add New Medication Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/add-new-medication')}
                >
                    <Ionicons name="add-circle" size={24} color="#4CAF50" />
                    <Text style={styles.buttonText}>Add New Medication</Text>
                </TouchableOpacity>

                {/* My Medication Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/(tabs)')}
                >
                    <Ionicons name="medkit" size={24} color="#2196F3" />
                    <Text style={styles.buttonText}>My Medication</Text>
                </TouchableOpacity>

                {/* History Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/history')}
                >
                    <Ionicons name="time" size={24} color="#FF9800" />
                    <Text style={styles.buttonText}>History</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out" size={24} color="#F44336" />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        padding: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
        
        elevation: 2,
    },
    buttonText: {
        marginLeft: 15,
        fontSize: 18,
        color: '#333',
    },
});

export default Profile;