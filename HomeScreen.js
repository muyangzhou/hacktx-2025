// HomeScreen.js
import React from 'react';
import { usePets } from './App'; // or from a separate PetContext file

export default function HomeScreen({ navigate }) {
  // Get globalGold from context
  const { selectedPet, globalGold } = usePets();

  if (!selectedPet) {
    return (
      <div style={{ padding: 20 }}>
        <p>No pet selected.</p>
        <button onClick={() => navigate('Roster')}>Go to Roster</button>
      </div>
    );
  }

  const { name, level, hp, maxHp, attack } = selectedPet;

  return (
    <div style={{ padding: 20 }}>
      <h2>{name}</h2>
      <p>Level: {level}</p>
      <p>HP: {hp}/{maxHp}</p>
      <p>Attack: {attack}</p>
      {/* Display globalGold */}
      <p>Player Gold: {globalGold}</p>

      <button onClick={() => navigate('Battle')}>Battle</button>
      <button onClick={() => navigate('Shop')}>Shop</button>
      <button onClick={() => navigate('Bank')}>Bank</button>
      <button onClick={() => navigate('Roster')}>Roster</button>
      <button onClick={() => navigate('Inventory')}>Inventory</button>
    </div>
  );
}