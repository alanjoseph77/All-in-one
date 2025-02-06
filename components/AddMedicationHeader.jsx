import { View, Text,Image ,TouchableOpacity} from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
export default function AddMedicationHeader() {
    const router = useRouter();
  return (
    <View>
      <Image source={require('./../assets/images/consult.png')}
      style={{
        width: '100%',
        height: 280,
       
      }}/>
      
      <TouchableOpacity style={{
        position: 'absolute',
        top: 30,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
        elevation: 5,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={()=>router.back()}>
      <Ionicons name="arrow-back" size={24} color="#00C6B4" />
        
      </TouchableOpacity>
    </View>
  )
}