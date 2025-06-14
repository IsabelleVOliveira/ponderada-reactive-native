import * as Google from 'expo-auth-session/providers/google';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'SEU_CLIENT_ID_EXPO',
    iosClientId: 'SEU_CLIENT_ID_IOS',
    androidClientId: 'SEU_CLIENT_ID_ANDROID',
    webClientId: 'SEU_CLIENT_ID_WEB',
  });

  return { request, response, promptAsync };
};
