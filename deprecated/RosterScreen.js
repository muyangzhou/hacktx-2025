import React, { useMemo } from 'react';
import { usePets } from './App';
import items from './items.json';

export default function RosterScreen({ navigate }) {
  const { pets, selectedPetId, setSelectedPetId, addPet } = usePets();

  const handleSelect = (id) => {
    setSelectedPetId(id);
    navigate('Home');
  };

  const handleAdd = () => {
    const id = `p${Math.random().toString(36).slice(2, 7)}`;
    addPet({ id, name: 'New Pet', level: 1, hp: 20, maxHp: 20, attack: 5, gold: 0 });
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>Pet Roster</h2>
      {pets.map(p => (
        <div key={p.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 10
        }}>
          <div>
            <div><strong>{p.name}</strong> {p.id === selectedPetId ? ' (Selected)' : ''}</div>
            <div>Lvl {p.level} • HP {p.hp}/{p.maxHp} • ATK {p.attack} • Gold {p.gold}</div>
          </div>
          <div>
            <button onClick={() => handleSelect(p.id)} style={{ marginRight: 8 }}>
              {p.id === selectedPetId ? 'Use' : 'Select'}
            </button>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('Home')}>Back</button>
      </div>
    </div>
  );
}
