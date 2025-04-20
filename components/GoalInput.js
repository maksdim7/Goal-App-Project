import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Modal,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

function GoalInput(props) {
  const [enteredGoalText, setEnteredGoalText] = useState("");
  const [showError, setShowError] = useState(false);
  const errorOpacity = useRef(new Animated.Value(0)).current;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [notificationId, setNotificationId] = useState(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowAlert: true,
      }),
    });
  }, []);

  function showPickerHandler() {
    setShowDatePicker(true);
  }

  function onDateChange(event, date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (!date) return;
      setSelectedDate(
        (prev) =>
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            prev.getHours(),
            prev.getMinutes()
          )
      );
      setShowTimePicker(true);
    } else {
      setShowDatePicker(Platform.OS === "ios");
      if (date) setSelectedDate(date);
    }
  }

  function onTimeChange(event, date) {
    setShowTimePicker(false);
    if (!date) return;
    setSelectedDate(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth(),
          prev.getDate(),
          date.getHours(),
          date.getMinutes()
        )
    );
  }

  async function scheduleNotificationHandler() {
    if (selectedDate <= new Date()) {
      Alert.alert(
        "Невалидна дата",
        "Моля, изберете бъдеща дата и час за напомнянето."
      );
      return;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Напомяне",
        body: enteredGoalText,
        data: { goal: enteredGoalText },
      },
      trigger: selectedDate,
    });
    setNotificationId(id);
    props.onScheduled(id);
  }

  function goalInputHandler(text) {
    setEnteredGoalText(text);
    if (text.trim().length > 0) setShowError(false);
  }

  function addGoalHandler() {
    if (enteredGoalText.trim().length === 0) {
      setShowError(true);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowError(false));
      }, 2000);
      return;
    }
    props.onAddGoal(enteredGoalText, notificationId);
    setEnteredGoalText("");
  }

  return (
    <Modal visible={props.visible} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.inputContainer}>
          <Image
            style={styles.image}
            source={require("../assets/images/goal.png")}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Въведи твоята цел!"
            onChangeText={goalInputHandler}
            value={enteredGoalText}
          />
          {showError && (
            <Animated.View
              style={[styles.errorContainer, { opacity: errorOpacity }]}
            >
              <Text style={styles.errorText}>Моля въведи цел!</Text>
            </Animated.View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Избери дата и час"
              onPress={showPickerHandler}
              color="#0096C7"
            />
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode={Platform.OS === "ios" ? "datetime" : "date"}
              minimumDate={new Date()}
              display="default"
              onChange={onDateChange}
            />
          )}
          {showTimePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Напомняне"
              onPress={scheduleNotificationHandler}
              color="#00b094"
            />
          </View>

          <View style={styles.buttonContainerRow}>
            <View style={styles.button}>
              <Button title="Въведи" onPress={addGoalHandler} color="#b180f0" />
            </View>
            <View style={styles.button}>
              <Button title="Назад" onPress={props.onCancel} color="#f31282" />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default GoalInput;

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E9B44C",
  },
  image: { width: 100, height: 100, margin: 20 },
  textInput: {
    width: "100%",
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e4d0ff",
    backgroundColor: "#FFFFFF",
    color: "#120438",
  },
  errorContainer: {
    marginTop: 8,
    backgroundColor: "#fddede",
    padding: 8,
    borderRadius: 6,
    width: "100%",
  },
  errorText: { 
    color: "#d10000", 
    textAlign: "center" 
  },
  buttonContainer: { 
    marginVertical: 8 
  },
  buttonContainerRow: { 
    flexDirection: "row",
    marginTop: 16 
  },
  button: { 
    width: 100, 
    marginHorizontal: 8 
  },
});
