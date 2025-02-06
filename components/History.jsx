import { View, Text ,Image,StyleSheet,TouchableOpacity,FlatList,Dimensions} from 'react-native'
import React, { useEffect, useState } from 'react'
import moment from 'moment';
const { width } = Dimensions.get('window');
import Colors from './../constants/Colors';
import { GetPrevDatesRangeToDisplay } from '../service/ConvertDateTime';
import { getLocalStorage } from '../service/Storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../configs/FirebaseConfig';
import MedicationCardItem from '../components/MedicationCardItem';
import EmptyState from './EmptyState';
import { useRouter } from 'expo-router';
export default function History() {

   useEffect(() => {
           GetDateList();
           GetMedicationList(selectedDate);
       }, []);


    

    const [selectedDate, setSelectedDate] = useState(moment().format('MM/DD/YYYY'));
    const [dateRange, setDateRange] = useState();
    const [loading, setLoading] = useState(false);
    const [medList, SetMedList] = useState([]);
    const router = useRouter();
    const GetDateList=()=>{
        const dates=GetPrevDatesRangeToDisplay(selectedDate,selectedDate);
        setDateRange(dates);
    }

    const GetMedicationList = async (selectedDate) => {
        setLoading(true);
        const user = await getLocalStorage('userDetail');
        SetMedList([]);
        try {
            const q = query(
                collection(db, 'medication'),
                where('userEmail', '==', user?.email),
                where('dates', 'array-contains', selectedDate),
            );
            const querySnapshot = await getDocs(q);
            
            console.log("Query Snapshot:", querySnapshot.docs); // Debugging line
            
            querySnapshot.forEach((doc) => {
                console.log("docId:" + doc.id + '==>', doc.data());
                SetMedList(prev => [...prev, doc.data()]);
            });
            
            setLoading(false);
        } catch (e) {
            console.log('Error fetching medication list', e);
            setLoading(false);
        }
    };
  return (
    <View
    styles={styles?.mainContainer}>
        <Image source={require('./../assets/images/med-history.png')}
        style={styles?.imagebanner}/>
        <Text style={styles?.text}>Medication History</Text>

        <View style={styles.dateListContainer}>
                        <FlatList
                            horizontal
                            data={dateRange}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.dateListContent}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.dateGroup,
                                        item?.formattedDate === selectedDate && styles.selectedDateGroup
                                    ]}
                                    onPress={() => {
                                        setSelectedDate(item.formattedDate);
                                        GetMedicationList(item.formattedDate);
                                    }}
                                >
                                    <Text style={[
                                        styles.day,
                                        item?.formattedDate === selectedDate && styles.selectedText
                                    ]}>
                                        {item.day}
                                    </Text>
                                    <Text style={[
                                        styles.date,
                                        item?.formattedDate === selectedDate && styles.selectedText
                                    ]}>
                                        {item.date}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
        
                    {medList.length > 0 ? (
    <FlatList
        data={medList}
        style={styles.medicationList}
        onRefresh={() => GetMedicationList(selectedDate)}
        refreshing={loading}
        contentContainerStyle={styles.medicationListContent}
        renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => router.push({
                    pathname: '/action-model',
                    params: {
                        ...item,
                        selectedDate: selectedDate
                    },
                })}
                style={styles.medicationItem}
            >
                <MedicationCardItem medicine={item} selectedDate={selectedDate}/>
            </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
    />
) : (
    <Text style={{
        fontSize:37,
        color: 'gray',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
      
     
    }}>No Medication History</Text>
    
)}
        
      
    </View>
  )
}
const styles = StyleSheet.create({
 mainContainer:{
    padding:25,
    backgroundColor:'#f5f5f5',
    height:'100%',
    alignItems: 'center',
    justifyContent:'center',
    
 },
 imagebanner:{
    width:'100%',
    height:250,
    resizeMode:'cover',
    position:'relative',
    marginBottom:10,
    overflow:'hidden',
 },
 text:{
    color:'black',
    fontSize:20,
    fontWeight:'bold',
     left:100,
 },
 dateListContainer: {
         marginTop: 20,
         marginBottom: 10,
         paddingHorizontal: 15,
     },
     dateListContent: {
         paddingVertical: 5,
     },
     dateGroup: {
         padding: 12,
         backgroundColor: '#fff',
         alignItems: 'center',
         marginRight: 12,
         borderRadius: 16,
         minWidth: width * 0.18,
         elevation: 2,
         shadowColor: '#000',
         
         shadowOpacity: 0.1,
         shadowRadius: 2,
     },
     selectedDateGroup: {
         backgroundColor: Colors.PRIMARY,
         transform: [{ scale: 1.05 }],
     },
     day: {
         fontSize: 16,
         fontWeight: '600',
         color: '#666',
         marginBottom: 4,
     },
     date: {
         fontSize: 24,
         fontWeight: 'bold',
         color: '#333',
     },
     selectedText: {
         color: '#fff',
     },
     medicationList: {
         flex: 1,
     },
     medicationListContent: {
         paddingHorizontal: 15,
         paddingBottom: 20,
     },
     medicationItem: {
         marginVertical: 6,
     }

})