// src/components/Combat/LootModal.jsx - Updated with currency generation
import React, { useState } from 'react';
import { Gift, X, Coins } from 'lucide-react';

const defaultLootTables = {
  goblin: [
    { name: 'Copper Pieces', quantity: '2d6', rarity: 'common', type: 'currency' },
    { name: 'Rusty Scimitar', quantity: 1, rarity: 'common' },
    { name: 'Crude Shield', quantity: 1, rarity: 'common' },
    { name: 'Goblin Ear Necklace', quantity: 1, rarity: 'uncommon' }
  ],
  bandit: [
    { name: 'Silver Pieces', quantity: '1d4+2', rarity: 'common', type: 'currency' },
    { name: 'Copper Pieces', quantity: '3d6', rarity: 'common', type: 'currency' },
    { name: 'Leather Armor', quantity: 1, rarity: 'common' },
    { name: 'Light Crossbow', quantity: 1, rarity: 'common' },
    { name: 'Thieves\' Tools', quantity: 1, rarity: 'uncommon' }
  ],
  orc: [
    { name: 'Gold Pieces', quantity: '1d6', rarity: 'common', type: 'currency' },
    { name: 'Silver Pieces', quantity: '2d4', rarity: 'common', type: 'currency' },
    { name: 'Greataxe', quantity: 1, rarity: 'common' },
    { name: 'Orcish War Paint', quantity: 1, rarity: 'uncommon' },
    { name: 'Tribal Fetish', quantity: 1, rarity: 'uncommon' }
  ],
  wolf: [
    { name: 'Wolf Pelt', quantity: 1, rarity: 'common' },
    { name: 'Wolf Teeth', quantity: '1d4', rarity: 'common' },
    { name: 'Alpha\'s Claw', quantity: 1, rarity: 'rare' }
  ],
  skeleton: [
    { name: 'Copper Pieces', quantity: '1d6', rarity: 'common', type: 'currency' },
    { name: 'Bone Fragments', quantity: '1d8', rarity: 'common' },
    { name: 'Tattered Clothing', quantity: 1, rarity: 'common' },
    { name: 'Ancient Coin', quantity: 1, rarity: 'uncommon' }
  ],
  zombie: [
    { name: 'Copper Pieces', quantity: '1d4', rarity: 'common', type: 'currency' },
    { name: 'Rotted Flesh', quantity: '1d4', rarity: 'common' },
    { name: 'Tattered Equipment', quantity: 1, rarity: 'common' },
    { name: 'Disease Sample', quantity: 1, rarity: 'uncommon' }
  ],
  wizard: [
    { name: 'Gold Pieces', quantity: '3d6+10', rarity: 'common', type: 'currency' },
    { name: 'Silver Pieces', quantity: '2d10', rarity: 'common', type: 'currency' },
    { name: 'Spellbook', quantity: 1, rarity: 'rare' },
    { name: 'Component Pouch', quantity: 1, rarity: 'common' },
    { name: 'Scroll of Magic Missile', quantity: 1, rarity: 'uncommon' },
    { name: 'Wizard\'s Staff', quantity: 1, rarity: 'rare' }
  ],
  ogre: [
    { name: 'Gold Pieces', quantity: '2d6+5', rarity: 'common', type: 'currency' },
    { name: 'Silver Pieces', quantity: '3d6', rarity: 'common', type: 'currency' },
    { name: 'Copper Pieces', quantity: '4d6', rarity: 'common', type: 'currency' },
    { name: 'Giant\'s Club', quantity: 1, rarity: 'common' },
    { name: 'Ogre Hide', quantity: 1, rarity: 'uncommon' },
    { name: 'Crude Jewelry', quantity: '1d3', rarity: 'uncommon' }
  ],
  commoner: [
    { name: 'Copper Pieces', quantity: '1d6', rarity: 'common', type: 'currency' },
    { name: 'Personal Effects', quantity: 1, rarity: 'common' }
  ],
  guard: [
    { name: 'Gold Pieces', quantity: '1d4', rarity: 'common', type: 'currency' },
    { name: 'Silver Pieces', quantity: '2d6', rarity: 'common', type: 'currency' },
    { name: 'Spear', quantity: 1, rarity: 'common' },
    { name: 'Chain Shirt', quantity: 1, rarity: 'common' }
  ],
  noble: [
    { name: 'Gold Pieces', quantity: '3d6+20', rarity: 'common', type: 'currency' },
    { name: 'Silver Pieces', quantity: '2d10', rarity: 'common', type: 'currency' },
    { name: 'Signet Ring', quantity: 1, rarity: 'uncommon' },
    { name: 'Fine Clothes', quantity: 1, rarity: 'common' },
    { name: 'Rapier', quantity: 1, rarity: 'common' }
  ],
  merchant: [
    { name: 'Gold Pieces', quantity: '2d6+10', rarity: 'common', type: 'currency' },
    { name: 'Silver Pieces', quantity: '3d6', rarity: 'common', type: 'currency' },
    { name: 'Trade Goods', quantity: '1d3', rarity: 'common' },
    { name: 'Merchant\'s Scale', quantity: 1, rarity: 'common' }
  ]
};

