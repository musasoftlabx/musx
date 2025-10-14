// * React
import React from 'react';

// * React Native
import { View, FlatList, Text } from 'react-native';

// * Libraries
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * Store
import { HEIGHT, LIST_ITEM_HEIGHT, WIDTH } from '../../store';

export default function VerticalListItem() {
  return (
    <FlatList
      data={new Array(Number((HEIGHT / LIST_ITEM_HEIGHT).toFixed(0))).fill(0)}
      keyExtractor={(_, index) => index.toString()}
      renderItem={() => (
        <SkeletonPlaceholder highlightColor="#fff5" backgroundColor="#fff5">
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              padding: 10,
            }}
          >
            <View
              style={{
                borderRadius: 10,
                marginRight: 10,
                width: 45,
                height: 45,
              }}
            />
            <View style={{ borderRadius: 5, gap: 8, width: WIDTH / 2 }}>
              <Text style={{ fontSize: 14, lineHeight: 18 }} />
              <Text style={{ fontSize: 14, lineHeight: 10 }} />
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ borderRadius: 5, gap: 8, width: 50 }}>
              <Text style={{ fontSize: 14, lineHeight: 18 }} />
              <Text style={{ fontSize: 14, lineHeight: 10 }} />
            </View>
          </View>
        </SkeletonPlaceholder>
      )}
    />
  );
}
