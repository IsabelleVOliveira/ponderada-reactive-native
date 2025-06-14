import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import LoginButton from '../components/LoginButton';
import colors from '../styles/colors';
import { useGoogleAuth } from '../config/googleAuth';
import axios from 'axios';

export default function LoginScreen() {
  const { response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      const userEmail = response.authentication.idToken; // normalmente é melhor obter dados com o endpoint do Google
      // Chama a API do backend para registrar o usuário
      axios.post('http://localhost:8000/login', { token: userEmail })
        .then(() => Alert.alert("Login feito com sucesso"))
        .catch(() => Alert.alert("Erro ao logar"));
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <LoginButton onPress={() => promptAsync()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
