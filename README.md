<h1 align="center">whitekid-sockets</h1>

<p align="center">
  A WhatsApp Web socket library for bots and automation.<br/>
  Built by <strong>Whitekid Tech</strong>, Zimbabwe.
</p>

<p align="center">
  <a href="https://whitekidtechzw.netlify.app"><img src="https://img.shields.io/badge/Website-Whitekid%20Tech-0A0A0A?style=for-the-badge&logo=google-chrome&logoColor=white"/></a>
  <a href="https://github.com/whitekidtechzw-creator"><img src="https://img.shields.io/badge/GitHub-whitekidtechzw--creator-0A0A0A?style=for-the-badge&logo=github&logoColor=white"/></a>
</p>

---

## 🚀 Quick start (Whitekid)

```js
import startWhitekid from 'whitekid-sockets'

const wk = await startWhitekid({
  sessionDir: './session',
  phoneNumber: '2637XXXXXXXX',          // pair with a code, no QR
  onCode: (code) => console.log('Pairing code:', code),
  onReady: () => console.log('Connected'),
  onMessage: async (msg, sock, say) => {
    const text = msg.message?.conversation
    if (text === '.ping') await say(msg.key.remoteJid, 'pong', msg)
  }
})
```

It reconnects on its own with backoff and stops only when the account is logged out. Everything else in this README (`makeWASocket`, buttons, carousels and so on) is still exported from the same package.

---

## 📦 Changelog

### v5.9.12 — Security & Stability Update
> Synced with upstream Baileys `v7.0.0-rc12` + `v7.0.0-rc13`

**🔒 Security Fix (GHSA-qvv5-jq5g-4cgg)**
- Added `isFromSelf` guard on sensitive `protocolMessage` types: `HISTORY_SYNC_NOTIFICATION`, `APP_STATE_SYNC_KEY_SHARE`, `PEER_DATA_OPERATION_REQUEST_RESPONSE_MESSAGE`, `LID_MIGRATION_MAPPING_SYNC`
- These could previously be triggered by spoofed messages from other users

**🐛 Bug Fix — `fromMe` Regression (rc13)**
- Fixed: `protocolMessage` guard was failing for group and offline messages where `key.fromMe` was incorrectly set to `false`
- Fix: `isFromSelf` now also checks if `participant` matches own JID (`meId`)

---

### v5.9.11 — Major Upstream Sync
> Synced with upstream Baileys `v7.0.0-rc10` + `v7.0.0-rc11`

**✨ New Features**
- `@all` mention support in groups
- Album message sending (`albumMessage` + `albumParentKey`)
- Member labels support (`updateMemberLabel`, `GROUP_MEMBER_LABEL_CHANGE` event)
- Username + USync support (`USyncUsernameProtocol`)
- Newsletter v2 endpoints (`newsletterFollow`, `newsletterUnfollow`, `newsletterMute`, `newsletterUnmute`)
- Companion registration utils — new QR code format
- Reachout Timelock (463 error) handling + `reachoutTimeLock` event
- New chat limits functions
- Full TC Token lifecycle: issuance, revocation, expiration, pruning
- Reporting tokens support
- Rust App State Sync via `whatsapp-rust-bridge`
- Past participants in history sync
- FB and Interop JID support (EU Interoperability APIs)
- `isFromSelf` guard foundations in place

**🚀 Performance**
- 30x speed improvement on binary node children lookups (WeakMap cache in `getBinaryNodeChildren`)
- Caching and batching overhaul
- Mutex redesign + improved offline node batching
- Optimised sync memory and CPU usage

**🐛 Bug Fixes**
- Ghost session fix
- Connection deadlock fix
- Race condition fix
- Memory leak fixes (significant spike reduction)
- Stability fixes for resending messages
- Fixed Meta Ads messages
- Encryption failure handling
- LID↔PN mappings from contactAction, historySync, mex notifications
- App state logic improvements
- Waveform bug fix
- Fixed 40+ npm/GitHub vulnerabilities
- `libsignal` dep moved from git → npm (no more git required to install)
- WASM SIMD fix for old VPS/servers lacking SIMD support

---

## Overview

