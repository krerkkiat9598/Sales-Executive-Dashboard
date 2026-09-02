const DATA = window.SALES_DATA || [];

const $ = id => document.getElementById(id);

const nf = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

const money = v => ((v || 0) / 1e6).toFixed(2) + " MB";
const pct = v => ((v || 0) * 100).toFixed(1) + "%";
const num = v => nf.format(Math.round(v || 0));

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));

/* =========================================================
   BMA I FILTER
========================================================= */

const BMA1 = "BMA I (North West)";

const filters = {
  fYear: r => r.YEAR,
  fMonth: r => r.MONTH,
  fChannel: r => r.CHANNEL,
  fProduct: r => r.PRODUCT,
  fShop: r => r.SHOP_NAME
};

function uniq(arr) {
  return [
    ...new Set(
      arr.filter(x => x !== "" && x !== null && x !== undefined)
    )
  ];
}

function fillSelect(id, values, allLabel) {

  const el = $(id);

  if (!el) return;

  const current = el.value;

  el.innerHTML =
    `<option value="">${allLabel}</option>` +
    uniq(values)
      .sort((a,b) =>
        String(a).localeCompare(String(b), undefined, {
          numeric: true
        })
      )
      .map(v =>
        `<option value="${esc(v)}">${esc(v)}</option>`
      )
      .join("");

  if (
    [...el.options].some(o => o.value === current)
  ) {
    el.value = current;
  }
}


/* =========================================================
   BASE DATA = BMA I ONLY
========================================================= */

function baseData() {

  return DATA.filter(r =>
    String(r.AREA || "").trim() === BMA1
  );

}


/* =========================================================
   FILTER DATA
========================================================= */

function activeRows() {

  const rows = baseData();

  return rows.filter(r => {

    return Object.entries(filters).every(
      ([id, fn]) => {

        const value = $(id)?.value;

        return !value ||
          String(fn(r)) === String(value);

      }
    );

  });

}


/* =========================================================
   AGGREGATION
========================================================= */

function aggregate(rows) {

  return rows.reduce((a,r) => {

    a.targetQty += Number(r.TARGET_BOTTOMUP_QTY || 0);

    a.targetAmount += Number(
      r.TARGET_BOTTOMUP_NET_AMOUNT || 0
    );

    a.qty += Number(r.QTY || 0);

    a.amount += Number(
      r.NET_AMOUNT || 0
    );

    return a;

  }, {
    targetQty: 0,
    targetAmount: 0,
    qty: 0,
    amount: 0
  });

}


/* =========================================================
   STATUS
========================================================= */

function status(ach) {

  if (ach >= 1) return "ACHIEVE";

  if (ach >= 0.95) return "WATCH";

  if (ach >= 0.80) return "RISK";

  return "CRITICAL";

}

function statusClass(ach) {

  if (ach >= 1) return "good";

  if (ach >= 0.95) return "watch";

  if (ach >= 0.80) return "risk";

  return "critical";

}


/* =========================================================
   FILTER INITIALIZATION
========================================================= */

function initFilters() {

  const rows = baseData();

  fillSelect(
    "fYear",
    rows.map(r => r.YEAR),
    "All Years"
  );

  fillSelect(
    "fMonth",
    rows.map(r => r.MONTH),
    "All Months"
  );

  fillSelect(
    "fChannel",
    rows.map(r => r.CHANNEL),
    "All Channels"
  );

  fillSelect(
    "fProduct",
    rows.map(r => r.PRODUCT),
    "All Products"
  );

  fillSelect(
    "fShop",
    rows.map(r => r.SHOP_NAME),
    "All Shops"
  );

}


/* =========================================================
   KPI
========================================================= */

function renderKPI(rows) {

  const a = aggregate(rows);

  const amountAch =
    a.targetAmount
      ? a.amount / a.targetAmount
      : 0;

  const qtyAch =
    a.targetQty
      ? a.qty / a.targetQty
      : 0;

  const amountGap =
    a.amount - a.targetAmount;

  const qtyGap =
    a.qty - a.targetQty;

  const asp =
    a.qty
      ? a.amount / a.qty
      : 0;

  $("kAmount").textContent =
    money(a.amount);

  $("kAmountTarget").textContent =
    money(a.targetAmount);

  $("kAmountAch").textContent =
    pct(amountAch);

  $("kAmountGap").textContent =
    (amountGap >= 0 ? "+" : "") +
    money(amountGap);

  $("kQty").textContent =
    num(a.qty);

  $("kQtyTarget").textContent =
    num(a.targetQty);

  $("kQtyAch").textContent =
    pct(qtyAch);

  $("kQtyGap").textContent =
    (qtyGap >= 0 ? "+" : "") +
    num(qtyGap);

  $("kAsp").textContent =
    num(asp);

  const st = status(amountAch);

  $("kStatus").textContent =
    st;

  $("kStatus").className =
    statusClass(amountAch);

  $("kStatusNote").textContent =
    amountGap >= 0
      ? "Net Amount target achieved"
      : "Net Amount gap " +
        pct(Math.abs(amountGap) / (
          a.targetAmount || 1
        ));

}


