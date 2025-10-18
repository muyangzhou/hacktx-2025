// BattleScreen.js
import React, { useState } from 'react';
import { usePets } from './App';

export default function BattleScreen({ navigate }) {
  const { selectedPet, updatePet } = usePets();

  const [enemyHp, setEnemyHp] = useState(30);

  const playerAttack = () => {
    setEnemyHp(h => Math.max(0, h - selectedPet.attack));
    // You can adjust the selected pet, e.g., gain xp or gold after victory:
    // updatePet(selectedPet.id, () => ({ gold: selectedPet.gold + 10 }));
  };

  const enemyAttack = () => {
    updatePet(selectedPet.id, (p) => ({ hp: Math.max(0, p.hp - 3) }));
  };

  const reset = () => {
    updatePet(selectedPet.id, (p) => ({ hp: p.maxHp }));
    setEnemyHp(30);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Battle</h3>
      <p>{selectedPet.name} HP: {selectedPet.hp}/{selectedPet.maxHp}</p>
      <p>Enemy HP: {enemyHp}/30</p>

      <button onClick={playerAttack}>Attack</button>
      <button onClick={enemyAttack}>Enemy Turn</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => navigate('Home')}>Go Home</button>
    </div>
  );
}
