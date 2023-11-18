import React, { useState } from 'react';
import { View, Text, TextInput, Image, Pressable, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as databaseRef, push } from "firebase/database";

// https://firebase.google.com/docs/web/setup#available-libraries

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkusyhQqt-7uFMwxSeyx8sJvCyI1QmlgE",
  authDomain: "cataform-4b18f.firebaseapp.com",
  projectId: "cataform-4b18f",
  storageBucket: "cataform-4b18f.appspot.com",
  messagingSenderId: "883918258880",
  appId: "1:883918258880:web:423b8c0d3813473acba325",
  measurementId: "G-700HEM63ZE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function App() {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState({ value: '', error: null });
  const [fecha, setFecha] = useState(''); 
  const [imagen, setImagen] = useState('');


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const response = await fetch(result.uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `imagenes/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      setImagen(downloadURL);
    }
  };


  const handleSubmit = () => {
    const numericDni = dni ? parseInt(dni) : '';
    const numericMonto = monto.value ? parseInt(monto.value) : '';
    const isoDateString = fecha ? new Date(fecha).toISOString() : '';

    const data = {
      dni: numericDni,
      nombre,
      monto: numericMonto,
      fecha: isoDateString,
      imagen,
    };


    const database = getDatabase();
    const databaseReference = databaseRef(database, 'formulario');
    push(databaseReference, data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>DNI:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setDni(text)}
        value={dni}
      />

      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setNombre(text)}
        value={nombre}
      />

      <Text style={styles.label}>Monto:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setMonto({ ...monto, value: text })}
        value={monto.value}
      />
      {monto.error ? <Text style={styles.errorText}>{monto.error}</Text> : null}

      <Text style={styles.label}>Fecha:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setFecha(text)}
        value={fecha}
      />

      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </Pressable>

      {imagen ? (
        <Image source={{ uri: imagen }} style={styles.image} />
      ) : null}
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enviar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});

