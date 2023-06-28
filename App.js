import { useEffect } from 'react';
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

        const subscription = DeviceEventEmitter.addListener('incomingCall', (data) => {
          PushNotification.localNotification({
            message: `Incoming call from ${data.phoneNumber}`,
          });
        });

        return () => {
          subscription.remove();
          CallNativeModule.stopListening();
        };
      });
  }, []);

  // rest of your app code here
}

export default App;
