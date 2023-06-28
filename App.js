import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeModules, DeviceEventEmitter, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';
import Modal from 'react-native-modal';

const { CallNativeModule } = NativeModules;

async function requestPhoneStatePermission() {
  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    ];

    const grantResult = await PermissionsAndroid.requestMultiple(permissions, {
      title: "Call Notification Permission",
      message:
        "This app needs access to your phone state and call log to detect incoming calls.",
      buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK",
    });

    if (
      grantResult['android.permission.READ_PHONE_STATE'] === 'granted' &&
      grantResult['android.permission.READ_CALL_LOG'] === 'granted'
    ) {
      console.log("You can read phone state and call log");
    } else {
      console.log("Phone state or call log permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

function App() {
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallPhoneNumber, setIncomingCallPhoneNumber] = useState('');

  useEffect(() => {
    console.log('App mounted');
    requestPhoneStatePermission()
      .then(() => {
        CallNativeModule.startListening();

        CallNativeModule.getChannelId()
          .then(channelId => {
            console.log('Channel ID:', channelId);

            const subscription = DeviceEventEmitter.addListener('incomingCall', (data) => {
              console.log('Incoming call from:', data.phoneNumber);
              const phoneNumber = data.phoneNumber || 'Unknown';
              PushNotification.localNotification({
                channelId: channelId,
                title: 'RN_call_notification',
                message: `Incoming call from ${phoneNumber}`,
              });
              setIncomingCall(true);
              setIncomingCallPhoneNumber(phoneNumber);

              // Simulate call duration and update incomingCall state after the call ends
              setTimeout(() => {
                setIncomingCall(false);
              }, 3000); // Change the timeout value to match the actual call duration
            });

            return () => {
              subscription.remove();
              CallNativeModule.stopListening();
            };
          })
          .catch(error => {
            console.log('Error retrieving channel ID:', error);
          });
      });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#252525' }}>
      <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }}>Incoming Call Notification</Text>
      <Text style={{ fontSize: 12, fontWeight: 'medium', color: 'gray' }}>Incoming call notification will only work on Android</Text>
      {incomingCall && (
        <Modal isVisible={true} backdropColor="#252525" backdropOpacity={0.8}>
          <View style={{ backgroundColor: 'white', padding: 16, justifyContent: 'center', alignItems: 'center', borderRadius: 16, width: '80%', alignSelf: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Incoming Call</Text>
            <Text style={{ fontSize: 16 }}>Phone Number: {incomingCallPhoneNumber}</Text>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default App;
