// src/components/Combat/InventoryPanel.jsx
import React, { useState } from 'react';
import { Package, X, Plus, Coins } from 'lucide-react';

const InventoryPanel = ({ 
  selectedCharacter, 
  onRemoveInventoryItem,
  onAddInventoryItem,
  onClearSelection 
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    description: ''
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

  // Calculate total value if items have value
  const totalValue = inventory.reduce((sum, item) => {
    const value = item.value || 0;
    const quantity = item.actualQuantity || item.quantity || 1;
    return sum + (value * quantity);
  }, 0);

  // Group items by type/category
  const groupedItems = inventory.reduce((groups, item) => {
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
          {inventory.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              {inventory.length} items
            </span>
          )}
        </div>
        
        {totalValue > 0 && (
          <div className="text-xs text-yellow-400 flex items-center gap-1">
            <Coins size={12} />
            Total Value: {totalValue} gp
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

      {/* Inventory Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {inventory.length === 0 ? (
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
                          {item.value && (
                            <span className="text-yellow-400 text-xs">
                              {item.value * (item.actualQuantity || item.quantity || 1)} gp
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
      {inventory.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-600 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Total Items: {inventory.length}</span>
            {totalValue > 0 && (
              <span className="text-yellow-400">Total Value: {totalValue} gp</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
