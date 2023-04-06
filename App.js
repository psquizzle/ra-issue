import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Button } from 'react-native';
import Animated, { Easing, Extrapolate, Extrapolation, interpolate, interpolateNode, runOnJS, useAnimatedGestureHandler, useAnimatedProps, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withDecay, withSpring, withTiming } from "react-native-reanimated"
import { Audio } from "expo-av";
import React from 'react';
export default function App() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recording, setRecording] = React.useState();
  const meteringSharedValue = useSharedValue(-160);
  const widthCircle = useSharedValue(1);
  const onRecordingStatusUpdate = (recordStatus) => {
    if (recordStatus.metering) {
      //console.log(recordStatus.metering)
    meteringSharedValue.value = recordStatus.metering;
    }
  };


  const animatedStyle = useAnimatedStyle(() => {
    const interpolatedValue = interpolate(
      meteringSharedValue.value,
      [-160, -60, 0],
      [0, 30, 120],
      { extrapolateRight: Extrapolation.CLAMP }
    );
    widthCircle.value = withSpring(interpolatedValue)
    return {
      width: widthCircle.value,
      height: widthCircle.value,
      borderRadius: widthCircle.value / 2,
    };
  },[meteringSharedValue]);

  async function stopRecording() {

    console.log("Stopping recording..");
    setRecording(undefined);
    setIsRecording(false);

    await recording.stopAndUnloadAsync();
  }
  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');

      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
        
      );
      await recording.setProgressUpdateInterval(20);
      await recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }
  return (
    <View style={styles.container}>
        <View style={{height:250}}>
          <Animated.View style={[{backgroundColor:'red'},animatedStyle]}></Animated.View>
        </View>
      <Button onPress={startRecording} title='Start Recoding'></Button>
      <Button onPress={stopRecording} title='Stop Recoding'></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
