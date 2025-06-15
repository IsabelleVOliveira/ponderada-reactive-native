# Sistema de Login com OTP em React Native

Este é um sistema de login que utiliza autenticação de dois fatores (2FA) através de OTP (One-Time Password) enviado por email, desenvolvido em React Native.

## Requisitos

- Python 3.7+ (para o backend)
- Node.js 14+
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS, apenas em macOS)

## Configuração do Backend

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Configure as credenciais de email no arquivo `utils.py`:
- Substitua `SMTP_EMAIL` pelo seu email do Gmail
- Substitua `SMTP_PASSWORD` pela sua senha de aplicativo do Gmail

4. Inicie o servidor backend:
```bash
uvicorn main:app --reload
```

## Configuração do Frontend (React Native)

1. Navegue até a pasta do frontend:
```bash
cd projetao
```

2. Instale as dependências:
```bash
npm install
```

3. Para Android:
```bash
npx react-native run-android
```

4. Para iOS (apenas em macOS):
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## Funcionalidades

- Login com email
- Envio de código OTP por email
- Verificação de OTP
- Interface moderna e responsiva
- Armazenamento seguro de dados de usuário
- Suporte a Android e iOS

## Segurança

- O sistema armazena apenas o email do usuário
- OTP expira após 5 minutos
- Validação de email em tempo real
- Proteção contra tentativas de força bruta

## Notas Importantes

1. Para desenvolvimento em Android:
   - Certifique-se de ter o Android Studio instalado
   - Configure as variáveis de ambiente ANDROID_HOME
   - Tenha um emulador Android rodando ou um dispositivo físico conectado

2. Para desenvolvimento em iOS (apenas em macOS):
   - Certifique-se de ter o Xcode instalado
   - Instale o CocoaPods
   - Tenha um simulador iOS ou dispositivo físico

3. Para testar em um dispositivo físico:
   - Certifique-se de que o dispositivo e o computador estão na mesma rede
   - Atualize o `API_URL` no arquivo `App.js` para o IP do seu computador na rede local