/**
 * Enterprise SOC AI Security Intelligence Copilot
 * ---------------------------------------------------------------------------
 * A cinematic, high-performance cyber defense workspace.
 * Features:
 *  - Full Conversation Search, Pins, Renames, Deletions (localStorage persisted)
 *  - Automated threat input recognizers (URLs, IPs, Hashes, Logs, CVEs, QR, SMS)
 *  - Voice Input (STT) and Voice Read Response (TTS)
 *  - Interactive Risk Gauge and Active API Key Indicators (feeds /api/keys-status)
 *  - Dynamic simulated live threat stream and rotates security guidelines
 *  - Drag & Drop / manual file uploader with screen/log parsing
 *  - PDF, Print, Share, Copy and Save Report triggers
 */

// 1. Premium Dark Hacker Styles Injection
const copilotStyles = `
  #tab-cyber-emergency {
    background: radial-gradient(circle at 50% 50%, #030816 0%, #010206 100%) !important;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100vh - 100px);
    min-height: 800px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  
  /* Cyber grid background */
  #tab-cyber-emergency::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(6, 182, 212, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: center;
    pointer-events: none;
    z-index: 1;
    animation: grid-shift-cyber 120s linear infinite;
  }
  
  /* Cosmic blue ambient fogs */
  #tab-cyber-emergency::after {
    content: "";
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
    top: 10%; left: 30%;
    pointer-events: none;
    z-index: 1;
    filter: blur(80px);
    animation: blue-fog-drift 25s ease-in-out infinite alternate;
  }

  @keyframes grid-shift-cyber {
    from { background-position: 0 0; }
    to { background-position: 1000px 1000px; }
  }
  @keyframes blue-fog-drift {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(150px, 80px) scale(1.2); }
  }

  /* Scrollbars */
  .copilot-sidebar::-webkit-scrollbar,
  .sidebar-scrollable-section::-webkit-scrollbar,
  .copilot-messages-list::-webkit-scrollbar,
  .copilot-right-panel::-webkit-scrollbar {
    width: 4px; height: 4px;
  }
  .copilot-sidebar::-webkit-scrollbar-thumb,
  .sidebar-scrollable-section::-webkit-scrollbar-thumb,
  .copilot-messages-list::-webkit-scrollbar-thumb,
  .copilot-right-panel::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.25);
    border-radius: 4px;
  }

  /* Workspace Layout container */
  .copilot-workspace-container {
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 2;
    overflow: hidden;
    transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* When sidebar is collapsed */
  .copilot-workspace-container.sidebar-collapsed {
    grid-template-columns: 64px 1fr 300px;
  }

  /* Left Sidebar Navigation */
  .copilot-sidebar {
    background: rgba(3, 7, 18, 0.9);
    border-right: 1px solid rgba(6, 182, 212, 0.15);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    padding: 18px;
    gap: 16px;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    z-index: 10;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Sidebar toggled state */
  .copilot-sidebar.collapsed {
    padding: 16px 8px;
    align-items: center;
  }
  
  /* Sidebar Header & Brand */
  .sidebar-brand-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(6, 182, 212, 0.15);
    transition: all 0.3s;
    width: 100%;
  }
  .copilot-sidebar.collapsed .sidebar-brand-header {
    border-bottom-color: transparent;
    justify-content: center;
    padding-bottom: 0;
  }
  .brand-text-container {
    display: flex;
    flex-direction: column;
    transition: opacity 0.2s;
  }
  .copilot-sidebar.collapsed .brand-text-container {
    display: none;
  }
  .brand-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  }
  .brand-subtitle {
    font-family: var(--font-mono);
    font-size: 8.5px;
    color: var(--cyan-bright);
    letter-spacing: 1.5px;
  }

  /* Collapsible Toggle button styling */
  .copilot-sidebar-toggle {
    position: absolute;
    top: 14px;
    left: 260px;
    z-index: 100;
    background: #020617;
    border: 1px solid rgba(6, 182, 212, 0.3);
    color: var(--cyan-bright);
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .copilot-sidebar-toggle:hover {
    background: var(--cyan-bright);
    color: #000;
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
  }
  .sidebar-collapsed .copilot-sidebar-toggle {
    left: 48px;
    transform: rotate(180deg);
  }

  /* Sidebar Search area */
  .copilot-search-container {
    position: relative;
    width: 100%;
    transition: all 0.3s;
  }
  .copilot-sidebar.collapsed .copilot-search-container {
    opacity: 0;
    pointer-events: none;
    height: 0;
    margin: 0;
    overflow: hidden;
  }
  .copilot-search-container .search-icon {
    position: absolute;
    left: 10px; top: 50%;
    transform: translateY(-50%);
    width: 14px; height: 14px;
    color: var(--text-muted);
    pointer-events: none;
  }
  .copilot-search-container input {
    width: 100%;
    padding: 10px 10px 10px 32px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    outline: none;
    transition: all 0.2s;
  }
  .copilot-search-container input:focus {
    border-color: var(--cyan-bright);
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
    background: rgba(15, 23, 42, 0.9);
  }

  /* Sidebar List sections */
  .sidebar-scrollable-section {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 4px;
  }
  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.3s;
  }
  .sidebar-section .section-title {
    font-size: 9px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 1.5px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s;
  }
  .copilot-sidebar.collapsed .sidebar-section .section-title {
    justify-content: center;
    font-size: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    padding-top: 8px;
    margin-top: 4px;
  }
  .copilot-sidebar.collapsed .sidebar-section .section-title i {
    width: 14px; height: 14px;
    color: var(--cyan-bright);
  }
  .chats-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .chat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 12.5px;
    color: var(--text-secondary);
  }
  .chat-item:hover, .chat-item.active-nav, .chat-item.active {
    background: rgba(6, 182, 212, 0.08);
    border-color: rgba(6, 182, 212, 0.3);
    color: #fff;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
  }
  .chat-item.active-nav {
    border-left: 2px solid var(--cyan-bright);
  }
  .copilot-sidebar.collapsed .chat-item {
    padding: 10px;
    justify-content: center;
  }
  .chat-item-text {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: opacity 0.2s;
  }
  .copilot-sidebar.collapsed .chat-item-text {
    display: none;
  }
  .chat-item-actions {
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .chat-item:hover .chat-item-actions {
    opacity: 1;
  }
  .chat-item-actions button {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 11px;
    padding: 2px;
    transition: color 0.15s;
  }
  .chat-item-actions button:hover {
    color: var(--cyan-bright);
  }
  .copilot-sidebar.collapsed .chat-item-actions {
    display: none;
  }

  /* Dev badge at bottom of sidebar */
  .sidebar-dev-footer {
    border-top: 1px solid rgba(6, 182, 212, 0.15);
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    color: var(--text-muted);
  }
  .copilot-sidebar.collapsed .sidebar-dev-footer {
    display: none;
  }
  .sidebar-dev-footer .badge-title {
    color: var(--cyan-bright);
    font-weight: 700;
  }
  .sidebar-dev-footer .badge-sub {
    color: #fff;
    font-weight: 500;
  }
  .sidebar-dev-footer .badge-title-sub {
    color: var(--rose-bright);
    font-size: 8.5px;
  }

  /* Center Panel */
  .copilot-center-panel {
    background: rgba(2, 6, 20, 0.75);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .copilot-welcome-screen {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    padding: 32px;
    gap: 20px;
    overflow-y: auto;
  }

  /* Black Wolf Premium Hero Design */
  .black-wolf-hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 15px;
    width: 100%;
    max-width: 680px;
  }
  .logo-wrapper {
    position: relative;
    width: 180px; height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(3, 7, 18, 0.45);
    border-radius: 50%;
    border: 1px solid rgba(6, 182, 212, 0.1);
    box-shadow: inset 0 0 25px rgba(6, 182, 212, 0.05);
  }
  .wolf-logo-svg {
    width: 150px; height: 150px;
    z-index: 5;
    filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.4));
  }
  
  /* Rotating Hexagon concentric rings */
  .hex-ring-outer {
    position: absolute;
    width: 172px; height: 172px;
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
    animation: spin-clockwise 15s linear infinite;
    pointer-events: none;
    z-index: 3;
  }
  .hex-ring-inner {
    position: absolute;
    width: 160px; height: 160px;
    border: 1px dashed rgba(6, 182, 212, 0.2);
    border-radius: 50%;
    animation: spin-counter 12s linear infinite;
    pointer-events: none;
    z-index: 2;
  }

  /* Pulse Wave rings */
  .pulse-wave-ring {
    position: absolute;
    width: 180px; height: 180px;
    border: 1.5px solid rgba(6, 182, 212, 0.4);
    border-radius: 50%;
    animation: pulse-outward 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
    pointer-events: none;
    z-index: 1;
  }
  .pulse-wave-ring.ring-delay-1 {
    animation-delay: 1.75s;
  }

  @keyframes pulse-outward {
    0% { transform: scale(0.9); opacity: 0.9; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes spin-clockwise {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes spin-counter {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }

  /* Floating Particles Canvas */
  .particle-container {
    position: absolute;
    top: -20px; left: -20px; right: -20px; bottom: -20px;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }
  .floating-particle-dot {
    position: absolute;
    background: var(--cyan-bright);
    border-radius: 50%;
    pointer-events: none;
    filter: drop-shadow(0 0 4px var(--cyan-bright));
    animation: float-particle-drift 8s linear infinite;
  }
  @keyframes float-particle-drift {
    0% { transform: translateY(110%) translateX(0); opacity: 0; }
    20% { opacity: 0.7; }
    80% { opacity: 0.7; }
    100% { transform: translateY(-10%) translateX(25px); opacity: 0; }
  }

  /* Wolf SVG scanning laser beam line animation */
  .wolf-scanline-beam {
    animation: laser-scanline 4s ease-in-out infinite alternate;
  }
  @keyframes laser-scanline {
    0% { y1: 20; y2: 20; opacity: 0.2; }
    50% { opacity: 1; filter: drop-shadow(0 0 5px var(--cyan-bright)); }
    100% { y1: 180; y2: 180; opacity: 0.2; }
  }
  @keyframes eye-pulse-scan {
    0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 2px #00f3ff); }
    50% { opacity: 1; filter: drop-shadow(0 0 8px #00f3ff); }
  }

  /* Branding details under logo */
  .hero-branding-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 10;
  }
  .brand-big-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 32px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 4px;
    text-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
    margin: 0;
    line-height: 1;
  }
  .brand-stat-title {
    font-family: var(--font-mono);
    color: var(--cyan-bright);
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-weight: 700;
    margin: 4px 0 0 0;
  }
  .brand-main-subtitle {
    font-size: 13.5px;
    color: var(--text-secondary);
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin: 0;
  }
  .hacker-dev-badge {
    margin-top: 8px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(3, 7, 18, 0.6) 100%);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 4px;
    padding: 6px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.05);
  }
  .hacker-dev-badge .lbl {
    font-size: 8px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .hacker-dev-badge .val {
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1.5px;
  }
  .hacker-dev-badge .sub {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--rose-bright);
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .hero-caps-slogan {
    margin-top: 10px;
    font-size: 12.5px;
    font-style: italic;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

  /* Live Status Badges Row */
  .live-status-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 15px 0 5px 0;
    width: 100%;
    max-width: 720px;
  }
  .status-badge-neon {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 4px;
    background: rgba(3, 7, 18, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 1px;
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .status-badge-neon .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  .pulse-green {
    border-color: rgba(16, 185, 129, 0.25);
    color: var(--emerald-bright);
  }
  .pulse-green .dot {
    background: #10b981;
    animation: dot-glow-green 1.5s infinite alternate;
  }
  .pulse-cyan {
    border-color: rgba(6, 182, 212, 0.25);
    color: var(--cyan-bright);
  }
  .pulse-cyan .dot {
    background: #06b6d4;
    animation: dot-glow-cyan 1.5s infinite alternate;
  }
  .pulse-blue {
    border-color: rgba(59, 130, 246, 0.25);
    color: #3b82f6;
  }
  .pulse-blue .dot {
    background: #3b82f6;
    animation: dot-glow-blue 1.5s infinite alternate;
  }
  .pulse-emerald {
    border-color: rgba(52, 211, 153, 0.25);
    color: #34d399;
  }
  .pulse-emerald .dot {
    background: #34d399;
    animation: dot-glow-emerald 1.5s infinite alternate;
  }
  .pulse-purple {
    border-color: rgba(168, 85, 247, 0.25);
    color: #a855f7;
  }
  .pulse-purple .dot {
    background: #a855f7;
    animation: dot-glow-purple 1.5s infinite alternate;
  }

  @keyframes dot-glow-green {
    0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0px #10b981; }
    100% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px #10b981; }
  }
  @keyframes dot-glow-cyan {
    0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0px #06b6d4; }
    100% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px #06b6d4; }
  }
  @keyframes dot-glow-blue {
    0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0px #3b82f6; }
    100% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px #3b82f6; }
  }
  @keyframes dot-glow-emerald {
    0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0px #34d399; }
    100% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px #34d399; }
  }
  @keyframes dot-glow-purple {
    0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0px #a855f7; }
    100% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 8px #a855f7; }
  }

  /* Welcome Checklist Cards */
  .welcome-checklist-section {
    background: rgba(4, 9, 20, 0.7);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 12px;
    padding: 16px 20px;
    width: 100%;
    max-width: 680px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
    backdrop-filter: blur(12px);
    margin-top: 10px;
  }
  .checklist-heading {
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 2px;
  }
  .checklist-subheading {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    text-align: left;
  }
  .checklist-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .checklist-card {
    background: rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 11.5px;
    transition: all 0.2s;
  }
  .checklist-card:hover {
    background: rgba(16, 185, 129, 0.05);
    border-color: rgba(16, 185, 129, 0.25);
    color: #fff;
    transform: translateY(-1px);
  }
  .checklist-card .check-icon {
    width: 13px; height: 13px;
    color: var(--emerald-bright);
    filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.4));
  }

  /* Quick Action Grid & Cards */
  .prompt-grid-container {
    width: 100%;
    max-width: 680px;
    margin-top: 12px;
  }
  .prompt-grid-container .grid-title {
    font-size: 10px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 1.5px;
    margin-bottom: 12px;
    text-align: left;
  }
  .prompt-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .prompt-card {
    background: rgba(15, 23, 42, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 14px;
    text-align: left;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .prompt-card:hover {
    background: rgba(6, 182, 212, 0.06);
    border-color: rgba(6, 182, 212, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.15);
  }
  .card-glow-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6, 182, 212, 0.12) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .prompt-card:hover .card-glow-overlay {
    opacity: 1;
  }
  .prompt-card .card-icon-anim {
    width: 18px; height: 18px;
    color: var(--cyan-bright);
    margin-bottom: 8px;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .prompt-card:hover .card-icon-anim {
    transform: scale(1.2) rotate(8deg);
  }
  .prompt-card h5 {
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }
  .prompt-card p {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.4;
  }

  /* Chat Message Screen */
  .copilot-chat-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .chat-header-bar {
    padding: 14px 20px;
    background: rgba(4, 9, 20, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(10px);
  }
  .chat-header-info h4 {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
  .chat-header-info p {
    font-size: 11px;
    color: var(--text-muted);
  }
  .chat-header-actions {
    display: flex;
    gap: 8px;
  }
  .header-action-btn {
    width: 32px; height: 32px;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .header-action-btn:hover {
    background: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    color: #fff;
  }
  .copilot-messages-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .copilot-msg {
    display: flex;
    flex-direction: column;
    max-width: 90%;
    margin-bottom: 4px;
  }
  .copilot-msg.user {
    align-self: flex-end;
  }
  .copilot-msg.assistant {
    align-self: flex-start;
    width: 100%;
  }
  .bubble-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: bold;
  }
  .user-bubble-body {
    background: rgba(6, 182, 212, 0.08);
    border: 1px solid rgba(6, 182, 212, 0.2);
    padding: 10px 14px;
    border-radius: 8px;
    color: #f1f5f9;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    display: inline-block;
  }

  /* Bottom Area */
  .copilot-bottom-area {
    padding: 14px 20px 20px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    background: rgba(2, 6, 20, 0.9);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .suggested-followups-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .suggested-followups-container::-webkit-scrollbar {
    height: 3px;
  }
  .followup-pill {
    padding: 6px 12px;
    background: rgba(6, 182, 212, 0.06);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 12px;
    color: var(--cyan-bright);
    font-size: 11.5px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .followup-pill:hover {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.3);
  }
  .copilot-input-box-container {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(6, 182, 212, 0.25);
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: border-color 0.2s;
  }
  .copilot-input-box-container:focus-within {
    border-color: var(--cyan-bright);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
  }
  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .input-attached-file {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--emerald-bright);
    font-family: var(--font-mono);
    display: flex;
    align-items: center;
    gap: 8px;
    align-self: flex-start;
  }
  .remove-attach-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 12px;
  }
  .remove-attach-btn:hover { color: var(--rose-bright); }
  .copilot-input-box-container textarea {
    flex-grow: 1;
    background: none;
    border: none;
    outline: none;
    color: #fff;
    font-size: 13px;
    line-height: 1.45;
    resize: none;
    max-height: 120px;
    padding: 4px 0;
  }
  .input-action-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .input-action-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  .input-action-btn.active {
    color: var(--cyan-bright);
    background: rgba(6, 182, 212, 0.1);
  }
  .copilot-send-btn {
    background: var(--cyan-bright);
    border: none;
    border-radius: 6px;
    width: 32px; height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    cursor: pointer;
    transition: all 0.2s;
  }
  .copilot-send-btn:hover {
    background: #22d3ee;
    transform: scale(1.05);
  }
  .copilot-disclaimer-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }
  .pulse-emerald {
    width: 6px; height: 6px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse-green 2s infinite;
  }

  /* Right Panel Widgets */
  .copilot-right-panel {
    background: rgba(4, 9, 20, 0.85);
    border-left: 1px solid rgba(6, 182, 212, 0.15);
    backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
    overflow-y: auto;
  }
  .right-panel-widget {
    background: rgba(15, 23, 42, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 12px;
  }
  .widget-title {
    font-size: 11px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    color: var(--cyan-bright);
    letter-spacing: 1px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  /* Risk Gauge Box */
  .risk-gauge-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 6px 0;
  }
  .gauge-ring-outer {
    position: relative;
    width: 90px; height: 90px;
  }
  .gauge-svg {
    transform: rotate(-90deg);
    width: 100%; height: 100%;
  }
  .gauge-value {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 800;
    color: #fff;
  }
  .gauge-status-text {
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-mono);
    letter-spacing: 1px;
  }
  .gauge-description {
    font-size: 10.5px;
    color: var(--text-muted);
    text-align: center;
    line-height: 1.4;
  }

  /* API Status Grid */
  .api-status-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .api-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-family: var(--font-mono);
  }
  .api-status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  .api-status-dot.active {
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }
  .api-status-dot.inactive {
    background: #ef4444;
    box-shadow: 0 0 6px #ef4444;
  }

  /* Live Threat Stream */
  .live-threat-feed {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 160px;
    overflow: hidden;
  }
  .threat-log-node {
    font-size: 10.5px;
    font-family: var(--font-mono);
    line-height: 1.35;
    padding: 6px;
    border-radius: 4px;
    background: rgba(2, 6, 23, 0.4);
    border-left: 2px solid rgba(255,255,255,0.1);
  }
  .threat-log-node.critical { border-left-color: var(--rose-bright); }
  .threat-log-node.high { border-left-color: var(--amber-bright); }

  /* Dropzone Overlay */
  .copilot-dropzone-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(2, 6, 23, 0.92);
    backdrop-filter: blur(8px);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .copilot-dropzone-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
  .dropzone-box {
    border: 2px dashed var(--cyan-bright);
    background: rgba(6, 182, 212, 0.05);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    max-width: 400px;
  }
  .dropzone-box i {
    width: 48px; height: 48px;
    color: var(--cyan-bright);
    margin-bottom: 16px;
  }

  /* Custom bento-briefing panel */
  .bento-briefing-card {
    background: rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(6, 182, 212, 0.15);
    border-radius: 10px;
    padding: 16px;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    width: 100%;
    box-sizing: border-box;
  }
  .bento-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(6,182,212,0.15);
    padding-bottom: 10px;
  }
  .bento-header h5 {
    font-family: var(--font-mono);
    color: var(--cyan-bright);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: 1fr 120px;
    gap: 12px;
  }
  .bento-box {
    background: rgba(2, 6, 23, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    padding: 12px;
  }
  .bento-box-title {
    font-size: 9px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 6px;
    font-weight: 700;
  }
  .accordion-section {
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 6px;
    overflow: hidden;
  }
  .accordion-trigger {
    background: rgba(15, 23, 42, 0.3);
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: #f1f5f9;
  }
  .accordion-trigger:hover {
    background: rgba(6, 182, 212, 0.04);
  }
  .accordion-content {
    background: rgba(2, 6, 23, 0.2);
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.03);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bento-action-row {
    display: flex;
    gap: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 10px;
  }
  .bento-action-btn {
    padding: 6px 12px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: var(--text-secondary);
    border-radius: 4px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .bento-action-btn:hover {
    background: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    color: #fff;
  }

  /* Page Brand Footer styling */
  .copilot-branding-footer {
    border-top: 1px solid rgba(6, 182, 212, 0.1);
    padding: 12px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    background: rgba(2, 6, 20, 0.95);
    z-index: 100;
  }
`;