/* =========================================================
   EXECUTIVE INSIGHT
========================================================= */

function renderInsight(rows) {

  const a = aggregate(rows);

  const amountAch =
    a.targetAmount
      ? a.amount / a.targetAmount
      : 0;

  const qtyAch =
    a.targetQty
      ? a.qty / a.targetQty
      : 0;

  const gap =
    a.amount - a.targetAmount;

  const asp =
    a.qty
      ? a.amount / a.qty
      : 0;

  let message = "";

  if (amountAch >= 1 && qtyAch < 1) {

    message =
      `BMA I achieved ${pct(amountAch)} of Net Amount target, ` +
      `with ${money(Math.abs(gap))} ` +
      `${gap >= 0 ? "above" : "below"} target. ` +
      `QTY achieved only ${pct(qtyAch)}, indicating that ` +
      `higher value per unit is supporting the sales result. ` +
      `ASP is ${num(asp)} per unit.`;

  } else if (amountAch < 1 && qtyAch < 1) {

    message =
      `BMA I achieved ${pct(amountAch)} of Net Amount target, ` +
      `with a gap of ${money(Math.abs(gap))}. ` +
      `QTY achievement is ${pct(qtyAch)}, ` +
      `showing that both sales value and volume remain below target. ` +
      `ASP is ${num(asp)} per unit.`;

  } else {

    message =
      `BMA I achieved ${pct(amountAch)} of Net Amount target ` +
      `with QTY achievement of ${pct(qtyAch)}. ` +
      `ASP is ${num(asp)} per unit and is contributing to the ` +
      `overall Net Amount performance.`;

  }

  $("insightText").textContent = message;

}


/* =========================================================
   MONTHLY TREND
========================================================= */

function renderTrend(rows) {

  const year =
    $("fYear").value ||
    "2026";

  const selectedMonth =
    $("fMonth").value;

  const monthly = [];

  for (let m = 1; m <= 12; m++) {

    const r = rows.filter(x =>
      String(x.YEAR) === String(year) &&
      Number(x.MONTH) === m
    );

    const a = aggregate(r);

    if (
      a.amount === 0 &&
      a.targetAmount === 0
    ) continue;

    monthly.push({
      month: m,
      actual: a.amount,
      target: a.targetAmount
    });

  }

  const max =
    Math.max(
      ...monthly.map(x =>
        Math.max(x.actual, x.target)
      ),
      1
    );

  $("trendChart").innerHTML =
    `<div class="bar-chart">
      ${monthly.map(x => {

        const ah =
          (x.actual / max) * 100;

        const th =
          (x.target / max) * 100;

        const selected =
          String(x.month) === String(selectedMonth)
            ? " selected"
            : "";

        return `
          <div class="bar-group${selected}">

            <div class="bars">

              <div
                class="bar actual"
                style="height:${ah}%"
                title="Month ${x.month} Actual ${money(x.actual)}">
              </div>

              <div
                class="bar target"
                style="height:${th}%"
                title="Month ${x.month} Target ${money(x.target)}">
              </div>

            </div>

            <div class="bar-label">
              ${String(x.month).padStart(2,"0")}
            </div>

          </div>
        `;

      }).join("")}

    </div>

    <div class="legend">
      <span><i class="actual-dot"></i> Actual Net Amount</span>
      <span><i class="target-dot"></i> Target Net Amount</span>
    </div>`;

}


/* =========================================================
   QTY TREND
========================================================= */

