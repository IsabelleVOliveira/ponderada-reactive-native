import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { TextInput } from 'react-native';


const PAGE_SIZE = 100;

const App = () => {
  const navigation = useNavigation();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [descricaoImagem, setDescricaoImagem] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [precoImagem, setPrecoImagem] = useState('');


  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await fetch(`https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`);
      const json = await res.json();

      if (json.products.length > 0) {
        setItems(prev => [...prev, ...json.products]);
        setSkip(prev => prev + PAGE_SIZE);
        if (json.products.length < PAGE_SIZE) setHasMore(false); // Chegou no final
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchItems(); // Primeira carga
    Alert.alert('Bem-vindo!', 'Estamos felizes em te ver aqui novamente 😊');

  }, []);

  const abrirCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permissão para acessar a câmera negada.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      Alert.alert('Sucesso', 'Foto tirada com sucesso!');
    }
  };


  const abrirGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permissão para acessar a galeria negada.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagemSelecionada(resultado.assets[0].uri);
      setModalVisivel(true); // Abre o modal para digitar a descrição
    }
  };




  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };


  const adicionarItemComDescricao = () => {
    if (!descricaoImagem.trim() || !precoImagem.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a descrição e o preço.');
      return;
    }

    const novoItem = {
      id: Date.now(),
      title: 'Produto da Galeria',
      description: descricaoImagem,
      price: parseFloat(precoImagem),
      thumbnail: imagemSelecionada,
    };

    setItems(prevItems => [novoItem, ...prevItems]);
    setDescricaoImagem('');
    setPrecoImagem('');
    setImagemSelecionada(null);
    setModalVisivel(false);

    Alert.alert('Sucesso', 'Imagem adicionada com sucesso!');
  };



  return (

    <View style={styles.container}>
      <UserHeader> </UserHeader>
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}

        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleItem(item.id)}>
            <View style={styles.card}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.image}
                resizeMode="cover"
              />
              {expandedItems[item.id] && (
                <>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text>{item.description}</Text>
                  <Text style={styles.price}>${item.price}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
        onEndReached={fetchItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="large" /> : null}
      />

      {/* <TouchableOpacity
        onPress={() => navigation.navigate('CameraScreen')}
        className="absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-md"
      >
        <Text className="text-white text-xl font-bold">📷</Text>
      </TouchableOpacity> */}

      <View style={{ position: 'absolute', bottom: 20, right: 20, alignItems: 'center', gap: 16 }}>
        <TouchableOpacity
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#9333ea', justifyContent: 'center', alignItems: 'center', elevation: 5 }}
          onPress={abrirGaleria}
        >
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', elevation: 5 }}
          onPress={abrirCamera}
        >
          <Ionicons name="camera" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {modalVisivel && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Descrição da imagem:</Text>
            <TextInput
              value={descricaoImagem}
              onChangeText={setDescricaoImagem}
              placeholder="Digite uma descrição"
              style={styles.input}
            />

            <Text style={{ marginTop: 10, marginBottom: 5, fontWeight: 'bold' }}>Preço:</Text>
            <TextInput
              value={precoImagem}
              onChangeText={setPrecoImagem}
              placeholder="Digite o valor (ex: 99.90)"
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Text style={{ color: 'red' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={adicionarItemComDescricao}>
                <Text style={{ color: 'green' }}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


    </View>

  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  image: { width: '100%', height: 200, borderRadius: 6, marginBottom: 10 },
  price: { fontWeight: 'bold', marginTop: 6, color: '#2b8a3e' }, modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },


});