const fs = require('fs');
let code = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/js/app.js', 'utf8');

const regex1 = /const PAGE_TITLES = \{[\s\S]*?\};/;
const newTitles = \const PAGE_TITLES = {
    'dashboard':  'لوحة التحكم',
    'sales':      'المبيعات',
    'purchases':  'المشتريات',
    'expenses':   'المصاريف',
    'profits':    'الأرباح',
    'suppliers':  'الموردون',
    'debts':      'الديون',
    'inventory':  'المخزون',
    'reports':    'التقارير',
    'settings':   'الإعدادات'
  };\;

code = code.replace(regex1, newTitles);

const regex2 = /const PAGE_MODULES = \{[\s\S]*?\};/;
const newModules = \const PAGE_MODULES = {
    'dashboard':  function () { if (window.DashboardPage && window.DashboardPage.init)  window.DashboardPage.init();  },
    'sales':      function () { if (window.SalesPage     && window.SalesPage.init)      window.SalesPage.init();      },
    'purchases':  function () { if (window.PurchasesPage && window.PurchasesPage.init)  window.PurchasesPage.init();  },
    'expenses':   function () { if (window.ExpensesPage  && window.ExpensesPage.init)   window.ExpensesPage.init();   },
    'profits':    function () { if (window.ProfitsPage   && window.ProfitsPage.init)    window.ProfitsPage.init();    },
    'suppliers':  function () { if (window.SuppliersPage && window.SuppliersPage.init)  window.SuppliersPage.init();  },
    'debts':      function () { if (window.DebtsPage     && window.DebtsPage.init)      window.DebtsPage.init();      },
    'inventory':  function () { if (window.InventoryPage && window.InventoryPage.init)  window.InventoryPage.init();  },
    'reports':    function () { if (window.ReportsPage   && window.ReportsPage.init)    window.ReportsPage.init();    },
    'settings':   function () { if (window.SettingsPage  && window.SettingsPage.init)   window.SettingsPage.init();   }
  };\;

code = code.replace(regex2, newModules);

fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/js/app.js', code, 'utf8');
