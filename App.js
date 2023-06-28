import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NativeModules, DeviceEventEmitter, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';

const { CallNativeModule } = NativeModules;

async function requestPhoneStatePermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      {
        title: "Call Notification Permission",
        message: "This app needs access to your phone state to detect incoming calls.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can read phone state");
    } else {
      console.log("Phone state permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

function App() {
  useEffect(() => {
    console.log('App mounted');
    requestPhoneStatePermission()
      .then(() => {
        CallNativeModule.startListening();

        CallNativeModule.getChannelId()
          .then(channelId => {
            console.log('Channel ID:', channelId); 
            const subscription = DeviceEventEmitter.addListener('incomingCall', (data) => {
              const phoneNumber = data.phoneNumber || 'Unknown'; // Unknown if phone number is not available
              PushNotification.localNotification({
                channelId: channelId,
                title: 'RN_call_notification',
                message: `Incoming call from ${phoneNumber}`,
              });
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
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#252525'}}>
      <Text style={{fontSize: 13, fontWeight: 'bold', color: 'white'}}>
        Incoming Call Notification
      </Text>
    </View>
  )
  
}

export default App;
