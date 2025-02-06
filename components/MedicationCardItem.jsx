import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

export default function MedicationListItem({ medicine,selectedDate='' }) {
    const [status, setStatus] = useState();

     useEffect(()=>{
        CheckStatus()
     }, [medicine])


    
    // const CheckStatus=()=>{
    //     const data=medicine?.action?.find((item)=>item.date==selectedDate);
    //     console.log('--',data);
    //     setStatus(data);
    // }
    const CheckStatus = () => {
        if (!medicine || !Array.isArray(medicine.action)) {
            console.warn("medicine.action is not an array or is undefined:", medicine);
            setStatus(null);
            return;
        }
    
        const data = medicine.action.find((item) => item.date === selectedDate);
        console.log('--', data);
        setStatus(data);
    };
    
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: medicine?.type?.icon }}
                style={styles.medicineImage}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.medicineName} numberOfLines={1}>{medicine?.name}</Text>
                <View style={styles.detailsContainer}>
                    <Text style={styles.medicineType} numberOfLines={1}>{medicine?.type?.name}</Text>
                    <Text style={styles.timeText}>{medicine?.when}</Text>
                    <Text style={styles.doseText} numberOfLines={1}>
                        {medicine?.dose}
                    </Text>
                </View>
            </View>
            <View style={styles.reminder}>
                <Ionicons
                    name="timer-outline"
                    size={16}
                    color={Colors.PRIMARY}
                />
                <Text style={styles.reminderText} numberOfLines={1}>{medicine?.reminder}</Text>
            </View>
        {status?.date&& <View style={styles.statusContainer}>
        {status?.status=='Taken' ?<Ionicons
                    name="checkmark-circle"
                    size={26}
                    color={Colors.GREEN}
                />:
                status?.status=='Missed'&&
                <Ionicons
                    name="close-circle"
                    size={26}
                    color={'red'}
                />}

        </View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 8,
        padding: 9,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        
    },
    medicineImage: {
        width: 32,
        height: 42,
        resizeMode: 'contain',
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 4,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 8,
        marginRight: 4,
    },
    medicineName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        paddingLeft: 47,
    },
    detailsContainer: {
        // flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    medicineType: {
        fontSize: 15,
        color: '#666',
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        marginHorizontal: 4,
        paddingLeft: 15,
    },
    doseText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        marginLeft: 4,
        flex: 1,
    },
    reminder: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 4,
        marginLeft: 4,
    },
    reminderText: {
        fontSize: 11,
        color: '#333',
        fontWeight: '500',
        marginLeft: 2,
        maxWidth: 60,
    },
    statusContainer:{
        position: 'absolute',
        top: 0,
        // padding:5,
        right: 0,
        width: 40,
        height: 40,
        
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',

        // backgroundColor: '#ff0000'  // Debugging purpose only
    }
});