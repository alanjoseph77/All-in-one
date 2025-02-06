import { View, Text ,Image,TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import { getLocalStorage } from '../service/Storage'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
export default function Header() {
    const [user,setUser] = useState();
    const router=useRouter()
    useEffect(()=>{
        GetUserDetail()
     }, [])
    
    const GetUserDetail=async()=>{
        const UserInfo=await getLocalStorage('userDetail');
        console.log('User Info',UserInfo);
        setUser(UserInfo);
    }
  return (
    <View style={{
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'white',
        shadowColor: '#000',

    }}>
    <View style={{
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal:20,
        paddingVertical:10,
        backgroundColor:'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        borderRadius:15
        
 
    }}>
     <View style={{
        display: 'flex',
        flexDirection:'row',
        alignContent: 'center',
        gap: 10,
        
     }}>
        <Image source={require('./../assets/images/smiley.png')}
        style={{
            width:45,
            height:45,
           
        }}/>
        <Text style ={{
            
            fontSize:20,
            fontWeight:'bold',
            paddingTop:10,
        }}>Hello {user?.displayName}👋</Text>
     </View>
     <TouchableOpacity onPress={()=>router.push('/add-new-medication')}>
     <Ionicons name="medkit-outline" size={30} color="black" />
     </TouchableOpacity>
     
     </View>

     
    </View>
  )
}