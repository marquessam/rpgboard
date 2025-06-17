# 🎲 RPG Battle Tool

A modern, interactive battle map and dialogue system for tabletop RPGs. Built with React, Vite, and Tailwind CSS.

## ✨ Features

- **Interactive Battle Map** - Drag and drop character tokens on a customizable grid
- **Character Management** - Create characters with custom sprites, portraits, and stats
- **Dialogue System** - Immersive RPG-style dialogue popups with typewriter effects
- **Chat System** - Real-time chat with dice rolling support (`/roll 1d20+3`)
- **Terrain Painting** - Paint custom terrain with built-in or uploaded sprites
- **Scene Display** - Show dramatic scenes to players with images and descriptions
- **Responsive Design** - Works on desktop and tablet devices

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
npm install
```

### 2. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app running locally.

### 3. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── BattleMap/         # Grid, character tokens, terrain
│   ├── Chat/              # Chat panel and message system
│   ├── Character/         # Character creation and management
│   ├── Dialogue/          # RPG-style dialogue popups
│   ├── Scene/             # Scene display system
│   └── UI/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions and constants
├── App.jsx               # Main application component
├── main.jsx              # React app entry point
└── index.css             # Global styles and Tailwind imports
```

## 🎮 How to Use

### Character Management
1. Click "Add Character" to create a new character
2. Upload custom sprites and portraits
3. Set stats, HP, and colors
4. Add quick messages for easy dialogue

### Battle Map
1. Drag characters around the grid
2. Toggle terrain paint mode to add environmental features
3. Adjust grid size and appearance
4. Show/hide character names and grid

### Chat & Dialogue
1. Type messages in the chat panel
2. Use `/roll 1d20+3` for dice rolls
3. If your name matches a character, messages appear as dialogue
4. Click 💬 buttons for quick character messages

### Scene Display
1. Click "Show Scene" in the header
2. Upload an image and write a description
3. Display dramatic scenes to your players

## 🌐 Deployment to Netlify

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings should auto-detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"

### Manual Deployment

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

## 🔧 Configuration Files

The project includes all necessary configuration:

- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `netlify.toml` - Netlify deployment settings
- `package.json` - Dependencies and scripts

## 📱 Preparing for Multiplayer

This version stores data locally in each browser. For true multiplayer functionality, you'll need to add:

1. **Real-time Backend** (Socket.io, Supabase, Firebase)
2. **State Synchronization** (character positions, chat, terrain)
3. **Room Management** (multiple game sessions)

Recommended services:
- **Supabase** - PostgreSQL + real-time subscriptions
- **Firebase** - Real-time database
- **Socket.io + Node.js** - Custom WebSocket server

## 🎨 Customization

### Adding New Terrain Types

Edit `src/utils/constants.js`:

```javascript
export const terrainTypes = {
  // ... existing terrain
  lava: { name: 'Lava', color: '#dc2626', icon: '🌋' },
  yourTerrain: { name: 'Your Terrain', color: '#your-color', icon: '🎨' }
};
```

### Modifying Character Stats

Update the stats array in `src/components/Character/CharacterStats.jsx`:

```javascript
const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'luck'];
```

### Custom Dice Notation

The dice roller in `src/utils/diceRoller.js` supports:
- `1d20` - Single twenty-sided die
- `2d6+3` - Two six-sided dice plus three
- `1d100-10` - Percentile die minus ten

## 🐛 Troubleshooting

### Build Issues
- Ensure Node.js version 18 or higher
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Styling Issues
- Check that Tailwind CSS is properly configured
- Verify `postcss.config.js` exists

### Deployment Issues
- Check Netlify build logs for errors
- Ensure `netlify.toml` is in the root directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [ ] Real-time multiplayer support
- [ ] Initiative tracker
- [ ] Spell/ability cards
- [ ] Combat automation
- [ ] Map import/export
- [ ] Mobile app version

---

Built with ❤️ for the tabletop RPG community