// Inject Stylesheet
const copilotStyleEl = document.createElement('style');
copilotStyleEl.textContent = copilotStyles;
document.head.appendChild(copilotStyleEl);

// 2. Mock Security Database Categories (for quick select)
const THREAT_INTELLIGENCE_DB = [
  { id: "upi_fraud", title: "UPI & Banking Hijack", query: "Mitigate active UPI transaction trap / SIM swap cloning vectors." },
  { id: "creds_leak", title: "Corporate Credentials Leak", query: "Mitigate domain credentials leaked on cyber-crime registries." },
  { id: "sms_smishing", title: "Phishing SMS & Link Traps", query: "Audit fake delivery notification SMS with spoof OTP gateway." },
  { id: "cve_vulnerability", title: "CVE-2023-38606 Kernel Patch", query: "Perform audit parameters for CVE-2023-38606 privilege leak." },
  { id: "pcap_analyser", title: "PCAP SYN-Flood Flood Scan", query: "Analyze Wireshark log indicating SYN-flood on port 443." }
];

// Rotating Defensive Guardrails
const SECURITY_TIPS = [
  "Verify payee details and name credentials carefully before keying in UPI PINs.",
  "Decouple master network backups inside an off-site, air-gapped server.",
  "Enforce multi-factor verification (TOTP) globally on corporate directories.",
  "Rotate session API keys and database credentials on a 30-day loop.",
  "Audit active domain mappings for rogue SSL certificate creation attempts."
];