function renderQtyTrend(rows) {

  const year =
    $("fYear").value ||
    "2026";

  const selectedMonth =
    $("fMonth").value;

  const monthly = [];

  for (let m = 1; m <= 12; m++) {

    const r = rows.filter(x =>
      String(x.YEAR) === String(year) &&
      Number(x.MONTH) === m
    );

    const a = aggregate(r);

    if (
      a.qty === 0 &&
      a.targetQty === 0
    ) continue;

    monthly.push({
      month: m,
      actual: a.qty,
      target: a.targetQty
    });

  }

  const max =
    Math.max(
      ...monthly.map(x =>
        Math.max(x.actual, x.target)
      ),
      1
    );

  $("volumeChart").innerHTML =
    `<div class="bar-chart">
      ${monthly.map(x => {

        const ah =
          (x.actual / max) * 100;

        const th =
          (x.target / max) * 100;

        const selected =
          String(x.month) === String(selectedMonth)
            ? " selected"
            : "";

        return `
          <div class="bar-group${selected}">

            <div class="bars">

              <div
                class="bar qty-actual"
                style="height:${ah}%"
                title="Month ${x.month} Actual QTY ${num(x.actual)}">
              </div>

              <div
                class="bar qty-target"
                style="height:${th}%"
                title="Month ${x.month} Target QTY ${num(x.target)}">
              </div>

            </div>

            <div class="bar-label">
              ${String(x.month).padStart(2,"0")}
            </div>

          </div>
        `;

      }).join("")}

    </div>

    <div class="legend">
      <span><i class="qty-actual-dot"></i> Actual QTY</span>
      <span><i class="qty-target-dot"></i> Target QTY</span>
    </div>`;

}


/* =========================================================
   PRODUCT PERFORMANCE
========================================================= */

function renderProduct(rows) {

  const products =
    uniq(rows.map(r => r.PRODUCT));

  const data =
    products.map(product => {

      const r =
        rows.filter(x =>
          x.PRODUCT === product
        );

      const a =
        aggregate(r);

      const ach =
        a.targetAmount
          ? a.amount / a.targetAmount
          : 0;

      const qAch =
        a.targetQty
          ? a.qty / a.targetQty
          : 0;

      const asp =
        a.qty
          ? a.amount / a.qty
          : 0;

      const gap =
      a.amount - a.targetAmount;

      return {
        product,
        target: a.targetAmount,
        amount: a.amount,
        ach,
        targetQty: a.targetQty,
        qty: a.qty,
        qAch,
        asp
        gap
      };
   
     })
    .sort((a,b) =>
      b.amount - a.amount
    );


  $("productTable").innerHTML = `

    <table>

      <thead>

        <tr>
          <th>Product</th>
          <th>Target Net Amount</th>
          <th>Net Amount</th>
          <th>Net Amt Ach.</th>
          <th>Target QTY</th>
          <th>QTY</th>
          <th>QTY Ach.</th>
          <th>ASP</th>
          <th>Gap</th>
        </tr>

      </thead>

      <tbody>

        ${data.map(x => `

          <tr>

            <td>
              <b>${esc(x.product)}</b>
            </td>

            <td>
              ${money(x.target)}
            </td>

            <td>
              ${money(x.amount)}
            </td>

            <td class="${statusClass(x.ach)}">
              ${pct(x.ach)}
            </td>

            <td>
              ${num(x.targetQty)}
            </td>

            <td>
              ${num(x.qty)}
            </td>

            <td class="${statusClass(x.qAch)}">
              ${pct(x.qAch)}
            </td>

            <td>
              ${num(x.asp)}
            </td>

           <td class="${x.gap >= 0 ? "good" : "critical"}">
           ${x.gap >= 0 ? "+" : ""}${money(x.gap)}
           </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;

}


/* =========================================================
   SHOP PERFORMANCE
========================================================= */

function renderShop(rows) {

  const shops =
    uniq(rows.map(r => r.SHOP_NAME));

  const data =
    shops.map(shop => {

      const r =
        rows.filter(x =>
          x.SHOP_NAME === shop
        );

      const a =
        aggregate(r);

      const ach =
        a.targetAmount
          ? a.amount / a.targetAmount
          : 0;

      const qAch =
       a.targetQty
         ? a.qty / a.targetQty
         : 0;
      
      const gap =
        a.amount - a.targetAmount;

      const asp =
        a.qty
          ? a.amount / a.qty
          : 0;

      return {
        shop,
        amount: a.amount,
        target: a.targetAmount,
        ach,
        qty: a.qty,
        targetQty: a.targetQty,
        qAch,
        asp,
        gap
      };

    })
    .sort((a,b) =>
      b.amount - a.amount
    );


  const top =
    data.slice(0, 10);


  $("shopTable").innerHTML = `

    <table>

      <thead>

        <tr>
          <th>Shop</th>
          <th>Target Net Amount</th>
          <th>Net Amount</th>
          <th>Ach.</th>
          <th>Target QTY</th>
          <th>QTY</th>
          <th>QTY Ach.</th>
          <th>ASP</th>
          <th>Gap</th>
        </tr>

      </thead>

      <tbody>

        ${top.map(x => `

          <tr>

            <td>
              <b>${esc(x.shop)}</b>
            </td>

            <td>
              ${money(x.target)}
            </td>

            <td>
              ${money(x.amount)}
            </td>

            <td class="${statusClass(x.ach)}">
              ${pct(x.ach)}
            </td>

            <td>
            ${num(x.targetQty)}
            </td>

            <td>
              ${num(x.qty)}
            </td>

            <td class="${statusClass(x.qAch)}">
             ${pct(x.qAch)}
            </td>

            <td>
              ${num(x.asp)}
            </td>

            <td class="${x.gap >= 0 ? "good" : "critical"}">
              ${x.gap >= 0 ? "+" : ""}${money(x.gap)}
            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;

}


