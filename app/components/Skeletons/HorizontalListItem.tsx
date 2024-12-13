// * React
import React from 'react';

// * React Native
import {View, FlatList, Text} from 'react-native';

// * Libraries
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// * Store
import {WIDTH} from '../../store';

export default function HorizontalListItem({borderRadius = 10}) {
  return (
    <FlatList
      data={new Array(Number((WIDTH / 150).toFixed(0))).fill(0)}
      horizontal
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={{paddingLeft: 10}}
      renderItem={() => (
        <SkeletonPlaceholder highlightColor="#fff5" backgroundColor="#fff5">
          <View style={{paddingRight: 30}}>
            <View
              style={{
                borderRadius,
                marginBottom: 10,
                height: 100,
                width: 100,
              }}
            />
            <View style={{borderRadius: 5, gap: 8}}>
              <Text style={{fontSize: 14, lineHeight: 16}} />
              <Text style={{fontSize: 14, lineHeight: 8, width: 60}} />
              <Text style={{fontSize: 14, lineHeight: 10, width: 40}} />
            </View>
          </View>
        </SkeletonPlaceholder>
      )}
    />
  );
}
