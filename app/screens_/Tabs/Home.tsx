// * React imports
import React from "react";

// * React Native imports
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

// * React Native Libraries imports
import { Button, TextInput } from "react-native-paper";
import { RFPercentage as s } from "react-native-responsive-fontsize";

import GradientText from "../../components/GradientText";

export default function Home() {
  return (
    <View>
      {/*  <GradientText
        gradient={["#667eea", "#43e97b"]}
        style={{
          //fontFamily: "Abel-Regular",
          fontSize: 30, //RFPercentage(5),
        }}
      >
        Tickets
      </GradientText> */}
      <Text
        style={{
          fontFamily: "Montez",
          fontSize: s(5),
        }}
      >
        Tickets
      </Text>
    </View>
  );
}
