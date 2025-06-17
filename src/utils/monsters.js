// src/utils/monsters.js
export const monsters = {
  goblin: {
    name: 'Goblin',
    type: 'humanoid',
    cr: '1/4',
    ac: 15,
    hp: 7,
    maxHp: 7,
    speed: 30,
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    proficiencyBonus: 2,
    color: '#059669',
    borderColor: '#000000',
    actions: [
      {
        name: 'Scimitar',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '1d6+2',
        damageType: 'slashing',
        range: 'melee'
      },
      {
        name: 'Shortbow',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '1d6+2',
        damageType: 'piercing',
        range: '80/320 ft'
      }
    ],
    description: 'Small, cunning humanoid'
  },
  
  bandit: {
    name: 'Bandit',
    type: 'humanoid',
    cr: '1/8',
    ac: 12,
    hp: 11,
    maxHp: 11,
    speed: 30,
    str: 11,
    dex: 12,
    con: 12,
    int: 10,
    wis: 10,
    cha: 10,
    proficiencyBonus: 2,
    color: '#7c2d12',
    borderColor: '#000000',
    actions: [
      {
        name: 'Scimitar',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d6+1',
        damageType: 'slashing',
        range: 'melee'
      },
      {
        name: 'Light Crossbow',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d8+1',
        damageType: 'piercing',
        range: '80/320 ft'
      }
    ],
    description: 'Human outlaw and cutthroat'
  },

  orc: {
    name: 'Orc',
    type: 'humanoid',
    cr: '1/2',
    ac: 13,
    hp: 15,
    maxHp: 15,
    speed: 30,
    str: 16,
    dex: 12,
    con: 16,
    int: 7,
    wis: 11,
    cha: 10,
    proficiencyBonus: 2,
    color: '#166534',
    borderColor: '#000000',
    actions: [
      {
        name: 'Greataxe',
        type: 'weapon_attack',
        attackBonus: 5,
        damageRoll: '1d12+3',
        damageType: 'slashing',
        range: 'melee'
      },
      {
        name: 'Javelin',
        type: 'weapon_attack',
        attackBonus: 5,
        damageRoll: '1d6+3',
        damageType: 'piercing',
        range: '30/120 ft'
      }
    ],
    description: 'Savage warrior of orcish tribes'
  },

  wolf: {
    name: 'Wolf',
    type: 'beast',
    cr: '1/4',
    ac: 13,
    hp: 11,
    maxHp: 11,
    speed: 40,
    str: 12,
    dex: 15,
    con: 12,
    int: 3,
    wis: 12,
    cha: 6,
    proficiencyBonus: 2,
    color: '#6b7280',
    borderColor: '#000000',
    actions: [
      {
        name: 'Bite',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '2d4+2',
        damageType: 'piercing',
        range: 'melee',
        special: 'Target must succeed on DC 11 Strength saving throw or be knocked prone'
      }
    ],
    description: 'Pack predator with keen senses'
  },

  skeleton: {
    name: 'Skeleton',
    type: 'undead',
    cr: '1/4',
    ac: 13,
    hp: 13,
    maxHp: 13,
    speed: 30,
    str: 10,
    dex: 14,
    con: 15,
    int: 6,
    wis: 8,
    cha: 5,
    proficiencyBonus: 2,
    color: '#f8fafc',
    borderColor: '#000000',
    actions: [
      {
        name: 'Shortsword',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '1d6+2',
        damageType: 'piercing',
        range: 'melee'
      },
      {
        name: 'Shortbow',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '1d6+2',
        damageType: 'piercing',
        range: '80/320 ft'
      }
    ],
    description: 'Animated bones of the dead'
  },

  zombie: {
    name: 'Zombie',
    type: 'undead',
    cr: '1/4',
    ac: 8,
    hp: 22,
    maxHp: 22,
    speed: 20,
    str: 13,
    dex: 6,
    con: 16,
    int: 3,
    wis: 6,
    cha: 5,
    proficiencyBonus: 2,
    color: '#16a34a',
    borderColor: '#000000',
    actions: [
      {
        name: 'Slam',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d6+1',
        damageType: 'bludgeoning',
        range: 'melee'
      }
    ],
    traits: ['Undead Fortitude'],
    description: 'Shambling corpse animated by dark magic'
  }
};

export const monsterCategories = {
  humanoid: {
    name: 'Humanoids',
    monsters: ['goblin', 'bandit', 'orc']
  },
  beast: {
    name: 'Beasts',
    monsters: ['wolf']
  },
  undead: {
    name: 'Undead',
    monsters: ['skeleton', 'zombie']
  }
};

export const createMonsterInstance = (monsterKey) => {
  const template = monsters[monsterKey];
  if (!template) return null;
  
  return {
    ...template,
    id: `${monsterKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    x: 0,
    y: 0,
    isMonster: true,
    quickMessage: `*${template.name} growls menacingly*`
  };
};