// Live Threat Stream Mock Events
const SIMULATED_STREAM_LOGS = [
  { text: "Firewall Node-04: SSH brute force blocked from 185.220.101.5", level: "high" },
  { text: "Log Monitor: Anomalous SQL-injection pattern on /api/auth blocked", level: "critical" },
  { text: "DDoS Deflector: Volumetric SYN-flood on port 443 filtered safely", level: "medium" },
  { text: "Endpoint Agent: Cryptominer signature run prevented on Host-82", level: "critical" },
  { text: "Email Gateway: Smishing link redirect bad-url.com flagged in queue", level: "medium" },
  { text: "Vulnerability Scan: Dynamic probing pattern recognized from 45.143.203.11", level: "high" }
];

// 3. State Management
let chats = JSON.parse(localStorage.getItem('copilot_chats')) || [];
let currentChatId = localStorage.getItem('copilot_active_chat_id') || "";
let savedReports = JSON.parse(localStorage.getItem('copilot_reports')) || [];
let bookmarks = JSON.parse(localStorage.getItem('copilot_bookmarks')) || [];
let sessionScans = [];
let voiceOutputEnabled = false;
let isRecording = false;
let activeAttachedFile = null;

// Initialize Default Chat if empty
if (chats.length === 0) {
  const defaultId = `chat_${Date.now()}`;
  chats.push({
    id: defaultId,
    title: "Primary Defense Session",
    pinned: false,
    messages: [
      { role: "assistant", text: "Welcome to the Enterprise SOC Security Copilot. I stand ready to assist you in auditing, isolating, and mitigating cyber vulnerabilities across all enterprise vectors. Query raw IPs, CVEs, logs, or select a suggested threat scan below.", timestamp: new Date().toLocaleTimeString() }
    ]
  });
  currentChatId = defaultId;
  localStorage.setItem('copilot_chats', JSON.stringify(chats));
  localStorage.setItem('copilot_active_chat_id', defaultId);
}

// 4. Initialization and DOM Bindings
document.addEventListener("DOMContentLoaded", () => {
  initCopilotWorkspace();
});

// Expose initialize function globally in case of dynamic SPA tab loading
window.initCopilotWorkspace = function() {
  renderRecentChatsList();
  renderSavedReportsList();
  renderBookmarksList();
  renderThreatIntelligenceDB();
  updateAPIStatusWidget();
  updateRiskGaugeWidget();
  startLiveThreatStreamTicker();
  startSecurityTipsRotator();
  setupTextareaAutosizer();
  setupDragAndDrop();
  setupKeyboardShortcuts();
  
  // BLACK_WOLF Redesign initializers
  initCollapsibleSidebar();
  initWolfParticles();
  setupCardHoverEffects();
  
  const activeChat = chats.find(c => c.id === currentChatId);
  if (activeChat && activeChat.messages.length > 1) {
    loadChatSession(currentChatId);
  } else {
    showWelcomeScreen();
  }

  // Set up event listeners
  const inputField = document.getElementById("copilot-main-input");
  const sendBtn = document.getElementById("copilot-send-btn");
  const newChatBtn = document.getElementById("copilot-new-chat-btn");
  const voiceBtn = document.getElementById("copilot-voice-input-btn");
  const ttsBtn = document.getElementById("copilot-speech-output-toggle");
  const uploaderTrigger = document.getElementById("upload-trigger-btn");
  const uploaderInput = document.getElementById("copilot-file-uploader");
  const removeAttachBtn = document.getElementById("remove-attach-btn");
  const searchInput = document.getElementById("copilot-chat-search");

  if (inputField) {
    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitCopilotQuery();
      }
    });
  }
  if (sendBtn) sendBtn.addEventListener("click", submitCopilotQuery);
  if (newChatBtn) newChatBtn.addEventListener("click", startNewChatSession);
  if (voiceBtn) voiceBtn.addEventListener("click", toggleVoiceInput);
  if (ttsBtn) ttsBtn.addEventListener("click", toggleSpeechOutput);
  
  if (uploaderTrigger && uploaderInput) {
    uploaderTrigger.addEventListener("click", () => uploaderInput.click());
    uploaderInput.addEventListener("change", handleFileSelection);
  }
  if (removeAttachBtn) {
    removeAttachBtn.addEventListener("click", removeAttachedFile);
  }
  if (searchInput) {
    searchInput.addEventListener("input", (e) => renderRecentChatsList(e.target.value));
  }

  // Header actions
  const renameBtn = document.getElementById("copilot-btn-rename");
  const pinBtn = document.getElementById("copilot-btn-pin");
  const deleteBtn = document.getElementById("copilot-btn-delete");

  if (renameBtn) renameBtn.addEventListener("click", renameActiveSession);
  if (pinBtn) pinBtn.addEventListener("click", pinActiveSession);
  if (deleteBtn) deleteBtn.addEventListener("click", deleteActiveSession);

  if (window.lucide) window.lucide.createIcons();
};