** W H I T E K I D — S O C K E T S** is a modern WebSocket library for building WhatsApp bots and automation systems.  
It focuses on performance, simplicity, and a clean developer experience — without unnecessary overhead.

No Selenium. No Chromium. Just a fast, lightweight connection built for real-time messaging.

---

## ✦ Why whitekid-sockets?

- ⚡ **Fast by design** — optimized for real-time performance  
- 🧩 **Simple to use** — clean API, easy integration  
- 🪶 **Lightweight** — no heavy dependencies  
- 🔐 **Modern authentication** — secure pairing code (no QR)  
- 🎯 **Production ready** — stable and reliable  
- 🤖 **AI-ready** — supports WhatsApp `AI ✦` message badge  
- 🔘 **Button support** — native flow buttons, lists, CTAs, carousel  

---

## ✦ Features

- Multi-device support  
- Pairing code login (no QR scan required)  
- Clean, branded console output  
- Pure JavaScript (no build step needed)  
- Actively maintained by **Whitekid Tech**
- **Interactive buttons** (quick reply, URL, copy code, call, list, location)
- **Carousel messages** with image cards and per-card buttons
- **AI Rich Response** messages (WhatsApp AI `✦` badge)

---

## Installation & Setup

Install `whitekid-sockets` using npm, yarn, or pnpm:

```bash
# npm
npm install whitekid-sockets

# yarn
yarn add whitekid-sockets

# pnpm
pnpm add whitekid-sockets
```

## Termux Methods

Set up and run `whitekid-sockets` directly on Android using Termux.

### 1. Install Dependencies
Open Termux and run:
```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
termux-setup-storage
```

## VS Code Methods

Set up and run `whitekid-sockets` using VS Code on PC or mobile.

### Method 1: VS Code on PC/Mac/Linux

1. **Create project folder**
```bash
mkdir whitekid-bot
cd whitekid-bot
```


> Requires Node.js **>= 20.0.0**

---

## 📚 Index

