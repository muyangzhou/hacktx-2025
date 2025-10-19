// BattleScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { usePets } from './App';
import { petImages } from './assets/petImages';

export default function BattleScreen({ navigate }) {
  const { selectedPet, updatePet, addXp, updateGlobalGold } = usePets();
  const [enemyHp, setEnemyHp] = useState(30);

  // ... (All logic functions are unchanged) ...
  const getWeaponBuff = (pet) => {
    const inv = pet?.inventory || [];
    const weaponId = pet?.equipped?.weapon || null;
    if (!weaponId) return 0;
    const item = inv.find(i => i.id === weaponId);
    return Number(item?.power) || 0;
  };
  const baseAtk = Number(selectedPet?.attack) || 0;
  const atkBuff = getWeaponBuff(selectedPet);
  const effectiveAtk = baseAtk + atkBuff;

  const playerAttack = () => {
    if (enemyHp - effectiveAtk <= 0) {
      const goldWon = Math.floor(Math.random() * 10) + 5;
      const xpGained = Math.floor(Math.random() * 15) + 10; 

      updateGlobalGold(prev => prev + goldWon);
      addXp(selectedPet.id, xpGained);

      alert(`You won! Gained ${goldWon} gold and ${xpGained} XP!`);
      
      setEnemyHp(30); 
    } else {
      setEnemyHp(h => Math.max(0, h - effectiveAtk));
    }
  };

  const enemyAttack = () => {
    updatePet(selectedPet.id, (p) => ({ ...p, hp: Math.max(0, p.hp - 3) }));
  };

  const reset = () => {
    updatePet(selectedPet.id, (p) => ({ ...p, hp: p.maxHp }));
    setEnemyHp(30);
  };
  
  if (!selectedPet) {
      return (
          <View style={styles.battleContainer}>
              <Text style={styles.text}>No pet selected.</Text>
              {/* The "Go Home" button was here and is now removed */}
          </View>
      )
  }

  return (
    <View style={styles.battleContainer}>
      <Text style={styles.title}>Battle</Text>
      <Text style={styles.text}>
        {selectedPet.name} HP: {selectedPet.hp}/{selectedPet.maxHp} (Lvl {selectedPet.level})
      </Text>
      <Text style={styles.text}>
        ATK: {baseAtk}{atkBuff ? ` + ${atkBuff} = ${effectiveAtk}` : ''}
      </Text>
      <Image
        source={petImages[selectedPet.id]}
        style={{ width: 64, height: 64, marginVertical: 10 }}
        accessibilityLabel={selectedPet.name}
      />
      <Text style={styles.text}>Enemy HP: {enemyHp}/30</Text>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={playerAttack}>
                <Text style={styles.buttonText}>Attack</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={enemyAttack}>
                <Text style={styles.buttonText}>Enemy Turn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={reset}>
                <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            {/* The "Go Home" button was here and is now removed */}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  battleContainer: { 
    // Removed padding, as it's now handled by contentArea in App.js
    backgroundColor: 'rgba(162, 162, 162, 0.8)',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    width: '100%',
    padding: 20, // Re-adding padding for the card itself
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  text: {
      fontSize: 16,
      lineHeight: 24,
  },
  buttonContainer: {
      marginTop: 20,
      width: '100%',
  },
  button: {
      backgroundColor: '#007bff',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 10,
  },
  buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
  }
});