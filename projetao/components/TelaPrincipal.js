// App.jsx ou App.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import Footer from './Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAGE_SIZE = 100;

const App = () => {
  const navigation = useNavigation();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Campos do formulário modal
  const [nomeReceita, setNomeReceita] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [nota, setNota] = useState('');

  /* ---------- BUSCA DE RECEITAS (API) ---------- */
  const fetchItems = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await fetch(
        `https://dummyjson.com/recipes?limit=${PAGE_SIZE}&skip=${skip}`,
      );
      const json = await res.json();

      if (json.recipes?.length) {
        setItems(prev => [...prev, ...json.recipes]);
        setSkip(prev => prev + PAGE_SIZE);
        if (json.recipes.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ---------- CARREGAR RECEITAS SALVAS OU API ---------- */
  useEffect(() => {
    const carregarReceitas = async () => {
      try {
        const salvo = await AsyncStorage.getItem('receitas');
        if (salvo) {
          setItems(JSON.parse(salvo));
          setHasMore(false); // já temos dados locais
        } else {
          fetchItems();
        }
      } catch (err) {
        console.error('AsyncStorage error:', err);
      }
    };

    carregarReceitas();
    Alert.alert('Bem‑vindo!');
  }, []);

  /* ---------- CÂMERA E GALERIA ---------- */
  const abrirCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Habilite a câmera nas configurações.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!res.canceled) {
      setImagemSelecionada(res.assets[0].uri);
      setModalVisivel(true);
    }
  };

  const abrirGaleria = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Habilite a galeria nas configurações.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!res.canceled) {
      setImagemSelecionada(res.assets[0].uri);
      setModalVisivel(true);
    }
  };

  /* ---------- EXPANDIR/COLAPSAR ITEM ---------- */
  const toggleItem = id =>
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));

  /* ---------- ADICIONAR RECEITA MANUAL ---------- */
  const adicionarReceita = async () => {
    if (!nomeReceita.trim() || !ingredientes.trim() || !nota.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const novoItem = {
      id: Date.now(),
      title: nomeReceita,
      description: ingredientes,
      rating: parseFloat(nota),
      thumbnail: imagemSelecionada,
    };

    const novaLista = [novoItem, ...items];
    setItems(novaLista);
    setNomeReceita('');
    setIngredientes('');
    setNota('');
    setImagemSelecionada(null);
    setModalVisivel(false);

    try {
      await AsyncStorage.setItem('receitas', JSON.stringify(novaLista));
      Alert.alert('Sucesso', 'Receita adicionada!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      Alert.alert('Erro', 'Falha ao salvar a receita.');
    }
  };

  const handleImageSelected = (uri) => {
    setImagemSelecionada(uri);
    setModalVisivel(true);
  };

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleItem(item.id)}>
            <View style={styles.card}>
              <Image
                source={{ uri: item.image || item.thumbnail }}
                style={styles.image}
              />

              {expandedItems[item.id] && (
                <>
                  <Text style={styles.title}>
                    {item.name || item.title}
                  </Text>

                  {item.ingredients ? (
                    <Text style={styles.ingredients}>
                      Ingredientes:{' '}
                      {item.ingredients.slice(0, 4).join(', ')}
                      {item.ingredients.length > 4 ? '…' : ''}
                    </Text>
                  ) : (
                    <Text>{item.description}</Text>
                  )}

                  {item.rating !== undefined ? (
                    <Text style={styles.rating}>⭐ {item.rating}</Text>
                  ) : (
                    <Text style={styles.price}>
                      R$ {item.price?.toFixed(2) || '0.00'}
                    </Text>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
        onEndReached={fetchItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="large" /> : null
        }
        contentContainerStyle={styles.listContent}
      />

      <Footer onImageSelected={handleImageSelected} />

      {/* Modal */}
      {modalVisivel && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nome da Receita:</Text>
            <TextInput
              value={nomeReceita}
              onChangeText={setNomeReceita}
              placeholder="Nome"
              style={styles.input}
            />

            <Text style={styles.modalTitle}>Ingredientes:</Text>
            <TextInput
              value={ingredientes}
              onChangeText={setIngredientes}
              placeholder="Ex: farinha, ovo, leite"
              style={styles.input}
              multiline
            />

            <Text style={styles.modalTitle}>Nota (0‑5):</Text>
            <TextInput
              value={nota}
              onChangeText={setNota}
              placeholder="0 a 5"
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisivel(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={adicionarReceita}>
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}; // ← fecha o componente App

export default App;

/* ---------- ESTILOS ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingTop: 90, // Espaço para o Header
    paddingBottom: 80, // Espaço para o Footer
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  image: { width: '100%', height: 200, borderRadius: 6, marginBottom: 10 },
  ingredients: { fontStyle: 'italic' },
  rating: { marginTop: 4, color: '#f59e0b' },
  price: { fontWeight: 'bold', marginTop: 6, color: '#2b8a3e' },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '100%',
  },
  modalTitle: { marginBottom: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: { padding: 10 },
  cancelButtonText: { color: 'red' },
  confirmButtonText: { color: 'green' },
});
