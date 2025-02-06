import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet, ScrollView } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

// Known health-related service and characteristic UUIDs
const HEALTH_SERVICES = {
  HEART_RATE: '180D',
  BATTERY: '180F',
  HEALTH_THERMOMETER: '1809',
  PULSE_OXIMETER: '1822',
  STEP_COUNT: '1814',
};

const CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '2A37',
  BATTERY_LEVEL: '2A19',
  TEMPERATURE_MEASUREMENT: '2A1C',
  SPO2_MEASUREMENT: '2A5F',
  STEP_COUNT: '2A53',
};

const BluetoothHealthMonitor = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manager] = useState(new BleManager());
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: null,
    spo2: null,
    temperature: null,
    stepCount: null,
    battery: null,
  });
  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (connectedDevice) {
        disconnectDevice();
      }
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      try {
        const results = await Promise.all(
          permissions.map(permission => PermissionsAndroid.request(permission))
        );
        
        if (results.every(result => result === PermissionsAndroid.RESULTS.GRANTED)) {
          console.log('All permissions granted');
        } else {
          console.log('Some permissions denied');
        }
      } catch (err) {
        console.warn('Permission request error:', err);
      }
    }
  };

  const startScan = () => {
    setScanning(true);
    setDevices([]);

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error('Scanning error:', error);
        setScanning(false);
        return;
      }

      if (scannedDevice && scannedDevice.name) {
        setDevices(prevDevices => {
          if (!prevDevices.some(device => device.id === scannedDevice.id)) {
            return [...prevDevices, scannedDevice];
          }
          return prevDevices;
        });
      }
    });

    // Stop scan after 10 seconds
    setTimeout(() => {
      stopScan();
    }, 10000);
  };

  const stopScan = () => {
    setScanning(false);
    manager.stopDeviceScan();
  };

  const connectToDevice = async (deviceId) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;

      const connectedDevice = await manager.connectToDevice(deviceId);
      setConnectedDevice(connectedDevice);
      
      await connectedDevice.discoverAllServicesAndCharacteristics();
      const services = await connectedDevice.services();
      
      const availableHealthServices = services
        .filter(service => Object.values(HEALTH_SERVICES).includes(service.uuid.substring(4, 8).toUpperCase()))
        .map(service => service.uuid);
      
      setAvailableServices(availableHealthServices);
      
      // Start monitoring each available health service
      availableHealthServices.forEach(serviceUuid => {
        monitorHealthService(connectedDevice, serviceUuid);
      });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const monitorHealthService = async (device, serviceUuid) => {
    try {
      const characteristics = await device.characteristicsForService(serviceUuid);
      
      characteristics.forEach(characteristic => {
        const shortUuid = characteristic.uuid.substring(4, 8).toUpperCase();
        
        if (Object.values(CHARACTERISTICS).includes(shortUuid)) {
          characteristic.monitor((error, char) => {
            if (error) {
              console.error(`Monitoring error for ${shortUuid}:`, error);
              return;
            }
            
            const value = processHealthData(shortUuid, char.value);
            updateHealthMetric(shortUuid, value);
          });
        }
      });
    } catch (error) {
      console.error('Service monitoring error:', error);
    }
  };

  const processHealthData = (characteristicUuid, data) => {
    if (!data) return null;
    
    const buffer = Buffer.from(data, 'base64');
    
    switch (characteristicUuid) {
      case CHARACTERISTICS.HEART_RATE_MEASUREMENT:
        return buffer.readUInt8(1);
      case CHARACTERISTICS.BATTERY_LEVEL:
        return buffer.readUInt8(0);
      case CHARACTERISTICS.SPO2_MEASUREMENT:
        return buffer.readUInt8(1);
      case CHARACTERISTICS.STEP_COUNT:
        return buffer.readUInt16LE(1);
      case CHARACTERISTICS.TEMPERATURE_MEASUREMENT:
        return buffer.readFloatLE(1).toFixed(1);
      default:
        return null;
    }
  };

  const updateHealthMetric = (characteristicUuid, value) => {
    setHealthMetrics(prev => {
      const updates = { ...prev };
      
      switch (characteristicUuid) {
        case CHARACTERISTICS.HEART_RATE_MEASUREMENT:
          updates.heartRate = value;
          break;
        case CHARACTERISTICS.BATTERY_LEVEL:
          updates.battery = value;
          break;
        case CHARACTERISTICS.SPO2_MEASUREMENT:
          updates.spo2 = value;
          break;
        case CHARACTERISTICS.STEP_COUNT:
          updates.stepCount = value;
          break;
        case CHARACTERISTICS.TEMPERATURE_MEASUREMENT:
          updates.temperature = value;
          break;
      }
      
      return updates;
    });
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setHealthMetrics({
          heartRate: null,
          spo2: null,
          temperature: null,
          stepCount: null,
          battery: null,
        });
        setAvailableServices([]);
      } catch (error) {
        console.error('Disconnection error:', error);
      }
    }
  };

  const renderMetricCard = (label, value, unit) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {value !== null ? `${value}${unit}` : 'Not available'}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Health Monitor</Text>

      <Button
        title={scanning ? "Stop Scanning" : "Start Scanning"}
        onPress={scanning ? stopScan : startScan}
      />

      {!connectedDevice && (
        <View style={styles.deviceList}>
          <Text style={styles.sectionHeader}>Available Devices</Text>
          {devices.map(device => (
            <View key={device.id} style={styles.deviceItem}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Button
                title="Connect"
                onPress={() => connectToDevice(device.id)}
              />
            </View>
          ))}
        </View>
      )}

      {connectedDevice && (
        <View style={styles.connectedSection}>
          <Text style={styles.connectedHeader}>
            Connected to: {connectedDevice.name}
          </Text>
          
          <View style={styles.metricsGrid}>
            {renderMetricCard('Heart Rate', healthMetrics.heartRate, ' bpm')}
            {renderMetricCard('SpO2', healthMetrics.spo2, '%')}
            {renderMetricCard('Temperature', healthMetrics.temperature, '°C')}
            {renderMetricCard('Steps', healthMetrics.stepCount, '')}
            {renderMetricCard('Battery', healthMetrics.battery, '%')}
          </View>

          <Button
            title="Disconnect"
            onPress={disconnectDevice}
            color="#ff4444"
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  deviceList: {
    marginTop: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    flex: 1,
  },
  connectedSection: {
    marginTop: 20,
  },
  connectedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default BluetoothHealthMonitor;