/* =========================================================
   KEY MESSAGE
========================================================= */

function renderMessages(rows) {

  const a =
    aggregate(rows);

  const ach =
    a.targetAmount
      ? a.amount / a.targetAmount
      : 0;

  const qtyAch =
    a.targetQty
      ? a.qty / a.targetQty
      : 0;

  /* Product performance */

  const products =
    uniq(rows.map(r => r.PRODUCT))
      .map(product => {

        const r =
          rows.filter(x =>
            x.PRODUCT === product
          );

        const x =
          aggregate(r);

        return {
          product,
          amount: x.amount,
          ach:
            x.targetAmount
              ? x.amount / x.targetAmount
              : 0
        };

      })
      .sort((a,b) =>
        a.ach - b.ach
      );

  const weakest =
    products[0];


  /* Shop performance */

  const shops =
    uniq(rows.map(r => r.SHOP_NAME))
      .map(shop => {

        const r =
          rows.filter(x =>
            x.SHOP_NAME === shop
          );

        const x =
          aggregate(r);

        return {
          shop,
          amount: x.amount,
          gap:
            x.amount - x.targetAmount
        };

      })
      .sort((a,b) =>
        a.gap - b.gap
      );

  const focusShop =
    shops[0];


  /* Key Message */

  $("keyMessage").innerHTML = `

    <ul>

      <li>
        Net Amount Achievement:
        <b>${pct(ach)}</b>
      </li>

      <li>
        QTY Achievement:
        <b>${pct(qtyAch)}</b>
      </li>

      ${
        focusShop
          ? `<li>
              Largest Shop Gap:
              <b>${esc(focusShop.shop)}</b>
              (${focusShop.gap >= 0 ? "+" : ""}${money(focusShop.gap)})
             </li>`
          : ""
      }

      ${
        weakest
          ? `<li>
              Lowest Product Achievement:
              <b>${esc(weakest.product)}</b>
              (${pct(weakest.ach)})
             </li>`
          : ""
      }

    </ul>

  `;


  /* Management Action */

  $("actionMessage").innerHTML = `

    <ul>

      <li>
        Protect DEVICE and other
        high-value sales contributors.
      </li>

      <li>
        Close the QTY gap while
        maintaining Net Amount achievement.
      </li>

      ${
        focusShop
          ? `<li>
              Prioritize recovery at
              <b>${esc(focusShop.shop)}</b>
              (${focusShop.gap >= 0 ? "+" : ""}${money(focusShop.gap)})
             </li>`
          : ""
      }

      ${
        weakest
          ? `<li>
              Review low-performing product:
              <b>${esc(weakest.product)}</b>
            </li>`
          : ""
      }

    </ul>

  `;

}

function renderSubtitle() {

  const year =
    $("fYear").value || "All Years";

  const month =
    $("fMonth").value || "All Months";

  $("subtitle").textContent =
    `BMA I (North West) • ${year} • ${month} • Net Amount + QTY Performance`;

}


/* =========================================================
   RENDER ALL
========================================================= */

function render() {

  const rows =
    activeRows();

  renderKPI(rows);

  renderInsight(rows);

  renderTrend(baseData());

  renderQtyTrend(baseData());

  renderProduct(rows);

  renderShop(rows);

  renderMessages(rows);

  renderSubtitle();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  Object.keys(filters).forEach(id => {

    $(id)?.addEventListener(
      "change",
      render
    );

  });


  $("resetBtn")?.addEventListener(
    "click",
    () => {

      $("fYear").value = "";
      $("fMonth").value = "";
      $("fChannel").value = "";
      $("fProduct").value = "";
      $("fShop").value = "";

      render();

    }
  );

}


/* =========================================================
   START
========================================================= */

function start() {

  initFilters();

  /*
    BMA I dashboard default:
    2026 / Month 8
  */

  if (
    [...$("fYear").options]
      .some(o => o.value === "2026")
  ) {
    $("fYear").value = "2026";
  }

  if (
    [...$("fMonth").options]
      .some(o => o.value === "8")
  ) {
    $("fMonth").value = "8";
  }

  setupEvents();

  render();

}


document.addEventListener(
  "DOMContentLoaded",
  start
);
