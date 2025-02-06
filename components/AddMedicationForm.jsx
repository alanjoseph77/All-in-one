import { View, Text,StyleSheet,TextInput,FlatList,TouchableOpacity,ScrollView,Alert } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { TypeList, WhenToTake } from '../constants/Options';
import Colors from './../constants/Colors'
import { Picker } from '@react-native-picker/picker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { FormatDate,FormatDateForText,FormatTime, getDatesRange  } from '../service/ConvertDateTime';
import { db } from '../configs/FirebaseConfig';
import { getLocalStorage } from '../service/Storage';
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';


export default function AddMedicationForm() {
    const [formData,setFormData] =useState();
    const [showStartDate,setShowStartDate]=useState(false);
    const [showEndDate,setShowEndDate]=useState(false);
    const [showTimePicker,setShowTimePicker]=useState(false);
    const [loading,setLoading]=useState(false);
    const router=useRouter();



    const onHandleInputChange=(field, value) => {
        setFormData(prev=>({
            ...prev,
            [field]: value
        }));
        console.log(formData);
          
    } 
    const SaveMedication = async () => {
      const user = await getLocalStorage('userDetail');
      console.log('User:', user);
    
      if (!user) {
          Alert.alert('Error', 'You must be logged in to add medication.');
          return;
      }
      
      // Check if all required fields are filled
      if (!formData?.name || !formData?.type || !formData?.dose || 
          !formData?.startDate || !formData?.endDate || !formData?.reminder) {
          Alert.alert('Error', 'Please fill all fields');
          return;
      }
  
      // Get dates range before setting loading state
      const dates = getDatesRange(formData.startDate, formData.endDate);
      console.log('Dates:', dates);
      
      if (dates.length === 0) {
          Alert.alert('Error', 'Invalid date range selected');
          return;
      }
  
      setLoading(true);
      const docId = Date.now().toString();
    
      try {
          await setDoc(doc(db, 'medication', docId), {
              ...formData,
              userEmail: user?.email,
              docId: docId,
              dates: dates,
          });
          console.log('Data saved successfully');
          setLoading(false);
          Alert.alert(
              'Success',
              'Medication added successfully',
              [{
                  text: 'OK',
                  onPress: () => router.push('(tabs)')
              }]
          );
      } catch (e) {
          setLoading(false);
          console.error(e);
          Alert.alert('Error', 'Failed to save medication');
      }
  };
  return (
    <View style={styles.container}>


      <Text style={styles?.header}>Add New Medication</Text>

      <View style={styles?.inputGroup}>
      <Ionicons style={styles?.icon} name="eyedrop-outline" size={22} color="black" />
      <TextInput style={styles?.textInput} placeholder='Medicine Name' placeholderTextColor="grey"
      onChangeText={(value)=>onHandleInputChange('name',value)}/>
      </View>


      {/* TypeList */}
  <FlatList
  data={TypeList}
  horizontal
  style={styles.typeContainer}
  renderItem={({ item }) => (
    <TouchableOpacity 
      style={[
        styles.typeButton,
        {backgroundColor: item.name === formData?.type?.name ? '#00C6B4' : 'white'}
      ]}
      onPress={() => onHandleInputChange('type', item)}>
      <Text 
        style={[
          styles.typeText,
          {color: item.name === formData?.type?.name ? 'white' : '#333'}
        ]}>
        {item?.name}
      </Text>
    </TouchableOpacity>
  )}
/>

      {/* Dose Input */}
      <View style={styles?.inputGroup}>
      <Ionicons style={styles?.icon} name="medkit-outline" size={22} color="black" />
      <TextInput style={styles?.textInput} placeholder='Dose Ex. 2, 5ml' placeholderTextColor="grey"
      onChangeText={(value)=>onHandleInputChange('dose',value)}/>
      </View>
        


        {/* dropDown */}

        <View style={styles.inputGroup}>
            <Ionicons style={styles?.icon} name="time-outline" size={22} color="black" />
            <Picker
            selectedValue={formData?.when}
            onValueChange={(itemValue,itemIndex)=>
                onHandleInputChange('when',itemValue)
            }
            style={{
                width: '90%',
            }}>
                {WhenToTake.map((item,index)=>(
                    <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>

        </View>
          {/* sart and end date */}
          <View style={styles.dateContainer}>
  <TouchableOpacity 
    style={styles.dateButton}
    onPress={() => setShowStartDate(true)}>
    <Ionicons style={styles.icon} name="calendar-outline" size={24} color="#333" />
    <Text style={styles.dateText}>
      {FormatDateForText(formData?.startDate) ?? 'Start Date'}
    </Text>
  </TouchableOpacity>
        {showStartDate&&<RNDateTimePicker
        minimumDate={new Date()}
        onChange={(event)=>{
           onHandleInputChange('startDate',FormatDate(event.nativeEvent.timestamp))
            setShowStartDate(false)
        }}
        
        value={new Date(formData?.startDate)??new Date()}
        />}
        <TouchableOpacity style={styles.dateButton}
        onPress={()=>setShowEndDate(true)}>
        <Ionicons style={styles.icon} name="calendar-outline" size={24} color="black" />
        <Text style={styles.dateText}>{FormatDateForText(formData?.endDate)??'End Date'}
        </Text>
        </TouchableOpacity>
        {showEndDate&&<RNDateTimePicker
        minimumDate={new Date()}
        onChange={(event)=>{
           onHandleInputChange('endDate',FormatDate(event.nativeEvent.timestamp))
           setShowEndDate(false)
        }}
        
        value={new Date(formData?.startDate)??new Date()}
        />}
        </View>

        {/* set reminder input */}
           

        <View style={{
            flexDirection: 'row',
            gap:10
          }}>
        <TouchableOpacity style={[styles?.inputGroup,{flex:1},]}
        onPress={()=>setShowTimePicker(true)}>
        <Ionicons style={styles?.icon} name="timer-outline" size={24} color="black" />
        <Text styles={styles?.text}>{formData?.reminder??'Select Reminder Time'}</Text>
        
        </TouchableOpacity>
        </View>
      { showTimePicker&& <RNDateTimePicker
        mode="time"
        onChange={(event)=>{
            onHandleInputChange('reminder',FormatTime(event.nativeEvent.timestamp))
            setShowTimePicker(false)
         }}
         
        value={formData?.reminder?? new Date()}
        />}

<TouchableOpacity style={styles.submitButton}>
  {loading ? (
    <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />
  ) : (
    <Text style={styles.submitButtonText} onPress={SaveMedication}>
      Add Medication
    </Text>
  )}
</TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
  },
  header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: '#333',
      paddingVertical: 10,
  },
  inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#00C6B4',
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 50,
  },
  textInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: '#333',
      padding: 0, // Remove default padding
  },
  icon: {
      borderRightWidth: 1,
      paddingRight: 12,
      borderRightColor: '#ddd',
      marginRight: 12,
  },
  typeContainer: {
      marginVertical: 15,
  },
  typeButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#00C6B4',
  },
  typeText: {
      fontSize: 16,
      paddingHorizontal: 8,
      color: '#333',
  },
  dateContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 15,
  },
  dateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#00C6B4',
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  dateText: {
      fontSize: 14,
      marginLeft: 0,
      color: '#333',
  },
  pickerContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 15,
  },
  picker: {
      width: '100%',
      height: 50,
      backgroundColor: '#fff',
  },
  submitButton: {
      backgroundColor: '#00C6B4',
      padding: 15,
      borderRadius: 12,
      width: '100%',
      marginTop: 20,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
  },
  submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
      textAlign: 'center',
  },
  loadingIndicator: {
      padding: 10,
  }
});