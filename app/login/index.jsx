import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, PanResponder, StatusBar } from 'react-native';
import React, { useRef } from 'react';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.8;
const THUMB_SIZE = 40;

export default function LoginScreen() {
    const router = useRouter();
    const pan = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                const newX = Math.max(0, Math.min(gesture.dx, SLIDER_WIDTH - THUMB_SIZE));
                pan.setValue(newX);
                textOpacity.setValue(1 - (newX / (SLIDER_WIDTH - THUMB_SIZE)));
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > SLIDER_WIDTH - THUMB_SIZE - 20) {
                    router.push('login/signIn');
                }
                Animated.parallel([
                    Animated.spring(pan, { toValue: 0, useNativeDriver: false }),
                    Animated.spring(textOpacity, { toValue: 1, useNativeDriver: false })
                ]).start();
            }
        })
    ).current;

    return (
        <LinearGradient colors={['#00C6B4', '#00563F']} style={styles.container}>
            <StatusBar backgroundColor="#00C6B4" translucent={true} />
            
            <View style={styles.header}>
                {/* Keep existing header content */}
            </View>

            <Animatable.View animation="fadeInUpBig" duration={1500} style={styles.footer}>
                <Text style={styles.title}>Stay on Track, Stay Healthy!</Text>
                <Text style={styles.subtitle}>
                    Welcome to your personalized health and wellness app. Track your progress, and make better choices.
                </Text>

                <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack}>
                        <Animated.View 
                            style={[styles.sliderThumb, { transform: [{ translateX: pan }] }]}
                            {...panResponder.panHandlers}
                        />
                    </View>
                    <Animated.Text style={[styles.sliderText, { opacity: textOpacity }]}>
                        Swipe to continue
                    </Animated.Text>
                </View>

                <Text style={styles.note}>
                    Note: By clicking the Continue button, you agree to our terms and conditions.
                </Text>
            </Animatable.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',  
    },
    footer: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 25,
        paddingVertical: 30,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: "white",
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: "white",
        marginTop: 20,
        textAlign: 'center',
    },
    note: {
        marginTop: 15,
        color: "white",
        fontSize: 12,
        textAlign: 'center',
    },
    sliderContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    sliderTrack: {
        width: SLIDER_WIDTH,
        height: 50,
        backgroundColor: '#00382a',
        borderRadius: 25,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    sliderThumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 20,
        backgroundColor: Colors.WHITE,
        left: 5,
    },
    sliderText: {
        position: 'absolute',
        color: 'white',
        fontWeight: 'bold',
        top: 15,
        zIndex: 1,
    },
});