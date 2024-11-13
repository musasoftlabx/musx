// * React
import React, {useCallback, useRef} from 'react';

// * React Native
import {ActivityIndicator, Image, View} from 'react-native';

// * Libraries
import {Shadow} from 'react-native-shadow-2';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import TrackPlayer, {State} from 'react-native-track-player';

// * Store
import {usePlayerStore, WIDTH} from '../../../store';

// * Assets
import imageFiller from '../../../assets/images/image-filler.png';

export default function CarouselQueue() {
  // ? Refs
  const ref = useRef<ICarouselInstance>(null);

  // ? StoreStates
  const {state} = usePlayerStore(state => state.playbackState);
  const activeTrackIndex = usePlayerStore(state => state.activeTrackIndex);
  const queue = usePlayerStore(state => state.queue);

  // ? Constants
  const isBuffering = state === State.Buffering;
  const isLoading = state === State.Loading;

  const CarouselCallback = useCallback(
    () =>
      isBuffering || isLoading ? (
        <View style={{width: WIDTH, height: WIDTH * 0.05}}>
          <ActivityIndicator size="large" color="#fff" style={{top: '900%'}} />
        </View>
      ) : (
        <Carousel
          ref={ref}
          width={WIDTH}
          height={WIDTH}
          mode="parallax"
          enabled={false}
          snapEnabled={true}
          loop={false}
          scrollAnimationDuration={2000}
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 130,
          }}
          data={queue.map(({artwork}) => artwork) as string[]}
          defaultIndex={activeTrackIndex}
          onSnapToItem={index => TrackPlayer.skip(index)}
          // data={
          //   [
          //     ...queue
          //       .slice(activeTrackIndex! - 1, activeTrackIndex)
          //       .map(({artwork}) => artwork),
          //     ...queue
          //       .slice(activeTrackIndex, activeTrackIndex! + 2)
          //       .map(({artwork}) => artwork),
          //   ] as string[]
          // }
          // defaultIndex={
          //   activeTrackIndex === 0
          //     ? 0
          //     : activeTrackIndex === queue.length
          //     ? 2
          //     : 1
          // }
          // onSnapToItem={async index => {
          //   if (index < 1) {
          //     if (position <= 10) TrackPlayer.skipToPrevious();
          //     else TrackPlayer.seekTo(0);

          //     if (activeTrackIndex != 0) {
          //       ref.current?.next();
          //       setCarouselQueue([
          //         queue.splice(activeTrackIndex - 2, 1)[0].artwork!,
          //         carouselQueue[0],
          //         carouselQueue[1],
          //       ]);
          //     }
          //   } else if (index > 1) {
          //     TrackPlayer.skipToNext();
          //     if (activeTrackIndex != queue.length) {
          //       ref.current?.prev();
          //       setCarouselQueue([
          //         carouselQueue[1],
          //         carouselQueue[2],
          //         queue.splice(activeTrackIndex + 2, 1)[0].artwork!,
          //       ]);
          //     }
          //   }
          // }}
          renderItem={({index, item}: {index: number; item: string}) => (
            <Shadow
              startColor={
                activeTrackIndex! === index ? `#00000066` : '#00000000'
              }
              distance={3}>
              <Image
                source={item ? {uri: item} : imageFiller}
                style={{height: WIDTH, width: WIDTH, borderRadius: 15}}
              />
            </Shadow>
          )}
        />
      ),
    [activeTrackIndex, queue, state],
  );

  return <CarouselCallback />;
}
