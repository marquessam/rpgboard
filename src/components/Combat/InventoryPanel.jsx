// src/components/Combat/InventoryPanel.jsx
import React, { useState } from 'react';
import { Package, X, Plus, Coins, ArrowUpDown } from 'lucide-react';

const InventoryPanel = ({ 
  selectedCharacter, 
  onRemoveInventoryItem,
  onAddInventoryItem,
  onUpdateCharacterCurrency,
  onClearSelection 
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    description: ''
  });
  const [currencyToAdd, setCurrencyToAdd] = useState({
    copper: 0,
    silver: 0,
    gold: 0
  });

  if (!selectedCharacter) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          <Package className="inline mr-2" size={20} />
          Inventory
        </h3>
        <div className="text-slate-400 text-center py-8">
          Select a character to view their inventory
        </div>
      </div>
    );
  }

  const currentHp = selectedCharacter.hp !== undefined ? selectedCharacter.hp : selectedCharacter.maxHp;
  const isAlive = currentHp > 0;

  if (!isAlive) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          <Package className="inline mr-2" size={20} />
          Inventory
        </h3>
        <div className="text-slate-400 text-center py-8">
          This character is defeated and cannot manage inventory
        </div>
      </div>
    );
  }

  const inventory = selectedCharacter.inventory || [];
  const currency = selectedCharacter.currency || { copper: 0, silver: 0, gold: 0 };

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      const item = {
        ...newItem,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: 'Added manually',
        dateObtained: new Date().toLocaleString(),
        actualQuantity: newItem.quantity
      };
      
      onAddInventoryItem(item);
      setNewItem({ name: '', quantity: 1, description: '' });
      setShowAddItem(false);
    }
  };

  const handleAddCurrency = () => {
    const newCurrency = {
      copper: currency.copper + currencyToAdd.copper,
      silver: currency.silver + currencyToAdd.silver,
      gold: currency.gold + currencyToAdd.gold
    };
    onUpdateCharacterCurrency(newCurrency);
    setCurrencyToAdd({ copper: 0, silver: 0, gold: 0 });
    setShowAddCurrency(false);
  };

  const handleCurrencyChange = (type, amount) => {
    const newCurrency = {
      ...currency,
      [type]: Math.max(0, currency[type] + amount)
    };
    onUpdateCharacterCurrency(newCurrency);
  };

  // Currency conversion functions
  const convertCurrency = (fromType, toType, amount) => {
    const rates = {
      copper: 1,
      silver: 10,
      gold: 100
    };
    
    const fromValue = rates[fromType];
    const toValue = rates[toType];
    const convertedAmount = Math.floor((amount * fromValue) / toValue);
    const remainder = (amount * fromValue) % toValue;
    
    if (convertedAmount > 0 && currency[fromType] >= amount) {
      const newCurrency = {
        ...currency,
        [fromType]: currency[fromType] - amount,
        [toType]: currency[toType] + convertedAmount
      };
      
      // Add remainder back as copper
      if (remainder > 0 && fromType !== 'copper') {
        newCurrency.copper += remainder;
      }
      
      onUpdateCharacterCurrency(newCurrency);
    }
  };

  // Calculate total value in gold pieces
  const totalValueInGold = currency.gold + (currency.silver / 10) + (currency.copper / 100);

  // Filter out currency items from regular inventory
  const regularItems = inventory.filter(item => 
    !['copper pieces', 'silver pieces', 'gold pieces', 'cp', 'sp', 'gp'].includes(item.name.toLowerCase())
  );

  // Group items by type/category
  const groupedItems = regularItems.reduce((groups, item) => {
    const category = item.category || item.type || 'Miscellaneous';
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-100">
          <Package className="inline mr-2" size={20} />
          Inventory
        </h3>
        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Clear Selection
        </button>
      </div>

      {/* Character Info */}
      <div className="mb-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded border"
            style={{ 
              backgroundColor: selectedCharacter.color,
              borderColor: selectedCharacter.borderColor
            }}
          />
          <span className="font-medium text-white">{selectedCharacter.name}</span>
          {regularItems.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              {regularItems.length} items
            </span>
          )}
        </div>
      </div>

      {/* Currency Section */}
      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-yellow-300 flex items-center gap-2">
            <Coins size={16} />
            Currency
          </h4>
          <div className="flex gap-1">
            <button
              onClick={() => setShowConverter(!showConverter)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
              title="Currency Converter"
            >
              <ArrowUpDown size={14} />
            </button>
            <button
              onClick={() => setShowAddCurrency(!showAddCurrency)}
              className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white text-xs"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Currency Display */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-yellow-200 text-lg font-bold">{currency.gold}</div>
            <div className="text-yellow-400 text-xs">Gold</div>
            <div className="flex justify-center gap-1 mt-1">
              <button 
                onClick={() => handleCurrencyChange('gold', 1)}
                className="bg-green-600 hover:bg-green-700 w-5 h-5 rounded text-xs text-white"
              >+</button>
              <button 
                onClick={() => handleCurrencyChange('gold', -1)}
                className="bg-red-600 hover:bg-red-700 w-5 h-5 rounded text-xs text-white"
                disabled={currency.gold === 0}
              >-</button>
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-200 text-lg font-bold">{currency.silver}</div>
            <div className="text-slate-400 text-xs">Silver</div>
            <div className="flex justify-center gap-1 mt-1">
              <button 
                onClick={() => handleCurrencyChange('silver', 1)}
                className="bg-green-600 hover:bg-green-700 w-5 h-5 rounded text-xs text-white"
              >+</button>
              <button 
                onClick={() => handleCurrencyChange('silver', -1)}
                className="bg-red-600 hover:bg-red-700 w-5 h-5 rounded text-xs text-white"
                disabled={currency.silver === 0}
              >-</button>
            </div>
          </div>
          <div className="text-center">
            <div className="text-orange-200 text-lg font-bold">{currency.copper}</div>
            <div className="text-orange-400 text-xs">Copper</div>
            <div className="flex justify-center gap-1 mt-1">
              <button 
                onClick={() => handleCurrencyChange('copper', 1)}
                className="bg-green-600 hover:bg-green-700 w-5 h-5 rounded text-xs text-white"
              >+</button>
              <button 
                onClick={() => handleCurrencyChange('copper', -1)}
                className="bg-red-600 hover:bg-red-700 w-5 h-5 rounded text-xs text-white"
                disabled={currency.copper === 0}
              >-</button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-yellow-400">
          Total Value: {totalValueInGold.toFixed(2)} gp
        </div>

        {/* Add Currency Form */}
        {showAddCurrency && (
          <div className="mt-3 p-3 bg-slate-700/50 border border-slate-600 rounded">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-xs text-yellow-300">Add Gold</label>
                <input
                  type="number"
                  min="0"
                  value={currencyToAdd.gold}
                  onChange={(e) => setCurrencyToAdd(prev => ({ ...prev, gold: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Add Silver</label>
                <input
                  type="number"
                  min="0"
                  value={currencyToAdd.silver}
                  onChange={(e) => setCurrencyToAdd(prev => ({ ...prev, silver: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-orange-300">Add Copper</label>
                <input
                  type="number"
                  min="0"
                  value={currencyToAdd.copper}
                  onChange={(e) => setCurrencyToAdd(prev => ({ ...prev, copper: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCurrency}
                className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddCurrency(false)}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Currency Converter */}
        {showConverter && (
          <div className="mt-3 p-3 bg-slate-700/50 border border-slate-600 rounded">
            <div className="text-xs font-medium text-yellow-300 mb-2">Quick Conversions</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => convertCurrency('copper', 'silver', 10)}
                disabled={currency.copper < 10}
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 px-2 py-1 rounded text-white"
              >
                10 cp → 1 sp
              </button>
              <button
                onClick={() => convertCurrency('silver', 'copper', 1)}
                disabled={currency.silver < 1}
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 px-2 py-1 rounded text-white"
              >
                1 sp → 10 cp
              </button>
              <button
                onClick={() => convertCurrency('silver', 'gold', 10)}
                disabled={currency.silver < 10}
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 px-2 py-1 rounded text-white"
              >
                10 sp → 1 gp
              </button>
              <button
                onClick={() => convertCurrency('gold', 'silver', 1)}
                disabled={currency.gold < 1}
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 px-2 py-1 rounded text-white"
              >
                1 gp → 10 sp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddItem(!showAddItem)}
          className="bg-green-500 hover:bg-green-600 border border-green-400 px-3 py-2 rounded text-white transition-all duration-200 text-sm w-full"
        >
          <Plus size={14} className="inline mr-1" />
          Add Item
        </button>
      </div>

      {/* Add Item Form */}
      {showAddItem && (
        <div className="mb-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Inventory Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {regularItems.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Package className="mx-auto mb-2 opacity-50" size={32} />
            <p>No items in inventory</p>
            <p className="text-xs mt-2 opacity-75">Items from looting will appear here</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {Object.keys(groupedItems).length > 1 && (
                <div className="text-sm font-medium text-slate-300 mb-2 border-b border-slate-600 pb-1">
                  {category}
                </div>
              )}
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div 
                    key={item.id || `${category}-${index}`} 
                    className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700/70 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-white flex items-center gap-2">
                          {item.name}
                          {(item.actualQuantity || item.quantity) > 1 && (
                            <span className="text-slate-400 text-sm">
                              x{item.actualQuantity || item.quantity}
                            </span>
                          )}
                        </div>
                        
                        {item.description && (
                          <div className="text-sm text-slate-400 mt-1">
                            {item.description}
                          </div>
                        )}
                        
                        <div className="text-xs text-slate-500 mt-1">
                          {item.source && `From: ${item.source}`}
                          {item.source && item.dateObtained && ' • '}
                          {item.dateObtained}
                        </div>
                      </div>
                      
                      {onRemoveInventoryItem && (
                        <button
                          onClick={() => {
                            const itemIndex = selectedCharacter.inventory.findIndex(invItem => 
                              invItem.id === item.id || 
                              (invItem.name === item.name && invItem.dateObtained === item.dateObtained)
                            );
                            if (itemIndex !== -1) {
                              onRemoveInventoryItem(itemIndex);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors ml-2"
                          title="Remove item"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inventory Summary */}
      {regularItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-600 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Items: {regularItems.length}</span>
            <span className="text-yellow-400">Currency: {totalValueInGold.toFixed(2)} gp</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
