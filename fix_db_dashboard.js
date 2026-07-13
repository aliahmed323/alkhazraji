const fs = require('fs');
let code = fs.readFileSync('c:/Users/hp/Downloads/alkhazraji/js/db.js', 'utf8');

const regex = /async getDashboardData\(\) \{[\s\S]*?rawExpenses:\s*expenses\s*\};\s*\} catch \(e\) \{/m;

const newCode = \sync getDashboardData() {
      try {
        const todayStart = window.startOfDay(window.getToday());
        const todayEnd   = window.endOfDay(window.getToday());
  
        // Fetch only today's data to improve performance massively
        const [sales, purchases, expenses, payments] = await Promise.all([
          this.getSales(todayStart, todayEnd),
          this.getPurchases(todayStart, todayEnd),
          this.getExpenses(todayStart, todayEnd),
          this.getPayments(todayStart, todayEnd)
        ]);
  
        // Today's totals
        const todaySalesTotal    = window.sumBy(sales,     'total');
        const todayPurchasesTotal= window.sumBy(purchases, 'total');
        const todayExpensesTotal = window.sumBy(expenses,  'amount');
        const todayProfit        = window.sumBy(sales,     'profit') - todayExpensesTotal;
  
        // Recent transactions (combined, last 10)
        const allToday = [
          ...sales.map(s     => ({ ...s, _type: 'sale',     _amount: s.total,  _label: 'مبيعات ' + s.fishType })),
          ...purchases.map(p => ({ ...p, _type: 'purchase', _amount: p.total,  _label: 'مشتريات ' + p.fishType })),
          ...expenses.map(e  => ({ ...e, _type: 'expense',  _amount: e.amount, _label: e.typeName || e.type })),
          ...payments.map(pm => ({ ...pm, _type: 'payment', _amount: pm.amount, _label: 'دفعة لـ ' + pm.supplierName }))
        ].sort(function (a, b) {
          const ta = a.createdAt ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt ? b.createdAt.toMillis() : 0;
          return tb - ta;
        }).slice(0, 10);
  
        return {
          todaySalesTotal:    todaySalesTotal,
          todayPurchasesTotal:todayPurchasesTotal,
          todayExpensesTotal: todayExpensesTotal,
          todayProfit:        todayProfit,
          totalDebt:          0, // Moved to Debts page for performance
          inventorySummary:   [], // Moved to Inventory page for performance
          recentTransactions: allToday,
          rawSales:         sales,
          rawPurchases:     purchases,
          rawExpenses:      expenses
        };
      } catch (e) {\;

code = code.replace(regex, newCode);
fs.writeFileSync('c:/Users/hp/Downloads/alkhazraji/js/db.js', code, 'utf8');
