// BattleScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { usePets } from './App';
import { petImages } from './assets/petImages';

export default function BattleScreen({ navigate }) {
  const { selectedPet, updatePet, addXp, updateGlobalGold } = usePets();

  // State for battle logic
  const [enemyHp, setEnemyHp] = useState(30);
  const [enemyMaxHp, setEnemyMaxHp] = useState(30);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [statusText, setStatusText] = useState('A wild snake appears!');
  const [battleOver, setBattleOver] = useState(false);

  // This useEffect resets the battle every time the screen is loaded
  useEffect(() => {
    setEnemyHp(30);
    setEnemyMaxHp(30);
    setIsPlayerTurn(true);
    setBattleOver(false);
    setStatusText('A wild snake appears!');
  }, []);

  const getWeaponBuff = (pet) => {
    if (!pet) return 0;
    const inv = pet.inventory || [];
    const weaponId = pet.equipped?.weapon || null;
    if (!weaponId) return 0;
    const item = inv.find(i => i.id === weaponId);
    return Number(item?.power) || 0;
  };

  const handleAttack = () => {
    if (!isPlayerTurn || battleOver || !selectedPet) return;

    // 1. Player's Turn
    setIsPlayerTurn(false);
    const baseAtk = Number(selectedPet.attack) || 0;
    const atkBuff = getWeaponBuff(selectedPet);
    const effectiveAtk = baseAtk + atkBuff;
    const offset = Math.floor(Math.random() * 5 - 2); // -2 to +2 damage variance
    const playerDamage = Math.max(1, effectiveAtk + offset);
    const newEnemyHp = Math.max(0, enemyHp - playerDamage);
    
    setStatusText(`You attacked and dealt ${playerDamage} damage!`);
    setEnemyHp(newEnemyHp);

    // 2. Check for Player Victory
    if (newEnemyHp <= 0) {
      setBattleOver(true);
      const goldWon = Math.floor(Math.random() * 10) + 5;
      const xpGained = Math.floor(Math.random() * 15) + 10;
      updateGlobalGold(prev => prev + goldWon);
      addXp(selectedPet.id, xpGained);
      setStatusText(`You won! Gained ${goldWon} gold and ${xpGained} XP!`);
      return; // End the turn sequence
    }

    // 3. Enemy's Turn (after a delay)
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 5 + 2); // Enemy deals 2-6 damage
      const newPetHp = Math.max(0, selectedPet.hp - enemyDamage);
      
      setStatusText(prev => `${prev}\nThe snake attacks and deals ${enemyDamage} damage!`);
      updatePet(selectedPet.id, { hp: newPetHp });

      // 4. Check for Player Defeat
      if (newPetHp <= 0) {
        setBattleOver(true);
        setStatusText('Your pet has been defeated! Returning home...');
        setTimeout(() => {
          navigate('Home');
        }, 2000); // Wait 2 seconds before navigating
        return; // End the sequence
      }

      // 5. If no one is defeated, it's the player's turn again
      setIsPlayerTurn(true);

    }, 1000); // 1-second delay for enemy attack
  };

  const handleNewBattle = () => {
    setEnemyHp(enemyMaxHp);
    setIsPlayerTurn(true);
    setBattleOver(false);
    setStatusText('Another wild snake appears!');
  };

  if (!selectedPet) {
      return (
          <View style={styles.container}>
              <Text style={styles.text}>No pet selected.</Text>
          </View>
      )
  }

  const petHpPercent = selectedPet.maxHp > 0 ? (selectedPet.hp / selectedPet.maxHp) * 100 : 0;
  const enemyHpPercent = enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Player Pet Info */}
      <View style={styles.fighterInfo}>
        <Text style={styles.fighterName}>{selectedPet.name} (Lvl {selectedPet.level})</Text>
        <Image
          source={petImages[selectedPet.id]}
          style={styles.fighterImage}
          accessibilityLabel={selectedPet.name}
        />
        <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.hpBar, { width: `${petHpPercent}%` }]} />
            </View>
            <Text style={styles.barText}>{selectedPet.hp} / {selectedPet.maxHp}</Text>
        </View>
      </View>

      {/* Battle Status Log */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      {/* Enemy Info */}
      <View style={styles.fighterInfo}>
        <Text style={styles.fighterName}>Wild Snake</Text>
        <Image
          source={require('./assets/kenney_animal-pack-redux/PNG/Round (outline)/snake.png')}
          style={styles.fighterImage}
          accessibilityLabel='enemy'
        />
        <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View style={[styles.hpBar, { width: `${enemyHpPercent}%` }]} />
            </View>
            <Text style={styles.barText}>{enemyHp} / {enemyMaxHp}</Text>
        </View>
      </View>

      {/* Action Button */}
        <View style={styles.buttonContainer}>
            {battleOver && selectedPet.hp > 0 ? (
                <TouchableOpacity style={styles.button} onPress={handleNewBattle}>
                    <Text style={styles.buttonText}>New Battle</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    style={[styles.button, (!isPlayerTurn || battleOver) && styles.buttonDisabled]} 
                    onPress={handleAttack}
                    disabled={!isPlayerTurn || battleOver}
                >
                    <Text style={styles.buttonText}>Attack</Text>
                </TouchableOpacity>
            )}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'rgba(40, 40, 40, 0.85)',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    borderRadius: 10,
    width: '100%',
    height: '100%',
    padding: 20,
  },
  fighterInfo: {
    alignItems: 'center',
    width: '100%',
  },
  fighterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fighterImage: {
    width: 80,
    height: 80,
    marginVertical: 10,
  },
  barContainer: {
    width: '80%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBackground: {
    width: '100%',
    height: 22,
    backgroundColor: '#333',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
  },
  hpBar: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 11,
  },
  barText: {
    position: 'absolute',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  statusContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
    padding: 10,
    marginVertical: 15,
    width: '100%',
    minHeight: 60,
    justifyContent: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
      width: '100%',
  },
  button: {
      backgroundColor: '#dc3545', // Red for attack
      paddingVertical: 15,
      borderRadius: 5,
      alignItems: 'center',
  },
  buttonDisabled: {
      backgroundColor: '#6c757d',
      opacity: 0.7,
  },
  buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
  }
});