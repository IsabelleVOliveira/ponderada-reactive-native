import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TelaLogin from '../components/TelaLogin';
import TelaCadastro from '../components/TelaCadastro';
import TelaPrincipal from '../components/TelaPrincipal';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff0f5' }
        }}
      >
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="TelaPrincipal" component={TelaPrincipal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 