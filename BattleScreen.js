// BattleScreen.js
import React, { useState } from 'react';
import { usePets } from './App';
import { petImages, weaponImages } from './assets/petImages'
import { Image } from 'react-native'

export default function BattleScreen({ navigate }) {
  // Get addXp and updateGlobalGold
  const { selectedPet, updatePet, addXp, updateGlobalGold } = usePets();

  const [enemyHp, setEnemyHp] = useState(30);

  const playerAttack = () => {
    // Check for victory
    if (enemyHp - selectedPet.attack <= 0) {
      const goldWon = Math.floor(Math.random() * 10) + 5; // Win 5-14 gold
      const xpGained = Math.floor(Math.random() * 15) + 10; // Win 10-24 XP

      // Grant rewards
      updateGlobalGold(prev => prev + goldWon);
      addXp(selectedPet.id, xpGained);

      alert(`You won! Gained ${goldWon} gold and ${xpGained} XP!`);
      
      // Reset enemy for next fight
      setEnemyHp(30); 
    } else {
      // Not a victory, just do damage
      setEnemyHp(h => Math.max(0, h - selectedPet.attack));
    }
  };

  const enemyAttack = () => {
    updatePet(selectedPet.id, (p) => ({ ...p, hp: Math.max(0, p.hp - 3) }));
  };

  const reset = () => {
    updatePet(selectedPet.id, (p) => ({ ...p, hp: p.maxHp }));
    setEnemyHp(30);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Battle</h3>
      <p>{selectedPet.name} HP: {selectedPet.hp}/{selectedPet.maxHp} (Lvl {selectedPet.level})</p>
      <Image
        source={petImages[selectedPet.id]}
        style={{ width: 64, height: 64 }}
        accessibilityLabel={selectedPet.name}
      />
      <p>Enemy HP: {enemyHp}/30</p>

      <button onClick={playerAttack}>Attack</button>
      <button onClick={enemyAttack}>Enemy Turn</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => navigate('Home')}>Go Home</button>
    </div>
  );
}