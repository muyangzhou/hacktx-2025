import React, { useState } from 'react';

const cosmetics = [
  { id: '1', name: 'Cool Hat', price: 50, type: 'cosmetic' },
  { id: '2', name: 'Sunglasses', price: 30, type: 'cosmetic' },
];

const weapons = [
  { id: '3', name: 'Power Sword', price: 100, type: 'weapon' },
  { id: '4', name: 'Mega Shield', price: 80, type: 'power-up' },
];

const ShopScreen = ({ navigate }) => {
  const [currency, setCurrency] = useState(200); // Mock currency

  const handlePurchase = (item) => {
    if (currency >= item.price) {
      setCurrency(currency - item.price);
      alert(`Purchase Successful! You bought ${item.name}.`);
      // In a real app, you would update the user's inventory
    } else {
      alert(`Not enough currency! You need ${item.price - currency} more to buy ${item.name}.`);
    }
  };

  const renderItem = (item) => (
    <div style={styles.item} key={item.id}>
      <p>{item.name}</p>
      <p>Price: ${item.price}</p>
      <button style={styles.button} onClick={() => handlePurchase(item)}>Buy</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.currency}>Your Currency: ${currency}</h2>
      
      <h3 style={styles.sectionTitle}>Cosmetics</h3>
      <div>
        {cosmetics.map(renderItem)}
      </div>

      <h3 style={styles.sectionTitle}>Weapons & Power-ups</h3>
      <div>
        {weapons.map(renderItem)}
      </div>

       <button style={styles.navButton} onClick={() => navigate('Home')}>Back to Home</button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  currency: {
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px',
    alignSelf: 'flex-start'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
    width: '100%',
    boxSizing: 'border-box'
  },
  button: {
    padding: '5px 10px',
    cursor: 'pointer'
  },
  navButton: {
    marginTop: '30px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default ShopScreen;

