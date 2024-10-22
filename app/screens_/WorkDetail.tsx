import React, {useState, useEffect, useRef} from 'react';
import {Dimensions, StyleSheet, Text, View, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
  CameraPermissionStatus,
} from 'react-native-vision-camera';

import RNFS from 'react-native-fs';

import {URL, useAuthStore} from '../store';

export default function WorkDetail({navigation}: {navigation: any}) {
  const token = useAuthStore(state => state.token);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  const devices = useCameraDevices();
  const device = devices.back;

  const camera = useRef<Camera>(null);

  useEffect(() => {
    //Camera.getCameraPermissionStatus().then(setCameraPermission);
    (async () => {
      const status = await Camera.requestCameraPermission();
      setCameraPermission(status === 'authorized');
    })();
  }, []);

  if (cameraPermission == null) return null;

  const showPermissionsPage = cameraPermission !== 'authorized';

  const TakePhoto = async () => {
    const photo = await camera.current.takePhoto({
      flash: 'off',
    });

    const upload = (response: any) => {
      var jobId = response.jobId;
      console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
    };

    const uploadProgress = (response: any) => {
      const percentage = Math.floor(
        (response.totalBytesSent / response.totalBytesExpectedToSend) * 100,
      );
      console.log('UPLOAD IS ' + percentage + '% DONE!');
    };

    RNFS.uploadFiles({
      toUrl: URL() + 'upload',
      files: [
        {
          name: 'Work Detail',
          filename: 'WorkDetail.jpg',
          filepath: photo.path,
          filetype: 'image/jpeg',
        },
      ],
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
      fields: {
        hello: 'world',
      },
      //begin: upload,
      //progress: uploadProgress,
    })
      .promise.then(response => {
        if (response.statusCode == 200) {
          console.log(response.body); // response.statusCode, response.headers, response.body
          navigation.goBack();
        } else {
          console.log('SERVER ERROR');
        }
      })
      .catch(err => {
        if (err.description === 'cancelled') {
          // cancelled by user
        }
        console.log(err);
      });
  };

  /* const newCameraPermission = await Camera.requestCameraPermission()

  const cameraPermission = await Camera.getCameraPermissionStatus();

  const devices = useCameraDevices()
  const device = devices.back

  if (device == null) return <LoadingView />
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  ) */

  return (
    device != null &&
    cameraPermission && (
      <>
        <Camera
          ref={camera}
          style={{
            flex: 1,
          }}
          photo={true}
          device={device}
          isActive={cameraActive}
        />
        <Button title="Take Photo" onPress={TakePhoto} />
      </>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '90%',
    height: '40%',
  },
});
