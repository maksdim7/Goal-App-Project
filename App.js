import { useState } from "react";
import { StyleSheet, View, FlatList, Button } from "react-native";
import { StatusBar } from "expo-status-bar";

import GoalItem from "./components/GoalItem";
import GoalInput from "./components/GoalInput";
import * as Notifications from "expo-notifications";

export default function App() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [courseGoals, setCourseGoals] = useState([]);

  function startAddGoalHandler() {
    setModalIsVisible(true);
  }

  function endAddGoalHandler() {
    setModalIsVisible(false);
  }

  function addGoalHandler(text, notificationId) {
    setCourseGoals((currentGoals) => [
      ...currentGoals,
      { id: Math.random().toString(), text, notificationId },
    ]);
  }

  function deleteGoalHandler(id) {
    const goalToRemove = courseGoals.find((goal) => goal.id === id);

    if (goalToRemove && goalToRemove.notificationId) {
      Notifications.cancelScheduledNotificationAsync(
        goalToRemove.notificationId
      );
      console.log("removing notification");
    }

    setCourseGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== id)
    );
  }

  return (
    <>
      <StatusBar style="inverted" />
      <View style={styles.appContainer}>
        <Button
          title="Добави нова цел"
          color="#000000"
          onPress={startAddGoalHandler}
        />
        <GoalInput
          visible={modalIsVisible}
          onAddGoal={addGoalHandler} 
          onCancel={endAddGoalHandler}
          onScheduled={(id) => console.log("Scheduled ID:", id)}
        />
        <View style={styles.goalsContainer}>
          <FlatList
            data={courseGoals}
            renderItem={(itemData) => {
              return (
                <GoalItem
                  text={itemData.item.text}
                  id={itemData.item.id}
                  onDeleteItem={deleteGoalHandler}
                />
              );
            }}
            keyExtractor={(item, index) => {
              return item.id;
            }}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  goalsContainer: {
    flex: 6,
  },
  appContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#E9B44C",
  },
});
