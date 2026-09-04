SAFE DRILLDOWN FIX — 04/09/2026

BASE VERSION:
- Restored from the 02:00 working baseline files: index(1).html + app(1).js + clean bma1.html + data.js.

CHANGES IN THIS VERSION — ONLY DRILLDOWN:
1. Company Overview header link -> BMA I Focus now carries Year / Month / Channel / Product / Shop context.
2. Area table: only "BMA I (North West)" is clickable.
3. Clicking BMA I passes the current Year / Month / Channel / Product / Shop filters to bma1.html.
4. Added bma1.js to read the drilldown context and keep BMA I fixed as the Area.
5. BMA I uses the same KPI aggregation rules and the same Actual-vs-Target bar chart style as Company Overview.

IMPORTANT:
- Do NOT replace or modify style.css / bma1.css in this fix.
- Do NOT modify the existing product deep-dive pages.
- Do NOT use the older Company_Overview_Drilldown_FIX.zip.
- data.js in this package is the latest 04/09/2026 dashboard data file.

VALIDATION:
- Company Overview, 2026 / Month 8: 816.01 MB, Target 963.94 MB, QTY 64,992, Target QTY 107,401.
- BMA I + POSTPAID, 2026 / Month 8: 0.22 MB, Target 0.27 MB, QTY 406, Target QTY 501, ASP 533.


Update: Product dropdown is now treated as a master dimension. Selecting Channel/Area/Month no longer removes products from the Product dropdown. Transaction/KPI filtering still uses the selected Product, so products with no transactions in the selected scope show zero rather than disappearing.
