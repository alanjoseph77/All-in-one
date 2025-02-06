import { View, Text, Button,ScrollView,FlatList } from 'react-native';
import React from 'react';
// import { useRouter } from 'expo-router';
// import { signOut } from 'firebase/auth';
// import { auth } from '../../configs/FirebaseConfig';
// import { removeLocalStorage } from '../../service/Storage';
import Header from '../../components/Header';
// import EmptyState from '../../components/EmptyState';
import MedicationList from '../../components/MedicationList';
export default function Index() {


  return (
   <FlatList
   data={[]}
   ListHeaderComponent={
    <View style={{
      
      padding: 25,
      backgroundColor: '#FFFFFF',
      height: '150%',
    }}>
      <Header/>
      {/* <EmptyState/> */}
      <MedicationList />
    </View>
   }/>
    
    
  );
}
