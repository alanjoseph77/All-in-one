import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../configs/FirebaseConfig';
import { setLocalStorage } from '../../service/Storage';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const OnSignInClick = () => {
    if (!email || !password) {
      Alert.alert('Please enter Email & Password');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log(user);
        await setLocalStorage('userDetail', user);
        router.replace('(tabs)');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode == 'auth/invalid-credential') {
          Alert.alert('Invalid Credential');
        }
      });
  };

  return (
    <LinearGradient colors={['#00C6B4', '#00563F']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.textHeader}>Let's Sign You In</Text>
        <Text style={styles.subText}>Welcome Back</Text>
        <Text style={styles.subText}>You've been missed!</Text>

        <View style={styles.inputContainer}>
          <TextInput placeholder='Email' style={styles.textInput} onChangeText={(value) => setEmail(value)} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput placeholder='Password' secureTextEntry={true} style={styles.textInput} onChangeText={(value) => setPassword(value)} />
        </View>

        <TouchableOpacity style={styles.button} onPress={OnSignInClick}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('login/signUp')}>
          <Text style={styles.buttonText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 30,
    color: 'black',
  },
  subText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'black',
  },
  inputContainer: {
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    padding: 10,
    marginBottom: 10,
    fontSize: 18,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 10,
    width: '90%',
    textAlign: 'left',
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
    width: '90%',
  },
  buttonText: {
    color: '#00C6B4',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});