import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Button, View } from 'react-native';

import {
  DownloadDirectoryPath,
  DocumentDirectoryPath,
  downloadFile,
  mkdir,
  exists,
  readDir,
  LibraryDirectoryPath,
  ReadDirResItemT,
} from '@dr.pogodin/react-native-fs';
import { AUDIO_URL, DOWNLOADS_PATH, usePlayerStore } from '../store';
import StatusBarX from '../components/StatusBarX';
import LinearGradientX from '../components/LinearGradientX';
import Footer from '../components/Footer';
import { FlashList } from '@shopify/flash-list';
import { queryClient } from '../../App';
import ListItem from '../components/ListItem';
import { TrackProps } from '../types';
import { Text } from 'react-native-paper';

// type DownloadFileOptions = {
//   fromUrl: string;
//   toFile: string;
//   headers?: StringMapT;
//   background?: boolean;
//   discretionary?: boolean;
//   cacheable?: boolean;
//   progressInterval?: number;
//   progressDivider?: number;
//   begin?: (res: DownloadBeginCallbackResultT) => void;
//   progress?: (res: DownloadProgressCallbackResultT) => void;
//   resumable?: () => void;
//   connectionTimeout?: number;
//   readTimeout?: number;
//   backgroundTimeout?: number;
// };

export default function Downloads({ navigation }: { navigation: any }) {
  const palette = usePlayerStore(state => state.palette);

  const [files, setFiles] = useState<ReadDirResItemT[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: palette[1] ?? '#000' },
    });
  });

  useEffect(() => {
    readDir(DOWNLOADS_PATH).then(files => setFiles(files));
  }, []);

  return (
    <>
      <StatusBarX />

      <LinearGradientX />

      {files.length > 0 && (
        <FlashList
          data={files}
          keyExtractor={(_, index) => index.toString()}
          estimatedItemSize={10}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
          }}
          renderItem={({ item }) => (
            <View>
              <Text>{item.name}</Text>
              <Text>{item.size}</Text>
            </View>
          )}
        />
      )}

      {/* <View
        style={{
          flex: 1,
          gap: 20,
          paddingHorizontal: 10,
          paddingTop: 20,
        }}>
          
        </View> */}

      <Footer />
    </>
  );
}
