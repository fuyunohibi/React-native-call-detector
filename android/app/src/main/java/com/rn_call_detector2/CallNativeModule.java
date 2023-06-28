package com.rn_call_detector2;

import android.Manifest;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.telephony.TelephonyManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CallNativeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private PhoneStateReceiver phoneStateReceiver;

    public CallNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "CallNativeModule";
    }

    @ReactMethod
    public void startListening() {
        // Check if we have the permission
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            // If not, ask for it
            ActivityCompat.requestPermissions(reactContext.getCurrentActivity(), new String[] {Manifest.permission.READ_PHONE_STATE}, 0);
        } else {
            // We already have the permission, do the sensitive stuff
            doSensitiveStuff();
        }
    }

    @ReactMethod
    public void stopListening() {
        if(phoneStateReceiver != null) {
            reactContext.unregisterReceiver(phoneStateReceiver);
            phoneStateReceiver = null;
        }
    }

    private void doSensitiveStuff() {
        phoneStateReceiver = new PhoneStateReceiver(reactContext);
        IntentFilter filter = new IntentFilter();
        filter.addAction(TelephonyManager.ACTION_PHONE_STATE_CHANGED);
        reactContext.registerReceiver(phoneStateReceiver, filter);
    }
}
