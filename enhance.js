const fs = require('fs');

const premiumCSS = `
        :root {
            --primary: #0A192F;
            --primary-light: #112240;
            --accent: #64FFDA;
            --accent-hover: #4CD6B6;
            --success: #2E7D32;
            --success-light: rgba(46, 125, 50, 0.1);
            --danger: #FF5252;
            --danger-light: rgba(255, 82, 82, 0.1);
            --warning: #FFAB40;
            --warning-light: rgba(255, 171, 64, 0.1);
            --bg: #F4F7FB;
            --card: rgba(255, 255, 255, 0.95);
            --text-dark: #233554;
            --text-medium: #495670;
            --text-light: #8892B0;
            --border: rgba(13, 33, 55, 0.1);
            --shadow: 0 10px 30px -10px rgba(2, 12, 27, 0.15);
            --radius: 16px;
            --radius-lg: 24px;
            --radius-sm: 10px;
        }
        body { font-family: 'Cairo', sans-serif; background: var(--bg); color: var(--text-dark); margin:0; padding:0; direction: rtl; overflow-x: hidden; }
        * { box-sizing: border-box; }
        
        /* Loading Screen */
        #loading-screen { position: fixed; inset: 0; background: linear-gradient(135deg, var(--primary) 0%, #020c1b 100%); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; transition: opacity 0.6s ease; }
        @keyframes floating { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
        .fish-logo { font-size: 90px; animation: floating 3s ease-in-out infinite; margin-bottom: 25px; filter: drop-shadow(0 10px 15px rgba(100,255,218,0.3)); }
        #loading-screen h2 { font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; color: var(--accent); }
        
        .app-wrapper { display: flex; height: 100vh; overflow: hidden; background: linear-gradient(to right, #f4f7fb, #ffffff); }
        
        /* Sidebar */
        .sidebar { width: 260px; background: linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%); color: white; display: flex; flex-direction: column; padding: 25px 0; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 4px 0 20px rgba(0,0,0,0.1); z-index: 20; }
        .sidebar-logo { text-align: center; font-size: 28px; font-weight: 800; margin-bottom: 40px; display: flex; align-items: center; justify-content: center; gap: 12px; color: var(--accent); letter-spacing: 1px; }
        .nav-item { padding: 16px 25px; color: var(--text-light); text-decoration: none; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.3s ease; border-right: 4px solid transparent; font-size: 16px; font-weight: 600; margin: 4px 15px; border-radius: 12px; }
        .nav-item:hover, .nav-item.active { background: rgba(100, 255, 218, 0.1); color: var(--accent); border-right-color: transparent; box-shadow: inset -4px 0 0 var(--accent); transform: translateX(-5px); }
        
        .main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; position: relative; }
        
        /* Topbar */
        .topbar { height: 70px; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: space-between; padding: 0 30px; z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.5); }
        #page-title { margin:0; font-size:22px; font-weight: 700; color: var(--primary); }
        
        .page-container { flex: 1; overflow-y: auto; padding: 30px; scroll-behavior: smooth; }
        .page { display: none; animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
        .page.active { display: block; }
        @keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
        
        /* Bottom Nav (Mobile) */
        .bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 75px; background: rgba(255,255,255,0.95); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); box-shadow: 0 -5px 25px rgba(0,0,0,0.08); z-index: 90; justify-content: space-around; align-items: center; padding-bottom: env(safe-area-inset-bottom); border-top: 1px solid rgba(0,0,0,0.05); border-radius: 20px 20px 0 0; }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; color: var(--text-light); font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); gap: 4px; }
        .bottom-nav-item.active { color: var(--primary); transform: translateY(-3px); }
        .bottom-nav-item.active i { color: var(--accent); filter: drop-shadow(0 2px 4px rgba(100,255,218,0.4)); }
        
        @media (max-width: 768px) {
            .sidebar { display: none; }
            .bottom-nav { display: flex; }
            .page-container { padding: 20px 15px 100px 15px; }
            .topbar { padding: 0 15px; }
        }
        
        /* Cards & Glassmorphism */
        .card { background: var(--card); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: var(--radius); padding: 25px; box-shadow: var(--shadow); margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.6); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 15px 35px -10px rgba(2, 12, 27, 0.2); }
        .card h3.text-medium { color: var(--text-medium); font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .card h2 { color: var(--primary); font-size: 28px; font-weight: 800; margin-top: 10px; margin-bottom: 0; }
        
        /* Buttons */
        .btn { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-family: inherit; font-size: 16px; font-weight: 600; min-height: 50px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; z-index: 1; }
        .btn::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.1); transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease; z-index: -1; }
        .btn:hover::before { transform: scaleX(1); transform-origin: left; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
        .btn:active { transform: translateY(1px); }
        
        .btn-success { background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%); box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3); }
        .btn-danger { background: linear-gradient(135deg, #FF5252 0%, #D50000 100%); box-shadow: 0 4px 15px rgba(255, 82, 82, 0.3); }
        .btn-warning { background: linear-gradient(135deg, #FFAB40 0%, #E65100 100%); box-shadow: 0 4px 15px rgba(255, 171, 64, 0.3); }
        .btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
        .btn-outline:hover { background: var(--primary-light); color: white; border-color: var(--primary-light); }
        
        /* Forms */
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 15px; color: var(--primary); }
        .form-control { width: 100%; padding: 14px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); font-family: inherit; font-size: 16px; background: rgba(255,255,255,0.8); transition: all 0.3s ease; color: var(--text-dark); }
        .form-control:focus { outline: none; border-color: var(--accent-hover); box-shadow: 0 0 0 4px rgba(100, 255, 218, 0.15); background: #fff; }
        
        /* Tables */
        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        th, td { padding: 16px 15px; text-align: right; border-bottom: 1px solid var(--border); }
        th { background: rgba(244, 247, 251, 0.8); color: var(--primary); font-weight: 700; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; }
        th:first-child { border-top-right-radius: var(--radius-sm); }
        th:last-child { border-top-left-radius: var(--radius-sm); }
        tr { transition: background 0.2s ease; }
        tr:hover td { background: rgba(100, 255, 218, 0.05); }
        
        /* Modals */
        .modal { display: none; position: fixed; inset: 0; background: rgba(2, 12, 27, 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: 1000; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.3s ease; }
        .modal.active { display: flex; opacity: 1; }
        .modal-content { background: var(--card); border-radius: var(--radius-lg); width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.3); transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modal.active .modal-content { transform: scale(1); }
        .modal-header { padding: 25px 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.5); }
        .modal-body { padding: 30px; }
        .modal-close { background: transparent; border: none; font-size: 28px; cursor: pointer; color: var(--text-light); transition: 0.2s ease; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .modal-close:hover { background: var(--danger-light); color: var(--danger); transform: rotate(90deg); }
        
        /* Typography & Utilities */
        .text-danger { color: var(--danger); }
        .text-success { color: var(--success); }
        .text-medium { color: var(--text-medium); }
        .font-bold { font-weight: 800; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        
        .badge { padding: 6px 12px; border-radius: 30px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }
        .bg-danger { background: var(--danger-light); color: var(--danger); }
        .bg-success { background: var(--success-light); color: var(--success); }
        .bg-warning { background: var(--warning-light); color: var(--warning); }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(13, 33, 55, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(13, 33, 55, 0.4); }
        
        /* FAB Animation */
        #fab-calculator { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(100, 255, 218, 0); } 100% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0); } }
`;

let html = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', 'utf8');
const startIndex = html.indexOf('<style>');
const endIndex = html.indexOf('</style>') + 8;
html = html.substring(0, startIndex) + '<style>\n' + premiumCSS + '\n</style>' + html.substring(endIndex);
fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/index.html', html, 'utf8');
console.log('Applied premium CSS');
