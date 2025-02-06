
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { signOut } from 'firebase/auth';
// import { auth } from '../../configs/FirebaseConfig';
// import { removeLocalStorage } from '../../service/Storage';
import { useRouter } from 'expo-router';

import { getLocalStorage } from '../../service/Storage';

const AddNew = ({ navigation }) => {
  const router = useRouter();


  const [user,setUser] = useState();
      
      useEffect(()=>{
          GetUserDetail()
       }, [])
      
      const GetUserDetail=async()=>{
          const UserInfo=await getLocalStorage('userDetail');
          console.log('User Info',UserInfo);
          setUser(UserInfo);
      }
  


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>{user?.displayName} Section</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                {/* Photo Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/add-myfiles')}
                >
                    <Ionicons name="add-circle" size={24} color="#4CAF50" />
                    <Text style={styles.buttonText}>Photos</Text>
                </TouchableOpacity>

               

                {/* Notes Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/add-mynotes')}
                >
                    <Ionicons name="time" size={24} color="#FF9800" />
                    <Text style={styles.buttonText}>History</Text>
                </TouchableOpacity>

                {/* chat Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/folder-details')}
                >
                    <Ionicons name="time" size={24} color="#FF9800" />
                    <Text style={styles.buttonText}>Chat</Text>
                </TouchableOpacity>

                {/* chat Button */}
                    <TouchableOpacity
                    style={styles.button}
                    onPress={()=>router.push('/smartwatch')}
                >
                    <Ionicons name="time" size={24} color="#FF9800" />
                    <Text style={styles.buttonText}>Watch Screen</Text>
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
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
    },
    buttonText: {
        marginLeft: 15,
        fontSize: 18,
        color: '#333',
    },
});

export default AddNew;