const LootModal = ({ deadCharacter, onClose, onTakeLoot }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  
  const lootTable = defaultLootTables[deadCharacter.name.toLowerCase()] || 
                   defaultLootTables[deadCharacter.type] || [
                     { name: 'Personal Effects', quantity: 1, rarity: 'common' },
                     { name: 'Copper Pieces', quantity: '1d4', rarity: 'common', type: 'currency' }
                   ];

  const rollQuantity = (quantityStr) => {
    if (typeof quantityStr === 'number') return quantityStr;
    
    // Simple dice rolling for loot
    const match = quantityStr.match(/(\d+)d(\d+)(\+\d+)?/);
    if (match) {
      const numDice = parseInt(match[1]);
      const dieSize = parseInt(match[2]);
      const modifier = parseInt(match[3]) || 0;
      
      let total = 0;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * dieSize) + 1;
      }
      return total + modifier;
    }
    
    return 1;
  };

  const generateLoot = () => {
    return lootTable.map(item => ({
      ...item,
      actualQuantity: rollQuantity(item.quantity),
      id: Math.random().toString(36).substr(2, 9)
    }));
  };

  const [lootItems] = useState(() => generateLoot());

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const takeSelectedLoot = () => {
    const takenItems = lootItems.filter(item => selectedItems.includes(item.id));
    onTakeLoot(takenItems);
    onClose();
  };

  const takeAllLoot = () => {
    onTakeLoot(lootItems);
    onClose();
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-600';
      case 'uncommon': return 'text-green-400 border-green-600';
      case 'rare': return 'text-blue-400 border-blue-600';
      case 'epic': return 'text-purple-400 border-purple-600';
      case 'legendary': return 'text-orange-400 border-orange-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getCurrencyIcon = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('gold')) return '🥇';
    if (name.includes('silver')) return '🥈';
    if (name.includes('copper')) return '🥉';
    return '🪙';
  };

  // Separate currency from regular items for better display
  const currencyItems = lootItems.filter(item => item.type === 'currency');
  const regularItems = lootItems.filter(item => item.type !== 'currency');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift size={20} className="text-yellow-500" />
            <h3 className="text-xl font-bold text-slate-100">
              Loot: {deadCharacter.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="text-sm text-slate-400 mb-4">
            Search the remains of the fallen {deadCharacter.name}...
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {/* Currency Section */}
            {currencyItems.length > 0 && (
              <div>
                <div className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-1">
                  <Coins size={14} />
                  Currency
                </div>
                <div className="space-y-2">
                  {currencyItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedItems.includes(item.id)
                          ? 'bg-yellow-500/20 border-yellow-500/50'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                      } ${getRarityColor(item.rarity)}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            <span className="text-lg">{getCurrencyIcon(item.name)}</span>
                            {item.name}
                            {item.actualQuantity > 1 && (
                              <span className="text-slate-400 text-sm">
                                x{item.actualQuantity}
                              </span>
                            )}
                          </div>
                          <div className="text-xs capitalize text-yellow-400">{item.rarity}</div>
                        </div>
                        {selectedItems.includes(item.id) && (
                          <div className="text-yellow-400">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Items Section */}
            {regularItems.length > 0 && (
              <div>
                {currencyItems.length > 0 && (
                  <div className="text-sm font-medium text-slate-300 mb-2 mt-4">
                    Items
                  </div>
                )}
                <div className="space-y-2">
                  {regularItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedItems.includes(item.id)
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                      } ${getRarityColor(item.rarity)}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            {item.name}
                            {item.actualQuantity > 1 && (
                              <span className="text-slate-400 text-sm">
                                x{item.actualQuantity}
                              </span>
                            )}
                          </div>
                          <div className="text-xs capitalize">{item.rarity}</div>
                        </div>
                        {selectedItems.includes(item.id) && (
                          <div className="text-blue-400">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={takeAllLoot}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              <Coins size={16} className="inline mr-1" />
              Take All
            </button>
            <button
              onClick={takeSelectedLoot}
              disabled={selectedItems.length === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              Take Selected ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LootModal;
