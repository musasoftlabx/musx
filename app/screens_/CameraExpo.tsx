import React, { useState, useEffect, useRef } from "react";

import { NavigationContainer } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Linking,
  Button,
  Platform,
  TouchableOpacity,
} from "react-native";

import { Camera, CameraType } from "expo-camera";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  if (!permission) {
    return null;
  }

  if (permission.status !== "granted") {
    return (
      <View>
        <Text>We need permissions to use the camera</Text>
        {permission?.canAskAgain ? (
          <Button onPress={requestPermission} title="Give permission" />
        ) : (
          <Button onPress={Linking.openSettings} title="Open app settings" />
        )}
      </View>
    );
  }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />

      <Camera style={styles.camera} type={type}>
        <View>
          <TouchableOpacity onPress={toggleCameraType}>
            <Text style={{ color: "red", fontSize: 20 }}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "90%",
    height: "40%",
  },
});
