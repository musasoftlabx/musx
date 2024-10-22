// * React Native imports
import {useWindowDimensions, View} from 'react-native';

// * React Native Libraries
import {useTheme} from 'react-native-paper';
import {RFPercentage as s} from 'react-native-responsive-fontsize';
import CalendarStrip from 'react-native-calendar-strip';

// * JS Libraries
import {Motion} from '@legendapp/motion';

// * Assets
import Previous from '../../assets/images/previous.png';
import Next from '../../assets/images/next.png';

export default function Kitchen() {
  const theme = useTheme();
  const {height} = useWindowDimensions();

  return (
    <View style={{backgroundColor: theme.colors.secondary, paddingTop: 50}}>
      <View style={{alignItems: 'center'}}>
        <Motion.Text
          animate={{x: 0, y: 0}}
          initial={{y: -50}}
          transition={{type: 'spring', damping: 20, stiffness: 400}}
          style={{color: 'white', fontFamily: 'Montez', fontSize: s(6)}}>
          Kitchen
        </Motion.Text>
      </View>

      <CalendarStrip
        scrollable
        //@ts-ignore
        maxDate={new Date().setDate(new Date().getDate() + 7)}
        //@ts-ignore
        datesBlacklist={date => date > new Date() && date}
        minDate={new Date('2022-02-28')}
        startingDate={new Date()}
        selectedDate={new Date()}
        style={{height: height * 0.15}}
        calendarColor={theme.colors.secondary}
        calendarHeaderStyle={{
          color: 'white',
          fontFamily: 'Abel',
          fontSize: s(3),
          fontWeight: 'normal',
        }}
        iconContainer={{flex: 0.2}}
        iconLeft={Previous}
        iconRight={Next}
        iconStyle={{height: 24, width: 24}}
        upperCaseDays={false}
        calendarAnimation={{type: 'sequence', duration: 100}}
        daySelectionAnimation={{
          //backgroundColor: 'red',
          borderWidth: 1,
          borderHighlightColor: 'white',
          duration: 200,
          //highlightColor: 'maroon',
          type: 'border',
        }}
        highlightDateContainerStyle={{
          backgroundColor: '#9e9d2430',
          borderRadius: 10,
          borderColor: 'yellow',
        }}
        dateNameStyle={{
          color: 'white',
          fontFamily: 'Laila',
          fontSize: s(1.2),
          marginTop: 1,
        }}
        dateNumberStyle={{
          color: 'white',
          fontFamily: 'Laila',
          fontSize: s(3),
          marginTop: -6,
        }}
        highlightDateNameStyle={{
          color: 'yellow',
          fontFamily: 'Laila',
          marginTop: 3,
        }}
        highlightDateNumberStyle={{
          color: 'yellow',
          fontFamily: 'Laila',
          fontSize: s(3),
          marginTop: -6,
        }}
        disabledDateNameStyle={{
          color: 'white',
          fontFamily: 'Laila',
          fontSize: s(1.2),
          marginTop: 1,
        }}
        disabledDateNumberStyle={{
          color: 'white',
          fontFamily: 'Laila',
          fontSize: s(3),
          marginTop: -6,
        }}
        onDateSelected={date => console.log(date)}
      />
    </View>
  );
}