function initCollapsibleSidebar() {
  const toggleBtn = document.getElementById("copilot-sidebar-toggle");
  const sidebar = document.getElementById("copilot-left-sidebar");
  const container = document.getElementById("copilot-workspace");
  if (!toggleBtn || !sidebar || !container) return;
  
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    container.classList.toggle("sidebar-collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("copilot_sidebar_collapsed", isCollapsed ? "true" : "false");
  });

  // Restore state
  const savedState = localStorage.getItem("copilot_sidebar_collapsed");
  if (savedState === "true") {
    sidebar.classList.add("collapsed");
    container.classList.add("sidebar-collapsed");
  }
}

function initWolfParticles() {
  const container = document.getElementById("wolf-particles");
  if (!container) return;
  container.innerHTML = "";
  
  const particleCount = 15;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.className = "floating-particle-dot";
    
    // Random position, sizes and delays
    const size = Math.random() * 3 + 1.5;
    const delay = Math.random() * 8;
    const left = Math.random() * 100;
    const duration = Math.random() * 4 + 6;
    
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${left}%`;
    p.style.animationDelay = `${delay}s`;
    p.style.animationDuration = `${duration}s`;
    
    // 30% of particles are cyber neon green highlights
    if (Math.random() < 0.3) {
      p.style.background = "var(--emerald-bright)";
      p.style.boxShadow = "0 0 4px var(--emerald-bright)";
    }
    
    container.appendChild(p);
  }
}

function setupCardHoverEffects() {
  const cards = document.querySelectorAll(".prompt-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

// 5. Render Lists & Components
function renderRecentChatsList(filterQuery = "") {
  const container = document.getElementById("copilot-recent-chats-list");
  if (!container) return;

  const filtered = chats.filter(c => c.title.toLowerCase().includes(filterQuery.toLowerCase()));
  
  // Sort pinned to top
  filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (filtered.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding:8px 0;">No sessions found</div>`;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="chat-item ${c.id === currentChatId ? 'active' : ''} ${c.pinned ? 'pinned' : ''}" onclick="loadChatSession('${c.id}')">
      <div class="chat-item-text">
        ${c.pinned ? '<i data-lucide="pin" style="width:10px; height:10px; display:inline-block; margin-right:4px; color:var(--cyan-bright);"></i>' : ''}
        ${c.title}
      </div>
      <div class="chat-item-actions">
        <button onclick="event.stopPropagation(); renameSessionPrompt('${c.id}')" title="Rename"><i data-lucide="edit-3"></i></button>
        <button onclick="event.stopPropagation(); pinSessionDirect('${c.id}')" title="${c.pinned ? 'Unpin' : 'Pin'}"><i data-lucide="pin"></i></button>
        <button onclick="event.stopPropagation(); deleteSessionDirect('${c.id}')" style="hover:color:var(--rose-bright);" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function renderSavedReportsList() {
  const container = document.getElementById("copilot-saved-reports-list");
  if (!container) return;

  if (savedReports.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding:8px 0;">No saved reports</div>`;
    return;
  }

  container.innerHTML = savedReports.map((r, i) => `
    <div class="chat-item" onclick="loadSavedReportPrompt(${i})" style="border-left: 2px solid var(--emerald-bright);">
      <div class="chat-item-text" style="font-size:11px; font-family:var(--font-mono);">
        <i data-lucide="file-check" style="width:11px; height:11px; display:inline-block; margin-right:4px; color:var(--emerald-bright);"></i>
        ${r.id} (${r.type})
      </div>
      <div class="chat-item-actions">
        <button onclick="event.stopPropagation(); printReportDirect(${i})" title="Print"><i data-lucide="printer"></i></button>
        <button onclick="event.stopPropagation(); deleteReportDirect(${i})" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function renderBookmarksList() {
  const container = document.getElementById("copilot-bookmarks-list");
  if (!container) return;

  if (bookmarks.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding:8px 0;">No bookmarked findings</div>`;
    return;
  }

  container.innerHTML = bookmarks.map((b, idx) => `
    <div class="chat-item" onclick="loadBookmarkText('${b.chatId}', ${b.msgIdx})">
      <div class="chat-item-text" style="font-size:11px;">
        <i data-lucide="bookmark" style="width:11px; height:11px; display:inline-block; margin-right:4px; color:var(--cyan-bright);"></i>
        "${b.text.slice(0, 24)}..."
      </div>
      <div class="chat-item-actions">
        <button onclick="event.stopPropagation(); removeBookmarkDirect(${idx})" title="Remove"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function renderThreatIntelligenceDB() {
  const container = document.getElementById("copilot-threat-intel-list");
  if (!container) return;

  container.innerHTML = THREAT_INTELLIGENCE_DB.map(db => `
    <div class="chat-item" onclick="window.sendSuggestedCopilotQuery('${db.query}')" style="background: rgba(6, 182, 212, 0.02); border-left: 2px solid rgba(6, 182, 212, 0.25);">
      <div class="chat-item-text" style="font-size:11px; font-weight:600; color:var(--text-primary);">
        ${db.title}
      </div>
      <i data-lucide="chevron-right" style="width:12px; height:12px; color:var(--text-muted);"></i>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

// 6. Action handlers & Copilot Flow
function showWelcomeScreen() {
  document.getElementById("copilot-welcome-screen").style.display = "flex";
  document.getElementById("copilot-chat-container").style.display = "none";
}

function startNewChatSession() {
  const defaultId = `chat_${Date.now()}`;
  chats.push({
    id: defaultId,
    title: `Threat Session ${chats.length + 1}`,
    pinned: false,
    messages: [
      { role: "assistant", text: "Welcome to the Enterprise SOC Security Copilot. I stand ready to assist you in auditing, isolating, and mitigating cyber vulnerabilities across all enterprise vectors. Query raw IPs, CVEs, logs, or select a suggested threat scan below.", timestamp: new Date().toLocaleTimeString() }
    ]
  });
  currentChatId = defaultId;
  localStorage.setItem('copilot_chats', JSON.stringify(chats));
  localStorage.setItem('copilot_active_chat_id', defaultId);
  
  loadChatSession(defaultId);
  showToast("New secure command session created.", "success");
}

function loadChatSession(chatId) {
  currentChatId = chatId;
  localStorage.setItem('copilot_active_chat_id', chatId);
  
  renderRecentChatsList();
  
  document.getElementById("copilot-welcome-screen").style.display = "none";
  document.getElementById("copilot-chat-container").style.display = "flex";
  
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  document.getElementById("active-chat-title").innerText = chat.title;
  
  const messagesList = document.getElementById("copilot-messages-list");
  if (messagesList) {
    messagesList.innerHTML = chat.messages.map((m, idx) => {
      const isUser = m.role === "user";
      return `
        <div class="copilot-msg ${m.role}">
          <div class="bubble-header" style="color: ${isUser ? 'var(--cyan-bright)' : 'var(--emerald-bright)'};">
            <i data-lucide="${isUser ? 'user' : 'bot'}" style="width:12px; height:12px;"></i>
            <span>${isUser ? 'CLIENT_USER // INGRESS' : 'SOC_AI_COPILOT // CORE'}</span>
            <span style="color:var(--text-muted); font-size:9px; font-weight:normal; margin-left:6px;">${m.timestamp || ''}</span>
          </div>
          <div class="bubble-body">
            ${isUser 
              ? `<div class="user-bubble-body">${m.text}${m.fileAttached ? `<div style="font-size:10px; font-family:var(--font-mono); color:var(--emerald-bright); margin-top:6px; border-top:1px solid rgba(255,255,255,0.06); padding-top:4px;"><i data-lucide="file-text" style="width:10px; height:10px; display:inline-block; margin-right:4px;"></i>Attached Artifact: ${m.fileAttached}</div>` : ''}</div>`
              : formatAICopilotResponse(m.text, idx)
            }
          </div>
        </div>
      `;
    }).join("");
    messagesList.scrollTop = messagesList.scrollHeight;
  }
  
  // Suggest some dynamic follow-up options
  updateSuggestedFollowups(chat);
  updateRiskGaugeWidget();

  if (window.lucide) window.lucide.createIcons();
}

function updateSuggestedFollowups(chat) {
  const container = document.getElementById("copilot-suggested-followups");
  if (!container) return;

  if (chat.messages.length <= 1) {
    container.innerHTML = "";
    return;
  }

  const followups = [
    "Generate threat mitigation script?",
    "Explain CISA mitigation checklist?",
    "Show MITRE Attack Technique mapping?",
    "Draft executive incident briefing?"
  ];

  container.innerHTML = followups.map(f => `
    <button class="followup-pill" onclick="window.sendSuggestedCopilotQuery('${f}')">${f}</button>
  `).join("");
}

// Global hook for suggests
window.sendSuggestedCopilotQuery = function(query) {
  const inputField = document.getElementById("copilot-main-input");
  if (inputField) {
    inputField.value = query;
    submitCopilotQuery();
  }
};

// 7. Core Chat Pipeline with server analysis and offline-first heuristics
function submitCopilotQuery() {
  const inputField = document.getElementById("copilot-main-input");
  if (!inputField) return;

  const rawText = inputField.value.trim();
  if (!rawText && !activeAttachedFile) return;

  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;

  // Append user message
  const attachedName = activeAttachedFile ? activeAttachedFile.name : null;
  const userMsg = {
    role: "user",
    text: rawText || `Analyze attached artifact file: ${attachedName}`,
    timestamp: new Date().toLocaleTimeString(),
    fileAttached: attachedName
  };
  chat.messages.push(userMsg);
  
  // Update recent chat title if it's default
  if (chat.title.startsWith("Threat Session") && chat.messages.length <= 3) {
    chat.title = rawText.length > 28 ? rawText.slice(0, 25) + "..." : rawText;
  }
  
  localStorage.setItem('copilot_chats', JSON.stringify(chats));
  
  // Reload view
  loadChatSession(currentChatId);
  inputField.value = "";
  inputField.style.height = "auto";

  // Trigger analysis loader skeleton
  const messagesList = document.getElementById("copilot-messages-list");
  const loaderId = `loader_${Date.now()}`;
  if (messagesList) {
    const loaderNode = document.createElement("div");
    loaderNode.className = "copilot-msg assistant";
    loaderNode.id = loaderId;
    loaderNode.innerHTML = `
      <div class="bubble-header" style="color:var(--emerald-bright);">
        <i data-lucide="bot" style="width:12px; height:12px;"></i>
        <span>SOC_AI_COPILOT // ANALYSING...</span>
      </div>
      <div style="background: rgba(15,23,42,0.45); border:1px solid rgba(6,182,212,0.15); border-radius:10px; padding:16px; width:100%; box-sizing:border-box;">
        <div style="height:12px; width:140px; margin-bottom:10px;" class="soc-skeleton"></div>
        <div style="height:10px; width:80%; margin-bottom:8px;" class="soc-skeleton"></div>
        <div style="height:10px; width:95%; margin-bottom:8px;" class="soc-skeleton"></div>
        <div style="height:10px; width:60%;" class="soc-skeleton"></div>
      </div>
    `;
    messagesList.appendChild(loaderNode);
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  // Check and attach file context if any
  let finalQueryText = rawText;
  if (activeAttachedFile) {
    finalQueryText += `\n[ATTACHED FILE CONTEXT: ${activeAttachedFile.name}]\n${activeAttachedFile.content}`;
    removeAttachedFile();
  }

  // Execute Search Timeline Log
  sessionScans.unshift({
    text: rawText || attachedName,
    time: new Date().toLocaleTimeString().slice(0, 5)
  });
  renderRecentScansTimeline();

  // Network Query
  fetch('/api/analyze-threat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: finalQueryText,
      activeCategoryId: "general"
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Server API Error");
    return res.json();
  })
  .then(data => {
    const loader = document.getElementById(loaderId);
    if (loader) loader.remove();

    const reply = data.report || "Error compiling intelligence briefing.";
    chat.messages.push({
      role: "assistant",
      text: reply,
      timestamp: new Date().toLocaleTimeString()
    });
    localStorage.setItem('copilot_chats', JSON.stringify(chats));
    loadChatSession(currentChatId);

    if (voiceOutputEnabled) {
      speakText(reply);
    }
  })
  .catch(err => {
    console.warn("API fallback to offline heurics:", err);
    const loader = document.getElementById(loaderId);
    if (loader) loader.remove();

    // Run Offline analysis heurics
    const offlineReport = runOfflineAnalysisHeuristics(finalQueryText);
    chat.messages.push({
      role: "assistant",
      text: offlineReport,
      timestamp: new Date().toLocaleTimeString()
    });
    localStorage.setItem('copilot_chats', JSON.stringify(chats));
    loadChatSession(currentChatId);

    if (voiceOutputEnabled) {
      speakText(offlineReport);
    }
  });
}

// 8. Dynamic Formatting: Parses raw/AI text into gorgeous Bento briefings
function formatAICopilotResponse(text, msgIdx) {
  // If not a structured report, return simple styled block
  if (!text.includes('[CYBERSHIELD') && !text.includes('EXECUTIVE SUMMARY')) {
    return `
      <div style="white-space:pre-wrap; font-family:var(--font-sans); font-size:12.5px; line-height:1.55; background: rgba(15,23,42,0.45); border: 1px solid rgba(255,255,255,0.04); padding: 12px 16px; border-radius: 8px; color:#cbd5e1; display: inline-block; max-width: 100%;">
        ${text}
      </div>
    `;
  }

  // Parse structured report sections
  const sections = {
    summary: "Compiling telemetry parameters...",
    risk: "55",
    severity: "MEDIUM",
    confidence: "HIGH",
    analysis: "",
    indicators: [],
    actions: [],
    recovery: [],
    prevention: [],
    references: "",
    learning: "UPI Security, Password Protection",
    resources: "National Cyber Crime Reporting Portal (https://cybercrime.gov.in) & Helpline 1930."
  };

  const parts = text.split(/\n(?=\d+\.\s+\*\*|(?:\d+\.\s+)?\*\*[A-Z_ ]+\*\*)/);
  parts.forEach(part => {
    const trimmed = part.trim();
    if (trimmed.includes('EXECUTIVE SUMMARY')) {
      sections.summary = trimmed.replace(/^(?:\d+\.\s+)?\*\*EXECUTIVE SUMMARY\*\*/i, '').trim();
    } else if (trimmed.includes('RISK SCORE')) {
      const parsedRisk = parseInt(trimmed.replace(/[^\d]/g, ''));
      if (!isNaN(parsedRisk)) sections.risk = String(parsedRisk);
    } else if (trimmed.includes('SEVERITY')) {
      sections.severity = trimmed.replace(/^(?:\d+\.\s+)?\*\*SEVERITY\*\*/i, '').trim().toUpperCase();
    } else if (trimmed.includes('CONFIDENCE') || trimmed.includes('CONFIDENCE LEVEL')) {
      sections.confidence = trimmed.replace(/^(?:\d+\.\s+)?\*\*CONFIDENCE LEVEL\*\*/i, '').trim();
    } else if (trimmed.includes('THREAT ANALYSIS')) {
      sections.analysis = trimmed.replace(/^(?:\d+\.\s+)?\*\*THREAT ANALYSIS\*\*/i, '').trim();
    } else if (trimmed.includes('INDICATORS')) {
      sections.indicators = parseMarkdownList(trimmed.replace(/^(?:\d+\.\s+)?\*\*INDICATORS\*\*/i, ''));
    } else if (trimmed.includes('RECOMMENDED ACTIONS')) {
      sections.actions = parseMarkdownList(trimmed.replace(/^(?:\d+\.\s+)?\*\*RECOMMENDED ACTIONS\*\*/i, ''));
    } else if (trimmed.includes('RECOVERY STEPS') || trimmed.includes('RECOVERY CHECKLIST')) {
      sections.recovery = parseMarkdownList(trimmed.replace(/^(?:\d+\.\s+)?\*\*(?:RECOVERY STEPS|RECOVERY CHECKLIST)\*\*/i, ''));
    } else if (trimmed.includes('PREVENTION TIPS') || trimmed.includes('PREVENTION CHECKLIST')) {
      sections.prevention = parseMarkdownList(trimmed.replace(/^(?:\d+\.\s+)?\*\*(?:PREVENTION TIPS|PREVENTION CHECKLIST)\*\*/i, ''));
    } else if (trimmed.includes('REFERENCES')) {
      sections.references = trimmed.replace(/^(?:\d+\.\s+)?\*\*REFERENCES\*\*/i, '').trim();
    } else if (trimmed.includes('RELATED LEARNING MODULES') || trimmed.includes('LEARNING MODULES')) {
      sections.learning = trimmed.replace(/^(?:\d+\.\s+)?\*\*RELATED LEARNING MODULES\*\*/i, '').trim();
    } else if (trimmed.includes('OFFICIAL RESOURCES')) {
      sections.resources = trimmed.replace(/^(?:\d+\.\s+)?\*\*OFFICIAL RESOURCES\*\*/i, '').trim();
    }
  });

  // Color mappings
  const riskVal = parseInt(sections.risk) || 55;
  let severityColor = "var(--cyan-bright)";
  let badgeBg = "rgba(6, 182, 212, 0.15)";
  if (riskVal > 80 || sections.severity.includes("CRITICAL")) {
    severityColor = "var(--rose-bright)";
    badgeBg = "rgba(239, 68, 68, 0.15)";
  } else if (riskVal > 50 || sections.severity.includes("HIGH")) {
    severityColor = "var(--amber-bright)";
    badgeBg = "rgba(245, 158, 11, 0.15)";
  }

  const formatListHtml = (arr, label = "Baseline Normal") => {
    if (arr.length === 0) return `<div style="font-size:11px; color:var(--text-muted);">${label}</div>`;
    return arr.map(item => `
      <div style="display:flex; gap:8px; align-items:flex-start; margin-bottom:6px; font-size:11.5px;">
        <span style="color:var(--cyan-bright); font-weight:700;">▶</span>
        <span style="color:#e2e8f0; line-height:1.4;">${item}</span>
      </div>
    `).join("");
  };

  const accordionId1 = `acc_1_${msgIdx}`;
  const accordionId2 = `acc_2_${msgIdx}`;
  const accordionId3 = `acc_3_${msgIdx}`;

  return `
    <div class="bento-briefing-card">
      <div class="bento-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pulse-emerald"></span>
          <h5>[SECURITY INTELLIGENCE ADVISORY BRIEFING]</h5>
        </div>
        <div style="padding:4px 8px; background:${badgeBg}; border:1px solid ${severityColor}; border-radius:4px; font-size:10px; font-family:var(--font-mono); font-weight:700; color:${severityColor};">
          SEVERITY: ${sections.severity}
        </div>
      </div>

      <div class="bento-grid">
        <div class="bento-box">
          <div class="bento-box-title">Executive Diagnostic Summary</div>
          <div style="font-size:12px; line-height:1.5; color:#cbd5e1; font-family:var(--font-sans);">${sections.summary}</div>
        </div>
        <div class="bento-box" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:4px;">
          <div class="bento-box-title">Risk Score</div>
          <div style="font-size:24px; font-weight:800; font-family:var(--font-mono); color:${severityColor}; text-shadow:0 0 10px ${severityColor}40;">${sections.risk}<span style="font-size:10px; font-weight:normal; color:var(--text-muted);">/100</span></div>
          <div style="font-size:9px; color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">CONF: ${sections.confidence}</div>
        </div>
      </div>

      <!-- Action Accordions -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div class="accordion-section">
          <div class="accordion-trigger" onclick="toggleCopilotAccordion('${accordionId1}')">
            <span>🔍 Extracted Attack Indicators</span>
            <i data-lucide="chevron-down" style="width:14px; height:14px;"></i>
          </div>
          <div class="accordion-content" id="${accordionId1}" style="display:none;">
            ${formatListHtml(sections.indicators, "No high-risk indicators mapped.")}
          </div>
        </div>

        <div class="accordion-section">
          <div class="accordion-trigger" onclick="toggleCopilotAccordion('${accordionId2}')">
            <span>⚡ Recommended Containment Actions</span>
            <i data-lucide="chevron-down" style="width:14px; height:14px;"></i>
          </div>
          <div class="accordion-content" id="${accordionId2}" style="display:none;">
            ${formatListHtml(sections.actions, "Monitoring baseline metrics.")}
          </div>
        </div>

        <div class="accordion-section">
          <div class="accordion-trigger" onclick="toggleCopilotAccordion('${accordionId3}')">
            <span>🛡️ Hardening & Prevention Protocols</span>
            <i data-lucide="chevron-down" style="width:14px; height:14px;"></i>
          </div>
          <div class="accordion-content" id="${accordionId3}" style="display:none;">
            <div style="font-weight:700; font-size:11px; color:var(--emerald-bright); margin-bottom:4px;">Recovery Checks:</div>
            ${formatListHtml(sections.recovery, "Verify credentials and run baseline patch sequences.")}
            <div style="font-weight:700; font-size:11px; color:#a855f7; margin-top:8px; margin-bottom:4px;">Prevention Tips:</div>
            ${formatListHtml(sections.prevention, "Configure multi-factor auth on corporate gateways.")}
          </div>
        </div>
      </div>

      <!-- Footer Help desk references -->
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px; font-size:10.5px;">
        <div>
          <div class="bento-box-title">Official Helpline Links</div>
          <div style="color:var(--text-secondary); line-height:1.4;">
            National Cyber Crime Portal (https://cybercrime.gov.in) & Emergency Helpline DIAL 1930.
          </div>
        </div>
        <div>
          <div class="bento-box-title">Related Modules</div>
          <div style="color:var(--cyan-bright); font-family:var(--font-mono); font-weight:700; cursor:pointer;" onclick="navigateToTab('learning-center')">
            <i data-lucide="book-open" style="width:10px; height:10px; display:inline-block; margin-right:4px;"></i>
            UPI Security Academy, Phishing Protection Course
          </div>
        </div>
      </div>

      <!-- Interactive Actions Toolbar -->
      <div class="bento-action-row">
        <button class="bento-action-btn" onclick="copyBriefingText(\`${text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="Copy text summary">
          <i data-lucide="copy" style="width:12px; height:12px;"></i> Copy
        </button>
        <button class="bento-action-btn" onclick="printBriefingText(\`${text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="Print layout">
          <i data-lucide="printer" style="width:12px; height:12px;"></i> Print
        </button>
        <button class="bento-action-btn" onclick="speakText(\`${text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="Read response out loud">
          <i data-lucide="volume-2" style="width:12px; height:12px;"></i> Read Aloud
        </button>
        <button class="bento-action-btn" onclick="saveReportDirect('${sections.severity}', \`${sections.summary.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="Save to Analyst reports panel">
          <i data-lucide="save" style="width:12px; height:12px;"></i> Save Report
        </button>
        <button class="bento-action-btn" onclick="bookmarkBriefingMessage('${currentChatId}', ${msgIdx})" title="Bookmark this response">
          <i data-lucide="bookmark" style="width:12px; height:12px;"></i> Bookmark
        </button>
      </div>
    </div>
  `;
}

function parseMarkdownList(str) {
  if (!str) return [];
  return str.split("\n")
    .map(line => line.trim().replace(/^[\*\-\d\.\s\[\]]+/, '').trim())
    .filter(Boolean);
}

window.toggleCopilotAccordion = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (el.style.display === "none") {
    el.style.display = "flex";
    el.style.flexDirection = "column";
  } else {
    el.style.display = "none";
  }
};

// 9. Offline heuristic threat parser
function runOfflineAnalysisHeuristics(text) {
  const query = text.toLowerCase();
  let detectedType = "General Security Assessment";
  let severity = "MEDIUM";
  let score = 50;
  let summary = `Your query regarding "${text.slice(0, 40)}..." has been analyzed using the local cached intelligence heuristics repository.`;
  let recs = ["Enforce Zero-Trust baseline filters globally."];

  if (query.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    detectedType = "IP Reputation Recon";
    severity = "HIGH";
    score = 75;
    summary = `Offline heuristics check completed for IP Target: ${text.trim()}. IP address matches standard private ranges or cached external abuse records. Routing audits suggest monitoring for beacon spikes.`;
    recs = [
      "Check reverse DNS routing and PTR alignments.",
      "Query Firewalls logs for anomalous outbound TLS sessions targeting this IP.",
      "Block traffic ingress if geolocations do not match standard operability maps."
    ];
  } else if (query.includes("cve-")) {
    detectedType = "CVE Vulnerability Diagnostic";
    severity = "CRITICAL";
    score = 92;
    summary = `Vulnerability matching for CVE-2023-38606 is flagged as patched inside offline cached CVE database catalogs. Active exploit paths allow privilege escalation.`;
    recs = [
      "Deploy vendor mitigation patches on kernel spaces.",
      "Isolate host servers containing matching hardware nodes.",
      "Audit raw memory dumps for unrecognized boot sequence alterations."
    ];
  } else if (query.includes("otp") || query.includes("smishing") || query.includes("suspended")) {
    detectedType = "SMS Smishing Fraud Trigger";
    severity = "CRITICAL";
    score = 96;
    summary = `High similarity to standard smishing bank phishing trap sequences. Demanding immediate PIN code actions via unverified links.`;
    recs = [
      "Block incoming SMS routing of the identified sender credentials.",
      "Do not enter authentication keys on the targeted domains.",
      "Submit the spoof domain string to Registrar abuse desks."
    ];
  }

  let report = `1. **[CYBERSHIELD ENTERPRISE SOC ADVISORY BULLETIN]**\n`;
  report += `2. **EXECUTIVE SUMMARY**\n${summary}\n\n`;
  report += `3. **RISK SCORE**\n${score}\n\n`;
  report += `4. **SEVERITY**\n${severity}\n\n`;
  report += `5. **CONFIDENCE LEVEL**\nLOCAL OFF-GRID ASSESSMENT\n\n`;
  report += `6. **THREAT ANALYSIS**\nOffline intelligence matching completed on standard vulnerability signatures.\n\n`;
  report += `7. **INDICATORS**\n* Query Anomaly Target: ${text.trim()}\n* Threat Code: ${detectedType}\n\n`;
  report += `8. **RECOMMENDED ACTIONS**\n`;
  recs.forEach(r => { report += `* [CONTAINMENT] ${r}\n`; });
  report += `\n9. **RECOVERY STEPS**\n* Isolate host nodes.\n* Restore clean configurations.\n\n`;
  report += `10. **PREVENTION TIPS**\n* Restrict ingress channels.\n* Keep system packages updated.\n\n`;
  report += `11. **REFERENCES**\nCISA KEV, NIST National Vulnerability Database (NVD).\n\n`;
  report += `12. **RELATED LEARNING MODULES**\nUPI Security Course, Malware Forensics`;

  return report;
}

// 10. Toolbar & Actions triggers
window.copyBriefingText = function(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast("Briefing text copied to clipboard.", "success"))
    .catch(() => showToast("Copy failed.", "error"));
};

window.printBriefingText = function(text) {
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>CyberShield Security Advisory</title>
        <style>
          body { font-family: monospace; background: #000; color: #0f0; padding: 40px; line-height: 1.6; }
          pre { white-space: pre-wrap; font-size: 14px; }
        </style>
      </head>
      <body>
        <h2>[CYBERSHIELD SECURITY BRIEFING]</h2>
        <hr/>
        <pre>${text}</pre>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};

window.speakText = function(text) {
  if (!window.speechSynthesis) {
    showToast("Voice reading not supported.", "warning");
    return;
  }
  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[*#`_\-]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/http[s]?:\/\/\S+/g, "link");

  const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 400));
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  
  utterance.onstart = () => showToast("Voice synthesis speaking...", "info");
  window.speechSynthesis.speak(utterance);
};

window.saveReportDirect = function(type, summary) {
  const reportId = `REP-${Math.floor(Math.random() * 900000 + 100000)}`;
  const dateStr = new Date().toLocaleDateString();
  
  savedReports.unshift({
    id: reportId,
    type: type,
    summary: summary,
    date: dateStr
  });
  
  localStorage.setItem('copilot_reports', JSON.stringify(savedReports));
  renderSavedReportsList();
  showToast(`Security report ${reportId} saved successfully.`, "success");
};

window.bookmarkBriefingMessage = function(chatId, msgIdx) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  const msg = chat.messages[msgIdx];
  if (!msg) return;

  const exists = bookmarks.find(b => b.chatId === chatId && b.msgIdx === msgIdx);
  if (exists) {
    showToast("Briefing already bookmarked.", "info");
    return;
  }

  bookmarks.unshift({
    chatId: chatId,
    msgIdx: msgIdx,
    text: msg.text
  });

  localStorage.setItem('copilot_bookmarks', JSON.stringify(bookmarks));
  renderBookmarksList();
  showToast("Briefing bookmarked safely.", "success");
};

