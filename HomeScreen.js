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
    globalGold,      // <-- Add this
    updateGlobalGold,
    updatePet
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
  
  // Calculate percentages, ensuring no division by zero
  const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const xpPercent = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

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
              style={{ width: 150, height: 150 }}
              accessibilityLabel={name}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.petStatText}>Attack: {attack}</Text>
          
          {/* --- HP Bar --- */}
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.hpBar, { width: `${hpPercent}%` }]} />
            </View>
            <Text style={styles.barText}>HP: {hp}/{maxHp}</Text>
          </View>

          {/* --- XP Bar --- */}
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.xpBar, { width: `${xpPercent}%` }]} />
            </View>
            <Text style={styles.barText}>Lvl {level} ({xp}/{xpToNextLevel} XP)</Text>
          </View>          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => {
              console.log("Feed button pressed."); // Log 1
              if (!selectedPet) {
                  console.log("No pet selected, exiting."); // Log 2
                  alert("No pet selected!");
                  return;
              }
              console.log(`Pet HP: ${selectedPet.hp}, Max HP: ${selectedPet.maxHp}`); // Log 3
              if(selectedPet.hp >= selectedPet.maxHp) {
                console.log("HP is full, exiting."); // Log 4
                alert("HP is already full!");
                return;
              }
              console.log(`Global Gold: ${globalGold}`); // Log 5
              if (globalGold < 5) {
                console.log("Not enough gold, exiting."); // Log 6
                alert("Not enough gold to feed!");
                return;
              }
              console.log("Updating gold and HP..."); // Log 7
              updateGlobalGold(g => g - 5);
              updatePet(selectedPetId, (p) => ({ hp: Math.min(p.maxHp, p.hp + 2) }));
            }}>
            <Text style={styles.buttonText}>Feed</Text>
          </TouchableOpacity>
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
    justifyContent: 'center', // Changed from 'space-between'
    paddingTop: -50, // Add some top padding
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
    backgroundColor: '#9a9a9aff',
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
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8, // Added margin for spacing
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
    marginTop: 12,
    fontSize: 14,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: 100,
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
  // --- NEW STYLES FOR BARS ---
  barContainer: {
    width: '90%',
    marginTop: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden', // Ensures inner bar stays rounded
  },
  hpBar: {
    height: '100%',
    backgroundColor: '#28a745', // Green for HP
    borderRadius: 10,
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#8a2be2', // Purple for XP
    borderRadius: 10,
  },
  barText: {
    position: 'absolute',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    // Add a slight shadow to make text readable on any color
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});