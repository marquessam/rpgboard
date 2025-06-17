// src/utils/monsters.js
export const monsters = {
  // === HUMANOIDS ===
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
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Shortbow',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '1d6+2',
        damageType: 'piercing',
        range: '80/320 ft',
        attackRoll: true
      }
    ],
    description: 'Small, cunning humanoid',
    quickMessage: '*The goblin cackles wickedly and bares its yellowed teeth*'
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
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Light Crossbow',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d8+1',
        damageType: 'piercing',
        range: '80/320 ft',
        attackRoll: true
      }
    ],
    description: 'Human outlaw and cutthroat',
    quickMessage: '*The bandit sneers and spits on the ground* "Your coin or your life!"'
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
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Javelin',
        type: 'weapon_attack',
        attackBonus: 5,
        damageRoll: '1d6+3',
        damageType: 'piercing',
        range: '30/120 ft',
        attackRoll: true
      }
    ],
    description: 'Savage warrior of orcish tribes',
    quickMessage: '*The orc beats its chest and roars a challenge* "WAAAGH!"'
  },

  // === SPELLCASTERS ===
  cultist: {
    name: 'Cultist',
    type: 'humanoid',
    cr: '1/8',
    ac: 12,
    hp: 9,
    maxHp: 9,
    speed: 30,
    str: 11,
    dex: 12,
    con: 10,
    int: 10,
    wis: 11,
    cha: 10,
    proficiencyBonus: 2,
    color: '#7c2d12',
    borderColor: '#dc2626',
    actions: [
      {
        name: 'Scimitar',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d6+1',
        damageType: 'slashing',
        range: 'melee',
        attackRoll: true
      }
    ],
    spells: [
      {
        name: 'Sacred Flame',
        level: 0,
        school: 'evocation',
        castingTime: '1 action',
        range: '60 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        description: 'Target makes DEX save or takes 1d8 radiant damage',
        savingThrow: 'dex',
        damageRoll: '1d8',
        damageType: 'radiant'
      }
    ],
    description: 'Fanatical follower of dark powers',
    quickMessage: '*The cultist chants in a forbidden tongue and raises a ceremonial dagger*'
  },

  acolyte: {
    name: 'Acolyte',
    type: 'humanoid',
    cr: '1/4',
    ac: 10,
    hp: 9,
    maxHp: 9,
    speed: 30,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 14,
    cha: 11,
    proficiencyBonus: 2,
    color: '#fbbf24',
    borderColor: '#ffffff',
    actions: [
      {
        name: 'Club',
        type: 'weapon_attack',
        attackBonus: 2,
        damageRoll: '1d4',
        damageType: 'bludgeoning',
        range: 'melee',
        attackRoll: true
      }
    ],
    spells: [
      {
        name: 'Sacred Flame',
        level: 0,
        school: 'evocation',
        castingTime: '1 action',
        range: '60 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        description: 'Target makes DEX save or takes 1d8 radiant damage',
        savingThrow: 'dex',
        damageRoll: '1d8',
        damageType: 'radiant'
      },
      {
        name: 'Cure Wounds',
        level: 1,
        school: 'evocation',
        castingTime: '1 action',
        range: 'Touch',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        description: 'Heal a creature for 1d8 + 2 HP',
        healing: true,
        healingRoll: '1d8'
      }
    ],
    description: 'Junior priest or temple servant',
    quickMessage: '*The acolyte bows respectfully* "May the light guide you, traveler."'
  },

  wizard: {
    name: 'Wizard',
    type: 'humanoid',
    cr: '6',
    ac: 12,
    hp: 40,
    maxHp: 40,
    speed: 30,
    str: 9,
    dex: 14,
    con: 11,
    int: 17,
    wis: 12,
    cha: 11,
    proficiencyBonus: 3,
    color: '#8b5cf6',
    borderColor: '#ffffff',
    actions: [
      {
        name: 'Dagger',
        type: 'weapon_attack',
        attackBonus: 5,
        damageRoll: '1d4+2',
        damageType: 'piercing',
        range: 'melee/thrown (20/60)',
        attackRoll: true
      }
    ],
    spells: [
      {
        name: 'Fire Bolt',
        level: 0,
        school: 'evocation',
        castingTime: '1 action',
        range: '120 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        description: 'Ranged spell attack for 2d10 fire damage',
        attackRoll: true,
        damageRoll: '2d10',
        damageType: 'fire'
      },
      {
        name: 'Magic Missile',
        level: 1,
        school: 'evocation',
        castingTime: '1 action',
        range: '120 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        description: 'Three darts of magical force, each dealing 1d4+1 force damage',
        autoHit: true,
        damageRoll: '3d4+3',
        damageType: 'force'
      },
      {
        name: 'Fireball',
        level: 3,
        school: 'evocation',
        castingTime: '1 action',
        range: '150 feet',
        components: ['V', 'S', 'M'],
        duration: 'Instantaneous',
        description: 'Explosion in 20-foot radius, DEX save for half of 8d6 fire damage',
        savingThrow: 'dex',
        damageRoll: '8d6',
        damageType: 'fire',
        areaEffect: '20-foot radius'
      }
    ],
    description: 'Learned spellcaster and scholar',
    quickMessage: '*The wizard adjusts their spectacles and traces arcane symbols in the air*'
  },

  // === BEASTS ===
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
        special: 'Target must succeed on DC 11 Strength saving throw or be knocked prone',
        attackRoll: true
      }
    ],
    description: 'Pack predator with keen senses',
    quickMessage: '*The wolf bares its fangs and lets out a low, threatening growl*'
  },

  bear: {
    name: 'Brown Bear',
    type: 'beast',
    cr: '1',
    ac: 11,
    hp: 34,
    maxHp: 34,
    speed: 40,
    str: 19,
    dex: 10,
    con: 16,
    int: 2,
    wis: 13,
    cha: 7,
    proficiencyBonus: 2,
    color: '#92400e',
    borderColor: '#000000',
    actions: [
      {
        name: 'Bite',
        type: 'weapon_attack',
        attackBonus: 6,
        damageRoll: '1d8+4',
        damageType: 'piercing',
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Claw',
        type: 'weapon_attack',
        attackBonus: 6,
        damageRoll: '2d6+4',
        damageType: 'slashing',
        range: 'melee',
        attackRoll: true
      }
    ],
    description: 'Large, powerful forest predator',
    quickMessage: '*The bear rears up on its hind legs and roars menacingly*'
  },

  // === UNDEAD ===
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
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Shortbow',
        type: 'weapon_attack',
        attackBonus: 4,
        damageRoll: '1d6+2',
        damageType: 'piercing',
        range: '80/320 ft',
        attackRoll: true
      }
    ],
    description: 'Animated bones of the dead',
    quickMessage: '*The skeleton\'s bones rattle ominously as it turns to face you*'
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
        range: 'melee',
        attackRoll: true
      }
    ],
    traits: ['Undead Fortitude'],
    description: 'Shambling corpse animated by dark magic',
    quickMessage: '*The zombie lurches forward with a haunting moan* "Braaaaains..."'
  },

  // === TOWNSFOLK ===
  commoner: {
    name: 'Commoner',
    type: 'humanoid',
    cr: '0',
    ac: 10,
    hp: 4,
    maxHp: 4,
    speed: 30,
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    proficiencyBonus: 2,
    color: '#64748b',
    borderColor: '#ffffff',
    actions: [
      {
        name: 'Club',
        type: 'weapon_attack',
        attackBonus: 2,
        damageRoll: '1d4',
        damageType: 'bludgeoning',
        range: 'melee',
        attackRoll: true
      }
    ],
    description: 'Ordinary citizen of the realm',
    quickMessage: '*The commoner looks around nervously* "I don\'t want any trouble..."'
  },

  guard: {
    name: 'Guard',
    type: 'humanoid',
    cr: '1/8',
    ac: 16,
    hp: 11,
    maxHp: 11,
    speed: 30,
    str: 13,
    dex: 12,
    con: 12,
    int: 10,
    wis: 11,
    cha: 10,
    proficiencyBonus: 2,
    color: '#1e40af',
    borderColor: '#ffffff',
    actions: [
      {
        name: 'Spear',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d6+1',
        damageType: 'piercing',
        range: 'melee/thrown (20/60)',
        attackRoll: true
      }
    ],
    description: 'City watch or castle guard',
    quickMessage: '*The guard stands at attention* "Halt! State your business here."'
  },

  noble: {
    name: 'Noble',
    type: 'humanoid',
    cr: '1/8',
    ac: 15,
    hp: 9,
    maxHp: 9,
    speed: 30,
    str: 11,
    dex: 12,
    con: 11,
    int: 12,
    wis: 14,
    cha: 16,
    proficiencyBonus: 2,
    color: '#7c3aed',
    borderColor: '#fbbf24',
    actions: [
      {
        name: 'Rapier',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d8+1',
        damageType: 'piercing',
        range: 'melee',
        attackRoll: true
      }
    ],
    description: 'Aristocrat of high station',
    quickMessage: '*The noble adjusts their fine clothes with disdain* "Do you know who I am?"'
  },

  merchant: {
    name: 'Merchant',
    type: 'humanoid',
    cr: '0',
    ac: 11,
    hp: 8,
    maxHp: 8,
    speed: 30,
    str: 10,
    dex: 12,
    con: 10,
    int: 13,
    wis: 14,
    cha: 15,
    proficiencyBonus: 2,
    color: '#059669',
    borderColor: '#fbbf24',
    actions: [
      {
        name: 'Dagger',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d4+1',
        damageType: 'piercing',
        range: 'melee/thrown (20/60)',
        attackRoll: true
      }
    ],
    description: 'Traveling trader or shopkeeper',
    quickMessage: '*The merchant rubs their hands together* "Welcome, friend! What can I sell you today?"'
  },

  // === MORE MONSTERS ===
  ogre: {
    name: 'Ogre',
    type: 'giant',
    cr: '2',
    ac: 11,
    hp: 59,
    maxHp: 59,
    speed: 40,
    str: 19,
    dex: 8,
    con: 16,
    int: 5,
    wis: 7,
    cha: 7,
    proficiencyBonus: 2,
    color: '#78716c',
    borderColor: '#000000',
    actions: [
      {
        name: 'Greatclub',
        type: 'weapon_attack',
        attackBonus: 6,
        damageRoll: '2d8+4',
        damageType: 'bludgeoning',
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Javelin',
        type: 'weapon_attack',
        attackBonus: 6,
        damageRoll: '2d6+4',
        damageType: 'piercing',
        range: '30/120 ft',
        attackRoll: true
      }
    ],
    description: 'Brutish giant with an appetite for violence',
    quickMessage: '*The ogre pounds its chest and bellows* "ME SMASH PUNY THINGS!"'
  },

  hobgoblin: {
    name: 'Hobgoblin',
    type: 'humanoid',
    cr: '1/2',
    ac: 18,
    hp: 11,
    maxHp: 11,
    speed: 30,
    str: 13,
    dex: 12,
    con: 12,
    int: 10,
    wis: 10,
    cha: 9,
    proficiencyBonus: 2,
    color: '#dc2626',
    borderColor: '#000000',
    actions: [
      {
        name: 'Longsword',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d8+1',
        damageType: 'slashing',
        range: 'melee',
        attackRoll: true
      },
      {
        name: 'Longbow',
        type: 'weapon_attack',
        attackBonus: 3,
        damageRoll: '1d8+1',
        damageType: 'piercing',
        range: '150/600 ft',
        attackRoll: true
      }
    ],
    description: 'Disciplined goblinoid warrior',
    quickMessage: '*The hobgoblin salutes sharply* "For the legion! Attack formation!"'
  }
};