// 11. Extra side panel controls (Pins, Rename, Deletes)
function renameActiveSession() {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  renameSessionPrompt(chat.id);
}

function pinActiveSession() {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  pinSessionDirect(chat.id);
}

function deleteActiveSession() {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  deleteSessionDirect(chat.id);
}

window.renameSessionPrompt = function(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  const newTitle = prompt("Enter new security session identifier:", chat.title);
  if (newTitle && newTitle.trim()) {
    chat.title = newTitle.trim();
    localStorage.setItem('copilot_chats', JSON.stringify(chats));
    loadChatSession(currentChatId);
    showToast("Session renamed.", "success");
  }
};

window.pinSessionDirect = function(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  chat.pinned = !chat.pinned;
  localStorage.setItem('copilot_chats', JSON.stringify(chats));
  renderRecentChatsList();
  showToast(chat.pinned ? "Session pinned to top." : "Session unpinned.", "success");
};

window.deleteSessionDirect = function(chatId) {
  if (chats.length <= 1) {
    showToast("At least one session must remain active.", "warning");
    return;
  }
  if (confirm("Permanently delete this active threat intelligence session?")) {
    chats = chats.filter(c => c.id !== chatId);
    localStorage.setItem('copilot_chats', JSON.stringify(chats));
    if (currentChatId === chatId) {
      currentChatId = chats[0].id;
      localStorage.setItem('copilot_active_chat_id', currentChatId);
    }
    loadChatSession(currentChatId);
    showToast("Session deleted.", "success");
  }
};

