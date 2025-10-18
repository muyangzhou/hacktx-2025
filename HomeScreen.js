// HomeScreen.js
import React from 'react';
import { usePets } from './App'; // or from a separate PetContext file

export default function HomeScreen({ navigate }) {
  // Get globalGold and the updater function from context
  const { selectedPet, globalGold, updateGlobalGold } = usePets();

  const handleDebugGold = () => {
    // Generate a random amount, e.g., between 50 and 250
    const randomAmount = Math.floor(Math.random() * 201) + 50;
    updateGlobalGold(prev => prev + randomAmount);
    alert(`Debug: Added ${randomAmount} gold!`);
  };

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
      <p>Player Gold: {globalGold}</p>

      <button onClick={() => navigate('Battle')}>Battle</button>
      <button onClick={() => navigate('Shop')}>Shop</button>
      <button onClick={() => navigate('Bank')}>Bank</button>
      <button onClick={() => navigate('Roster')}>Roster</button>
      <button onClick={() => navigate('Inventory')}>Inventory</button>
      
      {/* --- New Debug Button --- */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #eee' }}>
        <button onClick={handleDebugGold} style={{ backgroundColor: '#f0f0f0' }}>
          Debug: Add Gold
        </button>
      </div>
    </div>
  );
}