import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Dimensions, } from 'react-native';
import React, { useState, useEffect } from 'react';
import { GetDatesRangeToDisplay } from './../service/ConvertDateTime';
import Colors from './../constants/Colors';
import moment from 'moment';
import { getLocalStorage } from '../service/Storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../configs/FirebaseConfig';
import MedicationCardItem from './MedicationCardItem';
import EmptyState from './../components/EmptyState'
import { useRouter } from 'expo-router';
const { width } = Dimensions.get('window');

export default function MedicationList() {
    const [medList, SetMedList] = useState([]);
    const [dateRange, setDateRange] = useState();
    const [selectedDate, setSelectedDate] = useState(moment().format('MM/DD/YYYY'));
    const [loading, setLoading] = useState(false);
    const router =useRouter();

    useEffect(() => {
        GetDatesRangeList();
        GetMedicationList(selectedDate);
    }, []);

    const GetDatesRangeList = () => {
        const dateRange = GetDatesRangeToDisplay();
        setDateRange(dateRange);
    };

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
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('./../assets/images/medication.jpeg')}
                    style={styles.headerImage}
                />
            </View>

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

           {medList.length>0? <FlatList
                data={medList}
                style={styles.medicationList}
                onRefresh={() => GetMedicationList(selectedDate)}
                refreshing={loading}
                contentContainerStyle={styles.medicationListContent}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                    onPress={()=>router.push({
                        pathname: '/action-model',
                        params: {
                            ...item,
                            selectedDate: selectedDate
                        },

                    })}
                    style={styles.medicationItem}>
                        <MedicationCardItem medicine={item} selectedDate={selectedDate}/>
                    </TouchableOpacity>
                )}
            />:<EmptyState/>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.GREEN,
        height: '100%',
        borderRadius: 34,
    },
    imageContainer: {
        width: '100%',
        height: 220,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderRadius: 34,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 34,
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
        shadowOffset: { width: 0, height: 1 },
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
});