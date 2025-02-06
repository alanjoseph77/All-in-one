import { View, Text } from 'react-native'
import React ,{useState,useEffect}from 'react'
import { Tabs, useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from '../../configs/FirebaseConfig';
export default function TabLayout() {
   const router = useRouter();
   useEffect(()=>{
    GetUserDetails();
   },[])
  
    
  const GetUserDetails=async()=>{
    const userInfo =await getLocalStorage('userDetail')
    if (!userInfo){
      router.replace('/login')
    }
  } 
  //  const [authenticated,setAuthenticated] = useState();
    
        //if user login or not logged
        // onAuthStateChanged(auth, (user) => {
        //   if (user) {
        //     // User is signed in, see docs for a list of available properties
        //     // https://firebase.google.com/docs/reference/js/auth.user
        //     const uid = user.uid;
        //     console.log(uid);
        //     setAuthenticated(true);
        //     // ...
        //   } else {
            
        //     setAuthenticated(false);

        //     // User is signed out
        //     // ...
        //   }
        // });
        // useEffect(() => {
        //   if(authenticated==false) {
        //     router.push('/login')

        //   }

        // },[authenticated])

  return (
<Tabs screenOptions={{
    headerShown: false,
    }}>
    <Tabs.Screen name='index'
        options={{
            tabBarLabel:'Home',
            tabBarIcon:({color,size})=>(
                <FontAwesome name="home" size={size} color={color} />

            )
        }}
    />   
    <Tabs.Screen name='AddNew'
        options={{
            tabBarLabel:'AddNew',
            tabBarIcon:({color,size})=>(
                <FontAwesome name="plus-square" size={size} color={color} />

            )
        }}
    
    /> 
    <Tabs.Screen name='Profile'
         options={{
            tabBarLabel:'Profile',
            tabBarIcon:({color,size})=>(
                <FontAwesome name="user" size={size} color={color} />

            )
        }}
    />  
</Tabs>
  )
}