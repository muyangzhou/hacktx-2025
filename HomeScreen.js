// HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { usePets } from './App';
import { petImages } from './assets/petImages';

export default function HomeScreen({ navigate }) {
  const { 
    pets, 
    selectedPet, 
    selectedPetId, 
    setSelectedPetId, 
    addPet,
  } = usePets();

  const currentIndex = pets.findIndex(p => p.id === selectedPetId);

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + pets.length) % pets.length;
    setSelectedPetId(pets[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % pets.length;
    setSelectedPetId(pets[newIndex].id);
  };

  const handleAddPet = () => {
    const id = `p${Math.random().toString(36).slice(2, 7)}`;
    addPet({ id, name: 'New Pet', level: 1, hp: 20, maxHp: 20, attack: 5, xp: 0, xpToNextLevel: 100 });
  };


  if (!selectedPet) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{color: 'white', fontSize: 16}}>No pet selected.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddPet}>
            <Text style={styles.buttonText}>Add First Pet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { id, name, level, hp, maxHp, attack, xp, xpToNextLevel } = selectedPet;

  return (
    <View style={styles.container}>
      {/* --- Pet Browser and Action Hub --- */}
      <View style={styles.petBrowser}>
        <TouchableOpacity onPress={handlePrevious} style={styles.arrowButton}>
            <Text style={styles.arrowButtonText}>{'<'}</Text>
        </TouchableOpacity>
        
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{name}</Text>
          <View style={styles.petImageContainer}>
            <Image
              source={petImages[id]}
              style={{ width: 64, height: 64 }}
              accessibilityLabel={name}
            />
          </View>
          <Text style={styles.petStatText}>Level: {level} ({xp}/{xpToNextLevel} XP)</Text>
          <Text style={styles.petStatText}>HP: {hp}/{maxHp}</Text>
          <Text style={styles.petStatText}>Attack: {attack}</Text>
          
          <View style={styles.petActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigate('Battle')}>
                <Text style={styles.buttonText}>Battle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigate('Inventory')}>
                <Text style={styles.buttonText}>Inventory</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
            <Text style={styles.arrowButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* --- Global Action Buttons (REMOVED) --- */}
      {/* This section is now handled by the footer in App.js */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Padding removed, handled by App.js
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed from 'space-between'
    paddingTop: 20, // Add some top padding
  },
  petBrowser: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(162, 162, 163, 0.8)',
    borderRadius: 8,
    maxWidth: 420,
    width: '100%',
  },
  arrowButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  arrowButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  petInfo: {
    // textAlign: 'center', // Not needed, alignItems on children
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center', // Center pet info
  },
  petName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#FFFFFF'
  },
  petStatText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  petActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
  },
  petImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});