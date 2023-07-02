import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Button } from 'react-native';
import { ROUTES } from '../../constants';

const TimerScreen = (props) => {
  const { navigation } = props;
  const [time, setTime] = useState(1500); // 25 minutes in seconds ~ pomodoro style
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionTopic, setSessionTopic] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (time === 0) {
      clearInterval(intervalRef.current);
      setIsActive(false);
      setIsPaused(false);
      setSessionCount((prevCount) => prevCount + 1);
      setTime(prevTime => (prevTime === 1500 ? 300 : 1500)); // Switch between 25 minutes and 5 minutes
      setSessionTopic(""); // Clear the session topic input
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, time]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setSessionCount((prevCount) => prevCount + 1);
    setTime(1500); // Reset time to 25 minutes for the next session
    setSessionTopic(""); // Clear the session topic input
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setSessionCount(0);
    setTime(1500);
    setSessionTopic(""); // Clear the session topic input
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button onPress={() => navigation.navigate(ROUTES.TIMER_LOGS)} title="Go to History"/>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isActive && styles.disabledInput]}
          value={sessionTopic}
          onChangeText={setSessionTopic}
          placeholder="Enter session topic"
          editable={!isActive}
        />
      </View>
      <TouchableOpacity
        style={styles.timerContainer}
        onPress={handleStart}
        disabled={isActive}
      >
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime()}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        {!isActive ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStart}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.pauseButton]}
              onPress={handlePause}
            >
              <Text style={styles.buttonText}>
                {isPaused ? "Resume" : "Pause"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.sessionCount}>
        Session Count: {sessionCount}
      </Text>
    </View>
  );
};

export default TimerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#e3e3e3",
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#e3e3e3",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: "#32CD32",
    marginRight: 10,
  },
  resetButton: {
    backgroundColor: "#e3e3e3",
  },
  stopButton: {
    backgroundColor: "#FF0000",
    marginRight: 10,
  },
  pauseButton: {
    backgroundColor: "#FFA500",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  sessionCount: {
    fontSize: 16,
    marginTop: 20,
  }
});