- 🔗 [Connecting Account](#connecting-account)
  - 🔑 [Connect with Pairing Code](#connect-with-pairing-code)
  - 📷 [Connect with QR Code](#connect-with-qr-code)
  - 📥 [Receive Full History](#receive-full-history)
- 💾 [Save & Restore Sessions](#save--restore-sessions)
- ⚡ [Handling Events](#handling-events)
- 📤 [Sending Messages](#sending-messages)
  - 💬 [Text Message](#text-message)
  - ✦ 🤖 [AI Badge Message](#ai-badge-message-)
  - ↩️ [Quote / Reply Message](#quote--reply-message)
  - 👤 [Mention User](#mention-user)
  - 🔁 [Forward Messages](#forward-messages)
  - 📍 [Location Message](#location-message)
  - 📇 [Contact Message](#contact-message)
  - ❤️ [Reaction Message](#reaction-message)
  - 📌 [Pin Message](#pin-message)
  - 📊 [Poll Message](#poll-message)
  - 🔗 [Link Preview](#link-preview)
  - 🖼️ [Image Message](#image-message)
  - 🎥 [Video Message](#video-message)
  - 🎙️ [Audio / PTT Message](#audio--ptt-message)
  - 🎞️ [GIF Message](#gif-message)
  - 👁️ [View Once Message](#view-once-message)
  - 📄 [Document Message](#document-message)
  - 🧩 [Sticker Message](#sticker-message)
  - 🔘 [Interactive Buttons](#interactive-buttons)
  - 🎠 [Carousel Messages](#carousel-messages)
  - 🤖 [AI Rich Response](#ai-rich-response)
- ✏️ [Modify Messages](#modify-messages)
  - ❌ [Delete for Everyone](#delete-for-everyone)
  - 📝 [Edit Message](#edit-message)
- 📩 [Receiving Messages](#receiving-messages)
- 👀 [Read & Presence](#read--presence)
- 💬 [Modifying Chats](#modifying-chats)
- 🔍 [User Queries](#user-queries)
- 🧑‍💻 [Change Profile](#change-profile)
- 🔒 [Privacy Settings](#privacy-settings)
- 👥 [Groups](#groups)
- 📢 [Broadcast & Stories](#broadcast--stories)
- 🎧 [Media](#media)
- 📞❌ [Reject Call](#reject-call)
- 🖥️ [Console Banner](#console-banner)
- ⚠️ [Disclaimer](#disclaimer)

---

## Connecting Account

### Connect with Pairing Code

## 🔐 Pairing Code System

** W H I T E K I D — S O C K E T S ** intelligently selects **one of three unique pairing codes** for each session — ensuring identity, branding, and flexibility.

| 🔑 Code     | ⚡ Type                    |
|------------|-----------------------------|
| `WHITEKID` | Whitekid signature          |
| `WKTECHZW` | Whitekid Tech               |
| `WKPRIMEX` | Whitekid Prime              |

> ✦ Each session is assigned a code **randomly** for a dynamic and secure connection experience.

```js
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from 'whitekid-sockets'
import { Boom } from '@hapi/boom'

const { state, saveCreds } = await useMultiFileAuthState('./session')

const sock = makeWASocket({ auth: state })

sock.ev.on('creds.update', saveCreds)

const code = await sock.requestPairingCode('2637XXXXXXXX')
console.log('Pairing code:', code)

sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
        const shouldReconnect =
            (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true
        if (shouldReconnect) { /* reconnect */ }
    } else if (connection === 'open') {
        console.log('Connected to WhatsApp!')
    }
})
```

Or use a custom 8-character code:

```js
const code = await sock.requestPairingCode('2637XXXXXXXX', 'WHITEKID')
```

### Connect with QR Code

```js
import makeWASocket, { useMultiFileAuthState } from 'whitekid-sockets'
import qrcode from 'qrcode-terminal'

const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ auth: state })

sock.ev.on('connection.update', ({ qr }) => {
    if (qr) qrcode.generate(qr, { small: true })
})

sock.ev.on('creds.update', saveCreds)
```

### Receive Full History

```js
const sock = makeWASocket({ auth: state, syncFullHistory: true })
```

---

## Save & Restore Sessions

```js
import { useMultiFileAuthState } from 'whitekid-sockets'

const { state, saveCreds } = await useMultiFileAuthState('./session')
const sock = makeWASocket({ auth: state })
sock.ev.on('creds.update', saveCreds)
```

> Keep the `./session` folder private — it holds your active WhatsApp session.

---

## Handling Events

```js
sock.ev.on('connection.update', (update) => console.log('Connection:', update))
sock.ev.on('messages.upsert', ({ messages, type }) => console.log('Messages:', messages))
sock.ev.on('messages.update', (updates) => console.log('Updates:', updates))
sock.ev.on('chats.update', (chats) => console.log('Chats updated:', chats))
sock.ev.on('contacts.update', (contacts) => console.log('Contacts updated:', contacts))
sock.ev.on('presence.update', ({ id, presences }) => console.log(`${id} presence:`, presences))
sock.ev.on('group-participants.update', ({ id, participants, action }) => {
    console.log(`Group ${id}: ${action}`, participants)
})
sock.ev.on('call', (calls) => console.log('Incoming call:', calls))
```

---

## Sending Messages

Sending is silent: nothing extra is printed to the console after a message is delivered.

### Text Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', {
    text: 'Hello from Whitekid sockets!'
})
```

---

### AI Badge Message ✦

> **Whitekid sockets exclusive feature.**

Add `ai: true` to any `sendMessage` call and WhatsApp will render the **`AI ✦`** badge next to the timestamp — visually marking the message as AI-generated. Works on **all message types**.

```js
// Text with AI badge
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { text: 'Hello! I am an AI assistant.', ai: true })

// Image with AI badge
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { image: { url: './image.jpg' }, caption: 'Generated by AI', ai: true })

// Voice note with AI badge
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { audio: { url: './voice.ogg' }, mimetype: 'audio/ogg; codecs=opus', ptt: true, ai: true })
```

---

### Quote / Reply Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { text: 'This is a reply!' }, { quoted: messageToQuote })
```

### Mention User

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', {
    text: '@2637XXXXXXXX hello!',
    mentions: ['2637XXXXXXXX@s.whatsapp.net']
})
```

### Forward Messages

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { forward: messageToForward })
```

### Location Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', {
    location: { degreesLatitude: -17.8252, degreesLongitude: 31.0335 }
})
```

### Contact Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', {
    contacts: {
        displayName: 'John',
        contacts: [{ vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:John\nTEL;type=CELL:+2637XXXXXXXX\nEND:VCARD' }]
    }
})
```

### Reaction Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { react: { text: '🔥', key: messageToReactTo.key } })
```

### Pin Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { pin: messageToPin.key, type: 1 }) // 1 = pin, 0 = unpin
```

### Poll Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', {
    poll: { name: 'Favourite colour?', values: ['Red', 'Blue', 'Green'], selectableCount: 1 }
})
```

### Link Preview

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', {
    text: 'Check this out: https://whitekidtechzw.netlify.app'
}, { detectLinks: true })
```

### Image Message

```js
// From file
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { image: { url: './image.jpg' }, caption: 'Sent via Whitekid sockets' })

// From buffer
import { readFileSync } from 'fs'
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { image: readFileSync('./image.jpg'), caption: 'Hello!' })
```

### Video Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { video: { url: './video.mp4' }, caption: 'Watch this!', gifPlayback: false })
```

### Audio / PTT Message

```js
// Audio file
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { audio: { url: './audio.mp3' }, mimetype: 'audio/mp4' })

// Voice note (PTT)
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { audio: { url: './voice.ogg' }, mimetype: 'audio/ogg; codecs=opus', ptt: true })
```

### GIF Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { video: { url: './animation.mp4' }, gifPlayback: true, caption: 'lol' })
```

### View Once Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { image: { url: './secret.jpg' }, viewOnce: true, caption: 'View once!' })
```

### Document Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { document: { url: './file.pdf' }, mimetype: 'application/pdf', fileName: 'report.pdf' })
```

### Sticker Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { sticker: { url: './sticker.webp' } })
```

---

## Interactive Buttons

### Quick Reply Buttons

```js
await sock.sendMessage(jid, {
    text: 'Choose an option:',
    interactiveButtons: [
        { type: 'quick_reply', displayText: 'Option A', id: 'opt_a' },
        { type: 'quick_reply', displayText: 'Option B', id: 'opt_b' },
    ]
})
```

### CTA URL Button

```js
await sock.sendMessage(jid, {
    text: 'Visit our site',
    interactiveButtons: [
        { type: 'cta_url', displayText: 'Open Website', url: 'https://whitekidtechzw.netlify.app' }
    ]
})
```

### Copy Code Button

```js
await sock.sendMessage(jid, {
    text: 'Your promo code:',
    interactiveButtons: [
        { type: 'cta_copy', displayText: 'Copy Code', copyCode: 'WHITEKID' }
    ]
})
```

### Call Button

```js
await sock.sendMessage(jid, {
    text: 'Contact support:',
    interactiveButtons: [
        { type: 'cta_call', displayText: 'Call Us', phoneNumber: '+263xxxxxxxxx' }
    ]
})
```

### List / Single Select

```js
await sock.sendMessage(jid, {
    text: 'Pick a menu item:',
    interactiveButtons: [
        {
            type: 'single_select',
            title: 'Menu',
            sections: [
                {
                    title: 'Commands',
                    rows: [
                        { header: 'Help', title: 'help', description: 'Show help menu', id: 'cmd_help' },
                        { header: 'Status', title: 'status', description: 'Bot status', id: 'cmd_status' },
                    ]
                }
            ]
        }
    ]
})
```

### With Image / Video Header

```js
await sock.sendMessage(jid, {
    image: { url: 'https://example.com/banner.jpg' },
    body: 'Welcome to Whitekid AI',
    footer: 'Powered by Whitekid Tech',
    interactiveButtons: [
        { type: 'quick_reply', displayText: 'Get Started', id: 'start' },
        { type: 'cta_url', displayText: 'Learn More', url: 'https://whitekidtechzw.netlify.app' }
    ]
})
```

### Button Name Aliases

All short aliases are auto-resolved — use whichever feels natural:

| Alias | Resolves To |
|-------|-------------|
| `quick`, `reply` | `quick_reply` |
| `url`, `link` | `cta_url` |
| `copy`, `code`, `coupon` | `cta_copy` |
| `call`, `phone` | `cta_call` |
| `list`, `menu`, `select` | `single_select` |
| `location` | `send_location` |
| `reminder` | `cta_reminder` |

### Handling Button Tap Responses

```js
sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
        const interactive = msg.message?.interactiveResponseMessage
        if (interactive) {
            const body = interactive.nativeFlowResponseMessage?.paramsJson
            const params = JSON.parse(body || '{}')
            console.log('Button tapped:', params.id || params)
        }
    }
})
```

---

## Carousel Messages

```js
await sock.sendMessage(jid, {
    carousel: {
        text: 'Check out our products:',
        cards: [
            {
                image: { url: 'https://example.com/product1.jpg' },
                title: 'Product One',
                body: 'Best seller this week',
                footer: 'R 99.99',
                buttons: [
                    { type: 'quick_reply', displayText: 'Buy Now', id: 'buy_1' },
                    { type: 'cta_url', displayText: 'View', url: 'https://example.com/1' }
                ]
            },
            {
                image: { url: 'https://example.com/product2.jpg' },
                title: 'Product Two',
                body: 'New arrival',
                footer: 'R 149.99',
                buttons: [
                    { type: 'quick_reply', displayText: 'Buy Now', id: 'buy_2' }
                ]
            }
        ]
    }
})
```

---

## AI Rich Response

### Simple AI message

```js
await sock.sendMessage(jid, {
    richResponse: {
        text: 'Hello from Whitekid AI!',
        submessages: [{ messageText: 'Hello from Whitekid AI!' }]
    }
})
```

### With sources

```js
await sock.sendMessage(jid, {
    richResponse: {
        text: 'Here is the answer.',
        submessages: [{ messageText: 'Here is the answer.' }],
        sources: [{ title: 'Source 1', url: 'https://example.com' }]
    }
})
```

### Raw botForwardedMessage

```js
await sock.sendMessage(jid, {
    botForwardedMessage: { /* raw proto object */ },
    messageContextInfo: { /* optional */ }
})
```

---

## Modify Messages

### Delete for Everyone

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { delete: messageToDelete.key })
```

### Edit Message

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { edit: messageToEdit.key, text: 'Updated text here' })
```

---

## Receiving Messages

```js
sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
        if (msg.key.fromMe) continue
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
        console.log(`[${msg.key.remoteJid}]: ${text}`)
    }
})
```

---

## Read & Presence

### Read Messages

```js
await sock.readMessages([{ remoteJid: '2637XXXXXXXX@s.whatsapp.net', id: 'MESSAGE_ID', fromMe: false }])
```

### Send Typing / Recording / Online

```js
await sock.sendPresenceUpdate('composing', '2637XXXXXXXX@s.whatsapp.net')  // typing
await sock.sendPresenceUpdate('recording', '2637XXXXXXXX@s.whatsapp.net')  // recording
await sock.sendPresenceUpdate('paused', '2637XXXXXXXX@s.whatsapp.net')     // stop
await sock.sendPresenceUpdate('available')    // online
await sock.sendPresenceUpdate('unavailable')  // offline
```

### Subscribe to Presence

```js
await sock.presenceSubscribe('2637XXXXXXXX@s.whatsapp.net')
sock.ev.on('presence.update', ({ id, presences }) => console.log(`${id}:`, presences))
```

---

## Modifying Chats

### Archive a Chat

```js
await sock.chatModify({ archive: true }, '2637XXXXXXXX@s.whatsapp.net')   // archive
await sock.chatModify({ archive: false }, '2637XXXXXXXX@s.whatsapp.net')  // unarchive
```

### Mute / Unmute a Chat

```js
await sock.chatModify({ mute: Date.now() + (8 * 60 * 60 * 1000) }, '2637XXXXXXXX@s.whatsapp.net') // mute 8hr
await sock.chatModify({ mute: null }, '2637XXXXXXXX@s.whatsapp.net') // unmute
```

### Mark Chat Read / Unread

```js
await sock.chatModify({ markRead: true }, '2637XXXXXXXX@s.whatsapp.net')
await sock.chatModify({ markRead: false }, '2637XXXXXXXX@s.whatsapp.net')
```

### Delete a Chat

```js
await sock.chatModify({
    delete: true,
    lastMessages: [{ key: lastMessage.key, messageTimestamp: lastMessage.messageTimestamp }]
}, '2637XXXXXXXX@s.whatsapp.net')
```

### Star / Unstar a Message

```js
await sock.star('2637XXXXXXXX@s.whatsapp.net', [message], true)   // star
await sock.star('2637XXXXXXXX@s.whatsapp.net', [message], false)  // unstar
```

### Disappearing Messages

```js
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { disappearingMessagesInChat: 604800 }) // 7 days
await sock.sendMessage('2637XXXXXXXX@s.whatsapp.net', { disappearingMessagesInChat: 0 })      // disable
```

---

## User Queries

### Check if ID Exists

```js
const [result] = await sock.onWhatsApp('2637XXXXXXXX')
console.log(result?.exists, result?.jid)
```

### Fetch Status

```js
const statuses = await sock.fetchStatus('2637XXXXXXXX@s.whatsapp.net')
```

### Fetch Profile Picture

```js
const url = await sock.profilePictureUrl('2637XXXXXXXX@s.whatsapp.net', 'image')
const groupUrl = await sock.profilePictureUrl('GROUPID@g.us', 'image')
```

### Fetch Business Profile

```js
const profile = await sock.getBusinessProfile('2637XXXXXXXX@s.whatsapp.net')
console.log(profile?.description, profile?.category)
```

### Fetch Blocklist

```js
const blocked = await sock.fetchBlocklist()
```

---

## Change Profile

```js
await sock.updateProfileStatus('Powered by Whitekid sockets 🔥')
await sock.updateProfileName('My Bot Name')
await sock.updateProfilePicture('me', { url: './avatar.jpg' })
await sock.updateProfilePicture('GROUPID@g.us', { url: './group.jpg' })
await sock.removeProfilePicture('me')
```

---

## Privacy Settings

```js
await sock.updateBlockStatus('2637XXXXXXXX@s.whatsapp.net', 'block')    // block
await sock.updateBlockStatus('2637XXXXXXXX@s.whatsapp.net', 'unblock')  // unblock

// Options: 'all' | 'contacts' | 'contact_blacklist' | 'none'
await sock.updateLastSeenPrivacy('contacts')
await sock.updateOnlinePrivacy('match_last_seen')
await sock.updateProfilePicturePrivacy('contacts')
await sock.updateStatusPrivacy('contacts')
await sock.updateReadReceiptsPrivacy('all')      // 'all' = show | 'none' = hide
await sock.updateGroupsAddPrivacy('contacts')    // who can add you to groups
await sock.updateDefaultDisappearingMode(604800) // 86400=1d, 604800=7d, 7776000=90d
```

---

## Groups

### Create a Group

```js
const group = await sock.groupCreate('My Bot Group', ['2637XXXXXXXX@s.whatsapp.net'])
console.log('Created:', group.id)
```

### Add / Remove / Promote / Demote

```js
await sock.groupParticipantsUpdate('GROUPID@g.us', ['2637XXXXXXXX@s.whatsapp.net'], 'add')
await sock.groupParticipantsUpdate('GROUPID@g.us', ['2637XXXXXXXX@s.whatsapp.net'], 'remove')
await sock.groupParticipantsUpdate('GROUPID@g.us', ['2637XXXXXXXX@s.whatsapp.net'], 'promote')
await sock.groupParticipantsUpdate('GROUPID@g.us', ['2637XXXXXXXX@s.whatsapp.net'], 'demote')
```

### Group Settings

```js
await sock.groupUpdateSubject('GROUPID@g.us', 'New Group Name')
await sock.groupUpdateDescription('GROUPID@g.us', 'New description here')
await sock.groupSettingUpdate('GROUPID@g.us', 'announcement')    // only admins send
await sock.groupSettingUpdate('GROUPID@g.us', 'not_announcement')// everyone sends
await sock.groupSettingUpdate('GROUPID@g.us', 'locked')          // only admins edit info
await sock.groupSettingUpdate('GROUPID@g.us', 'unlocked')        // everyone edits info
await sock.groupLeave('GROUPID@g.us')
```

### Invite Links

```js
const code = await sock.groupInviteCode('GROUPID@g.us')
console.log('https://chat.whatsapp.com/' + code)

await sock.groupRevokeInvite('GROUPID@g.us')
await sock.groupAcceptInvite('INVITECODE')
const info = await sock.groupGetInviteInfo('INVITECODE')
```

### Group Info

```js
const meta = await sock.groupMetadata('GROUPID@g.us')
const groups = await sock.groupFetchAllParticipating()
await sock.groupToggleEphemeral('GROUPID@g.us', 604800) // enable 7d
await sock.groupToggleEphemeral('GROUPID@g.us', 0)      // disable
```

### Approve / Reject Join Requests

```js
const requests = await sock.groupRequestParticipantsList('GROUPID@g.us')
await sock.groupRequestParticipantsUpdate('GROUPID@g.us', ['2637XXXXXXXX@s.whatsapp.net'], 'approve')
await sock.groupRequestParticipantsUpdate('GROUPID@g.us', ['2637XXXXXXXX@s.whatsapp.net'], 'reject')
```

---

## Broadcast & Stories

```js
// Text status
await sock.sendMessage('status@broadcast', { text: 'Whitekid sockets is live! 🔥' })

// Image status
await sock.sendMessage('status@broadcast', { image: { url: './banner.jpg' }, caption: 'Powered by Whitekid Tech' })

// Send to specific contacts
await sock.sendMessage('status@broadcast', { text: 'Hello!' }, {
    statusJidList: ['2637XXXXXXXX@s.whatsapp.net', '2637YYYYYYYY@s.whatsapp.net']
})
```

---

## Media

### Download Media Message

```js
import { downloadMediaMessage } from 'whitekid-sockets'

sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
        if (msg.message?.imageMessage) {
            const buffer = await downloadMediaMessage(msg, 'buffer', {})
        }
    }
})
```

### Re-upload Media to WhatsApp

```js
await sock.updateMediaMessage(message)
```

---

## Reject Call

```js
sock.ev.on('call', async (calls) => {
    for (const call of calls) {
        if (call.status === 'offer') await sock.rejectCall(call.id, call.from)
    }
})
```

## Setup for Your Bots

Import the versions correctly for each package:

```js
// For Baileys
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys';

// For whitekid-sockets  
import { fetchLatestWhitekidSocketsVersion } from 'whitekid-sockets';
---
```
## Setup / Imports

Import `whitekid-sockets` like this:

```js
const { 
  default: makeWASocket,
  fetchLatestWhitekidSocketsVersion,
  downloadContentFromMessage,
  useMultiFileAuthState,
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType 
} = require('whitekid-sockets');
```

## WhatsApp Bot — Auto Read / Typing / Recording

```js
if (!WhitekidTech.public) {
    if (!isCreator && !m.key.fromMe) return
}

if (autoread) WhitekidTech.readMessages([m.key])
if (global.autoTyping) WhitekidTech.sendPresenceUpdate('composing', from)
if (global.autoRecording) WhitekidTech.sendPresenceUpdate('recording', from)
```

---

## Console Banner

`startWhitekid()` prints a gradient **WHITEKID TECHZW** banner once when it starts. Turn it off with `startWhitekid({ banner: false })`, or set the `NO_COLOR` environment variable for plain text. You can also print it yourself:

```js
import { printBanner } from 'whitekid-sockets'
printBanner()
```

---

## Disclaimer

This project is **not** affiliated with, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or Meta Platforms Inc.

"WhatsApp" and related names, marks, and images are registered trademarks of their respective owners. Use responsibly. Do not violate WhatsApp's Terms of Service.

## Warning

Do not use this library for spam, bugs, or any malicious activity. Use it responsibly, and automate only accounts you are allowed to automate.

---

## Author

**Whitekid Tech**, Zimbabwe

- GitHub: [whitekidtechzw-creator](https://github.com/whitekidtechzw-creator)
- Website: [whitekidtechzw.netlify.app](https://whitekidtechzw.netlify.app)

<sub>© 2026 Whitekid Tech. Based on MIT-licensed work, see LICENSE.</sub>
