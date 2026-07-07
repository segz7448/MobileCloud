import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '@screens/HomeScreen';
import {darkTheme} from '@theme/index';

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.text,
    border: darkTheme.colors.border,
    primary: darkTheme.colors.primary,
  },
};

function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: darkTheme.colors.surface},
          headerTintColor: darkTheme.colors.text,
          contentStyle: {backgroundColor: darkTheme.colors.background},
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'MobileCloud'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
