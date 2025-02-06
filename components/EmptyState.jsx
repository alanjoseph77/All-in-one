import { View, Text,Image ,TouchableOpacity} from 'react-native'
import React from 'react';
import ConstantString from '../constants/ConstantString';
import { useRouter } from 'expo-router';

export default function EmptyState() {
    const router = useRouter();
  return (
    <View style={{
        marginTop:80,
        display: 'flex',
        alignContent: 'center',

    }}>
      <Image source={require('./../assets/images/medicine.png')}
      style={{
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 20,
        resizeMode: 'contain'
      }}/>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        marginBottom: 20,
        letterSpacing: 1,
        lineHeight: 25,
        textTransform: 'uppercase'
      }}>{ConstantString.NoMedication}</Text>
      <Text style={{
        fontSize:15,
        color: 'white',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
      }}>{ConstantString.MedicationSubText}</Text>
      <TouchableOpacity style={{}}>
        <Text style={{
          fontSize: 16,
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 20,
          marginBottom: 20,
        }}
        onPress={()=>router.push('/add-new-medication')}
        >{ConstantString.AddNewMediciationBtn}</Text>
      </TouchableOpacity>
    </View>

  )
}