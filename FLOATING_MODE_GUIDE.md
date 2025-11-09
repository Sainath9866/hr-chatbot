# Floating Mode Chatbot Guide

## Features Implemented

### 1. **Two Display Modes**
   - **Full Screen Mode**: Traditional full-page chat interface with sidebar
   - **Floating Mode**: Compact widget in bottom-right corner (like in the reference image)

### 2. **Floating Mode Features**
   - ✅ Compact 400x600px floating widget
   - ✅ Beautiful gradient header with company branding
   - ✅ "Online to assist you" status indicator with animation
   - ✅ Minimize button (collapses to circular icon)
   - ✅ Maximize button (switches to full-screen mode)
   - ✅ Close button (minimizes the widget)
   - ✅ Menu button for chat history (opens overlay)
   - ✅ Home button for new chat
   - ✅ Responsive chat messages
   - ✅ Input field with send button

### 3. **Chat History in Floating Mode**
   - Menu button at bottom left opens a popup overlay
   - Shows all previous chats
   - Delete individual chats
   - Switch between chats
   - User info with sign-out option at bottom

### 4. **Mode Switching**
   - **In Full Mode**: "Floating Mode" button in top-right corner
   - **In Floating Mode**: Maximize icon in header
   - User preference saved to localStorage
   - Automatically loads last used mode on page refresh

### 5. **Minimized State**
   - Circular green button with "H" logo
   - Click to expand back to floating widget
   - Positioned in bottom-right corner

## Usage

### Switching to Floating Mode
1. Look for the "Floating Mode" button in the top-right corner
2. Click it to switch to compact floating widget

### Using Floating Mode
- **Chat**: Type in the input field at bottom
- **New Chat**: Click the home icon next to menu
- **Chat History**: Click the menu icon to see all chats
- **Minimize**: Click the X button (becomes circular icon)
- **Full Screen**: Click the maximize icon in header

### Returning to Full Mode
- Click the maximize icon in the floating widget header
- Or switch back through the button

## Technical Details

### Files Created/Modified
1. **components/FloatingChat.tsx** - New floating widget component
2. **components/ChatWrapper.tsx** - Mode manager component
3. **components/ChatInterface.tsx** - Added mode toggle button
4. **app/page.tsx** - Updated to use ChatWrapper
5. **app/c/[chatId]/page.tsx** - Updated to use ChatWrapper

### State Management
- Mode preference stored in localStorage
- Persists across page refreshes
- Key: `chatMode` (values: 'full' or 'floating')

### Features Preserved
- ✅ All existing functionality works in both modes
- ✅ URL routing (/c/{chatId}) works in both modes
- ✅ No page refresh when switching chats
- ✅ Authentication and session management
- ✅ Gemini AI validation and responses
- ✅ Message history and chat management

## Design
- Matches the style from the reference image
- Modern gradient header with green theme
- Smooth animations and transitions
- Responsive and user-friendly
- Professional appearance

