import { View, Text,StyleSheet,Image,TouchableOpacity,Alert } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import MedicationCardItem from '../../components/MedicationCardItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import { arrayUnion,doc ,updateDoc } from 'firebase/firestore';
import { db } from '../../configs/FirebaseConfig';
import moment from 'moment';
export default function MedicationActionModal() {
    const medicine=useLocalSearchParams();
    const router=useRouter();
    const UpdateActionStatus=async(status)=>{
        try{
            const docRef=doc(db,'medication',medicine?.docId);
            await updateDoc(docRef,{
                action:arrayUnion({
                    status:status,
                    time:moment().format('LT'),
                    date:medicine?.selectedDate

                })
                
            });
               Alert.alert(status,'Response Saved!',[
                {
                text:'OK',
                onPress:()=>router.replace('(tabs)')
                
               }])
        }catch(e){
            console.log('Error updating status',e);
        }

    }
    console.log(medicine);
  return (
    <View style={styles.container}>
        <Image source={require('./../../assets/images/notification.gif')}
        style={{
            width:120,
            height:120,
            marginBottom:20,
        }}/>
        <Text style={{fontWeight:'bold',fontSize:20}}>{medicine?.selectedDate}</Text>
        <Text style={{fontWeight:'bold',fontSize:30}}>{medicine?.reminder}</Text>
        <Text style={{fontSize:18}}>It's time to take</Text>

        <MedicationCardItem medicine={medicine}/>
        <View style={styles.btnContainer}>
           <TouchableOpacity style={styles.close }
           onPress={()=>UpdateActionStatus('Missed')}>
           <Ionicons name="close-outline" size={24} color="black" />
             <Text style={{fontSize:20,color:'#00C6B4', fontWeight:'bold'}}> Missed</Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.success }
           onPress={()=>UpdateActionStatus('Taken')}>
           <Ionicons name="checkmark-outline" size={24} color="black" />
             <Text style={{fontSize:20,color:'#00C6B4', fontWeight:'bold'}}> Taken</Text>
           </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.dismiss }
        onPress={()=>router.back()}>
           <Ionicons name="close-circle" size={44} color="black" />
             {/* <Text style={{fontSize:20,color:'#00C6B4', fontWeight:'bold'}}> Dismiss</Text> */}
           </TouchableOpacity>
      
    </View>
  )
}
const styles = StyleSheet.create({
    container:{
        padding:25,
        alignItems: 'center',
        justifyContent:'center',
        backgroundColor:'white',
        borderRadius:10,
        shadowColor: "#000",
        height:'100%'
        

    },
    btnContainer:{
        flexDirection:'row',
        
        marginTop:10,

    },
    close:{
        padding:10,
        flexDirection:'row',
        gap:6
    },
    success:{
        padding:10,
        flexDirection:'row',
        gap:6

    },
    dismiss:{
        position:'absolute',
        bottom:10,
    }
})