// ShopScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { usePets } from './App';
import { petImages } from './assets/petImages'; 

const shopItems = {
  pets: [
    { id: 'p3', name: 'Sparky', price: 100, level: 1, hp: 20, maxHp: 20, attack: 4, xp: 0, xpToNextLevel: 100 },
    { id: 'p4', name: 'Rocky', price: 150, level: 1, hp: 30, maxHp: 30, attack: 7, xp: 0, xpToNextLevel: 100 },
    { id: 'p5', name: 'Sunny', price: 200, level: 1, hp: 50, maxHP: 50, attack: 10, xp: 0, xpToNextLevel: 100},
  ],
  items: [],
};

export default function ShopScreen({ navigate, params }) {
  const { pets, globalGold, updateGlobalGold, addPet } = usePets();

  // ... (handleBuyPet logic is unchanged) ...
  const handleBuyPet = (pet) => {
    if (globalGold < pet.price) {
      alert('Not enough gold!');
      return;
    }
    const alreadyOwned = pets.some(p => p.id === pet.id);
    if (alreadyOwned) {
      alert('You already own this pet!');
      return;
    }

    updateGlobalGold(prev => prev - pet.price);
    addPet(pet);
    alert(`You bought ${pet.name}!`);
  };

  const renderPetShop = () => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Adopt a New Pet</Text>
        <ScrollView style={styles.scrollBox}>
          {shopItems.pets.map((pet) => {
            const isOwned = pets.some(p => p.id === pet.id);
            const canAfford = globalGold >= pet.price;
            return (
              <View key={pet.id} style={styles.itemRow}>
                <Image
                  source={petImages[pet.id]}
                  style={styles.petImage}
                  accessibilityLabel={pet.name}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{pet.name}</Text>
                  <Text style={styles.itemStats}>
                    HP: {pet.hp} | ATK: {pet.attack}
                  </Text>
                  <Text style={styles.itemPrice}>Price: {pet.price} Gold</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    (isOwned || !canAfford) && styles.buyButtonDisabled,
                  ]}
                  disabled={isOwned || !canAfford}
                  onPress={() => handleBuyPet(pet)}
                >
                  <Text style={styles.buttonText}>
                    {isOwned ? 'Owned' : 'Buy'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Shop</Text>
      
      {renderPetShop()}

      {/* The "Back to Home" button was here and is now removed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Removed padding
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    padding: 20,
    backgroundColor: 'rgba(40, 40, 40, 0.85)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
    marginBottom: 20,
  },
  // ... (all other styles are unchanged) ...
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paragraph: {
    color: '#DDDDDD',
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollBox: {
    maxHeight: 400,
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemStats: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  itemPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buyButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    width: '100%',
    maxWidth: 600,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});