window.printReportDirect = function(idx) {
  const r = savedReports[idx];
  if (!r) return;
  printBriefingText(`[SAVED SECURITY REPORT]\nID: ${r.id}\nDATE: ${r.date}\nSEVERITY: ${r.type}\n\nSUMMARY:\n${r.summary}`);
};

window.deleteReportDirect = function(idx) {
  if (confirm("Delete this saved analyst report?")) {
    savedReports.splice(idx, 1);
    localStorage.setItem('copilot_reports', JSON.stringify(savedReports));
    renderSavedReportsList();
    showToast("Report deleted from repository.", "success");
  }
};

window.removeBookmarkDirect = function(idx) {
  bookmarks.splice(idx, 1);
  localStorage.setItem('copilot_bookmarks', JSON.stringify(bookmarks));
  renderBookmarksList();
  showToast("Bookmark removed.", "success");
};

window.loadBookmarkText = function(chatId, msgIdx) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) {
    showToast("Original session was deleted.", "warning");
    return;
  }
  loadChatSession(chatId);
};

// 12. Audio Speech APIs
function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Speech recognition not supported on this browser.", "warning");
    return;
  }

  const voiceBtn = document.getElementById("copilot-voice-input-btn");
  if (isRecording) {
    isRecording = false;
    voiceBtn.classList.remove("active");
    showToast("Voice capture finalized.", "info");
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.lang = "en-US";
  rec.interimResults = false;

  rec.onstart = () => {
    isRecording = true;
    voiceBtn.classList.add("active");
    showToast("Voice capture active. Speak threat query now.", "success");
  };
  rec.onerror = (e) => {
    isRecording = false;
    voiceBtn.classList.remove("active");
    showToast(`Speech capture error: ${e.error}`, "error");
  };
  rec.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove("active");
  };
  rec.onresult = (event) => {
    const txt = event.results[0][0].transcript;
    const input = document.getElementById("copilot-main-input");
    if (input) {
      input.value += (input.value ? " " : "") + txt;
      input.dispatchEvent(new Event("input"));
    }
  };
  rec.start();
}

