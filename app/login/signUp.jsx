import { View, Text,StyleSheet,TextInput ,TouchableOpacity, ToastAndroid,Alert  } from 'react-native'
import React ,{ useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {auth,db} from '../../configs/FirebaseConfig';
import { updateProfile } from 'firebase/auth';
import { setLocalStorage } from '../../service/Storage';
import { collection, doc, setDoc } from 'firebase/firestore';


export default function SignUp() {
  const router =useRouter();
 
const [email, setEmail] =useState();
const [password,setPassword] =useState();
const [userName,setUserName] =useState();
  const OnCreateAccount=()=>{
    if(!email||!password||!userName)
    {
        ToastAndroid.show('Please fill all fields',ToastAndroid.BOTTOM)
        Alert.alert('Please fill all fields ')
        return;


    }
  //   if (userName.length !== 8) {
  //     Alert.alert('Error', 'Username must be exactly 6 characters long');
  //     return;
  // }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
  
      await updateProfile(user, {
        displayName: userName
      });
  
      await setLocalStorage('userDetail', user);
  
      // ✅ Add user details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: userName,
        email: user.email,
        createdAt: new Date(),
      });
  
      console.log('User signed up successfully:', user);
      router.push('(tabs)');
    })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode);
    if(errorCode=='auth/email-already-in-use')
    {
        ToastAndroid.show('Email already exist',ToastAndroid.BOTTOM)
        Alert.alert('Email already exist')
    }
    // ..
  });
  }
  return (

     <LinearGradient
                colors={['#00C6B4', '#00563F']}
                style={styles.container}
            >
    <View 
    style={{
        padding:25,
        backgroundColor: 'transparent',
        alignItems:'center',
        justifyContent:'center',
        
    }}>
      <Text style={styles?.textHeader}>Create New Account</Text>


      <View style={{ marginTop: 25, width: '100%', alignItems: 'center' }}>
        
        <TextInput placeholder='User Name' style={styles.textInput} 
        onChangeText={(value)=>setUserName(value)}/>
      </View>
      <View style={{ marginTop: 15, width: '100%', alignItems: 'center' }}>
        
        <TextInput placeholder='Email' style={styles.textInput}
        onChangeText={(value)=>setEmail(value)} />
      </View>
      
      <View style={{ marginTop: 15, width: '100%', alignItems: 'center' }}>
        
        <TextInput placeholder='Password'
        secureTextEntry={true} 
        style={styles.textInput} 
        onChangeText={(value)=>setPassword(value)} />
      </View>
      
      <TouchableOpacity style={{ marginTop: 20, backgroundColor: 'black', padding: 10, borderRadius: 10,width:'90%' }}
      onPress={OnCreateAccount}>
        <Text style={{ color: '#00C6B4', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 5, padding: 5, borderRadius: 10,width:'90%'}}
      onPress={()=>router.push('login/signIn')}>
        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Already account? Sign In</Text>
      </TouchableOpacity>
    </View>


    </LinearGradient>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,

},
    textHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 30,
        color: 'Black',
        
    },
    subText: {

        fontSize: 18,
        fontWeight:'bold',
        marginTop: 10,
        color: 'white',

    },
  textInput:{
      padding:10,
      marginBottom:10,
      fontSize: 18,
      borderColor: 'black',
      borderWidth: 2,
      borderRadius: 10,
      width: '90%',
      textAlign: 'left',
      marginTop:10,
      
    }
})