export const monsterCategories = {
  humanoid: {
    name: 'Humanoids',
    monsters: ['goblin', 'bandit', 'orc', 'hobgoblin']
  },
  spellcasters: {
    name: 'Spellcasters',
    monsters: ['cultist', 'acolyte', 'wizard']
  },
  beast: {
    name: 'Beasts',
    monsters: ['wolf', 'bear']
  },
  undead: {
    name: 'Undead',
    monsters: ['skeleton', 'zombie']
  },
  townsfolk: {
    name: 'Townsfolk',
    monsters: ['commoner', 'guard', 'noble', 'merchant']
  },
  giants: {
    name: 'Giants & Large',
    monsters: ['ogre']
  }
};

export const createMonsterInstance = (monsterKey) => {
  const template = monsters[monsterKey];
  if (!template) {
    console.error('Monster template not found for key:', monsterKey);
    return null;
  }
  
  const monster = {
    ...template,
    id: `${monsterKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    x: 0,
    y: 0,
    isMonster: true,
    // Use the template's quickMessage, or fall back to a generic one
    quickMessage: template.quickMessage || `*${template.name} appears ready for battle*`,
    // Ensure all required D&D 5e properties are present
    hp: template.hp || template.maxHp,
    conditions: [],
    spells: template.spells || []
  };
  
  console.log('Created monster instance:', monster);
  return monster;
};