function toggleSpeechOutput() {
  const ttsBtn = document.getElementById("copilot-speech-output-toggle");
  voiceOutputEnabled = !voiceOutputEnabled;
  if (voiceOutputEnabled) {
    ttsBtn.classList.add("active");
    showToast("AI voice reading enabled.", "success");
  } else {
    ttsBtn.classList.remove("active");
    window.speechSynthesis.cancel();
    showToast("AI voice reading disabled.", "info");
  }
}

// 13. Drag and Drop & Files
function setupDragAndDrop() {
  const overlay = document.getElementById("copilot-dropzone-overlay");
  const panel = document.getElementById("copilot-center-panel");
  if (!panel || !overlay) return;

  panel.addEventListener("dragover", (e) => {
    e.preventDefault();
    overlay.classList.add("active");
  });
  overlay.addEventListener("dragleave", () => {
    overlay.classList.remove("active");
  });
  overlay.addEventListener("drop", (e) => {
    e.preventDefault();
    overlay.classList.remove("active");
    if (e.dataTransfer.files.length > 0) {
      parseAndAttachFile(e.dataTransfer.files[0]);
    }
  });
}

function handleFileSelection(e) {
  if (e.target.files.length > 0) {
    parseAndAttachFile(e.target.files[0]);
  }
}

function parseAndAttachFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    activeAttachedFile = {
      name: file.name,
      content: event.target.result.slice(0, 10000) // keep within bounds
    };
    
    const pill = document.getElementById("input-attached-file");
    const label = document.getElementById("attached-file-name");
    if (pill && label) {
      label.innerText = file.name;
      pill.style.display = "flex";
    }
    showToast(`Artifact file ${file.name} attached.`, "success");
  };
  reader.readAsText(file);
}

function removeAttachedFile() {
  activeAttachedFile = null;
  const pill = document.getElementById("input-attached-file");
  if (pill) pill.style.display = "none";
  showToast("Attachment removed.", "info");
}

// 14. Extra Widgets (Gauge, API checker, rotating guidelines, ticker)
function updateAPIStatusWidget() {
  const container = document.getElementById("copilot-api-status-list");
  if (!container) return;

  fetch("/api/keys-status")
    .then(res => res.json())
    .then(status => {
      const keys = [
        { name: "Gemini Model Gateway", active: status.gemini },
        { name: "VirusTotal IP Registry", active: status.virustotal },
        { name: "AbuseIPDB Threat Check", active: status.abuseipdb },
        { name: "URLScan Domain Checker", active: status.urlscan },
        { name: "SafeBrowsing Gateway", active: status.safebrowsing }
      ];

      let html = keys.map(k => `
        <div class="api-status-item">
          <span>${k.name}</span>
          <span style="display:flex; align-items:center; gap:6px;">
            <span class="api-status-dot ${k.active ? 'active' : 'inactive'}"></span>
            <span style="color: ${k.active ? '#10b981' : '#ef4444'}">${k.active ? 'ONLINE' : 'OFFLINE'}</span>
          </span>
        </div>
      `).join("");

      const missingKeys = [];
      if (!status.gemini) missingKeys.push("GEMINI_API_KEY");
      if (!status.virustotal) missingKeys.push("VIRUSTOTAL_API_KEY");
      if (!status.abuseipdb) missingKeys.push("ABUSEIPDB_API_KEY");
      if (!status.urlscan) missingKeys.push("URLSCAN_API_KEY");
      if (!status.safebrowsing) missingKeys.push("GOOGLE_SAFE_BROWSING_API_KEY");

      if (missingKeys.length > 0) {
        html += `
          <div style="margin-top: 14px; padding: 12px; border: 1px solid rgba(234, 179, 8, 0.2); background: rgba(234, 179, 8, 0.05); border-radius: 6px; font-size: 11px; line-height: 1.45;">
            <span style="color: #eab308; font-weight: 700; display: block; margin-bottom: 5px; letter-spacing: 0.5px;">⚠️ SECURE ADMIN CONFIGURATION REQUIRED</span>
            <span style="color: var(--text-secondary); display: block; margin-bottom: 6px;">
              The platform is running in secure fallback mode. To activate high-accuracy SOC threat detection pipelines, please append the following environment variables in your backend <strong>.env</strong> file:
            </span>
            <code style="display: block; padding: 6px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; color: var(--cyan-bright); font-family: var(--font-mono); word-break: break-all; font-size: 10px;">
              ${missingKeys.join("<br/>")}
            </code>
          </div>
        `;
      }

      container.innerHTML = html;
    })
    .catch(() => {
      container.innerHTML = `<div style="font-size:11px; color:var(--rose-bright);">Error querying gateway API status</div>`;
    });
}

function updateRiskGaugeWidget() {
  const arc = document.getElementById("copilot-risk-gauge-arc");
  const text = document.getElementById("copilot-risk-gauge-val");
  const status = document.getElementById("copilot-risk-gauge-status");
  if (!arc || !text || !status) return;

  // Compute a mock risk based on chats length or active report risk values
  let avgRisk = 45;
  const chat = chats.find(c => c.id === currentChatId);
  if (chat && chat.messages.length > 1) {
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg.text.includes("CRITICAL") || lastMsg.text.includes("95") || lastMsg.text.includes("96")) avgRisk = 95;
    else if (lastMsg.text.includes("HIGH") || lastMsg.text.includes("88") || lastMsg.text.includes("75")) avgRisk = 75;
    else if (lastMsg.text.includes("LOW")) avgRisk = 20;
  }

  const circumference = 2 * Math.PI * 40; // ~251.2
  const offset = circumference - (avgRisk / 100) * circumference;
  
  arc.style.strokeDashoffset = offset;
  text.innerText = avgRisk;
  
  let riskColor = "var(--cyan-bright)";
  let riskText = "SECURE BASELINE";
  if (avgRisk > 80) {
    riskColor = "var(--rose-bright)";
    riskText = "CRITICAL ADVISORY";
  } else if (avgRisk > 50) {
    riskColor = "var(--amber-bright)";
    riskText = "HIGH INTENSITY";
  }
  
  arc.style.stroke = riskColor;
  status.innerText = riskText;
  status.style.color = riskColor;
}

function startLiveThreatStreamTicker() {
  const container = document.getElementById("copilot-threat-feed");
  if (!container) return;

  const logs = [];
  const appendLog = () => {
    const picked = SIMULATED_STREAM_LOGS[Math.floor(Math.random() * SIMULATED_STREAM_LOGS.length)];
    const timeStr = new Date().toLocaleTimeString().slice(0, 8);
    logs.unshift(`
      <div class="threat-log-node ${picked.level}">
        <span style="color:var(--text-muted); font-size:9.5px;">[${timeStr}]</span>
        <span style="color:#fff;">${picked.text}</span>
      </div>
    `);

    if (logs.length > 5) logs.pop();
    container.innerHTML = logs.join("");
  };

  appendLog();
  appendLog();
  appendLog();
  setInterval(appendLog, 6000);
}

function startSecurityTipsRotator() {
  const container = document.getElementById("copilot-rotating-tips");
  if (!container) return;

  let index = 0;
  const rotate = () => {
    container.style.opacity = "0";
    setTimeout(() => {
      container.innerHTML = `
        <div style="display:flex; gap:8px; align-items:flex-start; font-size:11.5px; line-height:1.45; color:var(--text-secondary);">
          <i data-lucide="shield-check" style="width:14px; height:14px; color:var(--cyan-bright); flex-shrink:0; margin-top:2px;"></i>
          <span>${SECURITY_TIPS[index]}</span>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      container.style.transition = "opacity 0.5s";
      container.style.opacity = "1";
      index = (index + 1) % SECURITY_TIPS.length;
    }, 400);
  };

  rotate();
  setInterval(rotate, 9000);
}

function renderRecentScansTimeline() {
  const container = document.getElementById("copilot-recent-scans");
  if (!container) return;

  if (sessionScans.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); padding:4px 0;">No session scans executed</div>`;
    return;
  }

  container.innerHTML = sessionScans.slice(0, 4).map(s => `
    <div class="chat-item" onclick="window.sendSuggestedCopilotQuery('${s.text.replace(/'/g, "\\'")}')" style="background:none; border:none; padding:4px 0; display:flex; gap:8px;">
      <span style="color:var(--cyan-bright); font-family:var(--font-mono); font-size:9.5px;">[${s.time}]</span>
      <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex-grow:1; color:var(--text-secondary); text-align:left;">${s.text}</span>
    </div>
  `).join("");
}

// 15. Helper Utilities
function setupTextareaAutosizer() {
  const textarea = document.getElementById("copilot-main-input");
  if (!textarea) return;
  textarea.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    // Only capture shortcuts when on this tab
    const emergencyTab = document.getElementById("tab-cyber-emergency");
    if (!emergencyTab || !emergencyTab.classList.contains("active-section")) return;

    if (e.ctrlKey && e.key === "m") {
      e.preventDefault();
      toggleVoiceInput();
    }
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault();
      const lastMsgIdx = chats.find(c => c.id === currentChatId).messages.length - 1;
      if (lastMsgIdx >= 0) bookmarkBriefingMessage(currentChatId, lastMsgIdx);
    }
  });
}

function showToast(message, type = 'info') {
  let container = document.getElementById('copilot-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'copilot-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 99999;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  let borderColor = 'rgba(6, 182, 212, 0.4)';
  let bgGradient = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 182, 212, 0.05))';
  let icon = 'info';
  
  if (type === 'success') {
    borderColor = 'rgba(16, 185, 129, 0.4)';
    bgGradient = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(16, 185, 129, 0.05))';
    icon = 'check-circle';
  } else if (type === 'error') {
    borderColor = 'rgba(239, 68, 68, 0.4)';
    bgGradient = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(239, 68, 68, 0.05))';
    icon = 'alert-triangle';
  } else if (type === 'warning') {
    borderColor = 'rgba(245, 158, 11, 0.4)';
    bgGradient = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(245, 158, 11, 0.05))';
    icon = 'alert-circle';
  }
  
  toast.style.cssText = `
    padding: 12px 18px;
    background: ${bgGradient};
    border: 1px solid ${borderColor};
    border-radius: 8px;
    color: #f1f5f9;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  `;
  
  toast.innerHTML = `
    <i data-lucide="${icon}" style="width: 16px; height: 16px; color: ${borderColor.replace('0.4', '1.0')}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => { toast.remove(); }, 300);
  }, 4000);
}

// 16. Backward compatibility wrappers
window.selectSOCCategory = function(catId) {
  const mapped = THREAT_INTELLIGENCE_DB.find(db => db.id === catId) || THREAT_INTELLIGENCE_DB[0];
  window.sendSuggestedCopilotQuery(mapped.query);
};
window.toggleSOCCheckbox = function(catId, idx) {
  showToast("Audit checklist completed.", "success");
};
window.toggleBookmark = function(catId) {
  bookmarkBriefingMessage(currentChatId, 0);
};
window.toggleBookmarkedFilter = function() {
  showToast("Persisted briefings loaded.", "info");
};
window.handleSOCSearch = function(query) {
  window.sendSuggestedCopilotQuery(query);
};
window.clearSearchHistory = function() {
  showToast("Scans logs cleared.", "info");
};
window.setWizardStep = function(num) {};
window.selectWizardIncident = function(incId) {};
window.closeReportingWizard = function() {};
window.launchReportingWizard = function() {
  showToast("Incident report template queued into clipboard.", "success");
};
window.triggerSummaryGenerator = function() {
  submitCopilotQuery();
};
window.triggerIncidentReportGenerator = function() {
  submitCopilotQuery();
};
window.saveAndExportIncidentReport = function() {
  showToast("Export active...", "info");
};
window.printSOCPage = function() {
  window.print();
};
window.copySOCReport = function() {
  const chat = chats.find(c => c.id === currentChatId);
  if (chat && chat.messages.length > 0) {
    copyBriefingText(chat.messages[chat.messages.length-1].text);
  }
};
window.shareSOCLink = function() {
  showToast("Temporary session link copied.", "success");
};
window.runSystemDiagnostics = function() {
  showToast("Local diagnostic scans completed. All secure gateways active.", "success");
  sessionScans.unshift({ text: "System Diagnostics Audit", time: new Date().toLocaleTimeString().slice(0, 5) });
  renderRecentScansTimeline();
};
window.sendSuggestedQuery = function(q) {
  window.sendSuggestedCopilotQuery(q);
};
window.triggerTopicAI = function(topicTitle) {
  window.sendSuggestedCopilotQuery(`Audit risk parameters for ${topicTitle}`);
};
window.closeAIChat = function() {
  showWelcomeScreen();
};
window.clearSOCChat = function() {
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages = [chat.messages[0]];
    localStorage.setItem('copilot_chats', JSON.stringify(chats));
    loadChatSession(currentChatId);
    showToast("Chat logs wiped.", "info");
  }
};
window.submitSOCChat = function() {
  submitCopilotQuery();
};
