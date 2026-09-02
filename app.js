const DATA = window.SALES_DATA || [];

const $ = id => document.getElementById(id);

const nf = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

const money = v => (v / 1e6).toFixed(2) + " MB";
const pct = v => (v * 100).toFixed(1) + "%";
const num = v => nf.format(Math.round(v || 0));

const esc = s =>
  String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));

const filters = {
  fYear: r => r.YEAR,
  fMonth: r => r.MONTH,
  fRegion: r => r.AREA_GROUP,
  fArea: r => r.AREA,
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

function setOptions(id, vals, allLabel) {
  const el = $(id);
  const current = el.value;

  el.innerHTML =
    `<option value="">${allLabel}</option>` +
    uniq(vals)
      .sort((a, b) =>
        String(a).localeCompare(
          String(b),
          undefined,
          { numeric: true }
        )
      )
      .map(
        v =>
          `<option value="${esc(v)}">${esc(v)}</option>`
      )
      .join("");

  if ([...el.options].some(o => o.value === current)) {
    el.value = current;
  }
}

function activeRows() {
  return DATA.filter(r =>
    Object.keys(filters).every(id => {
      const v = $(id).value;
      return !v || String(filters[id](r)) === v;
    })
  );
}

function aggregate(rows) {
  return rows.reduce(
    (a, r) => {
      a.tq += +r.TARGET_BOTTOMUP_QTY || 0;
      a.ta += +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;
      a.q += +r.QTY || 0;
      a.a += +r.NET_AMOUNT || 0;
      return a;
    },
    {
      tq: 0,
      ta: 0,
      q: 0,
      a: 0
    }
  );
}

function status(ach) {
  return ach >= 1
    ? "ACHIEVE"
    : ach >= 0.95
    ? "WATCH"
    : ach >= 0.8
    ? "RISK"
    : "CRITICAL";
}

function cls(ach) {
  return ach >= 1
    ? "good"
    : ach >= 0.95
    ? "watch"
    : ach >= 0.8
    ? "risk"
    : "critical";
}

/* =========================================================
   FILTER LOGIC
   ========================================================= */

function refreshDependent() {

  const selected = {};

  Object.keys(filters).forEach(id => {
    selected[id] = $(id).value;
  });

  let rows = DATA;

  /* Year */
  if (selected.fYear) {
    rows = rows.filter(
      r => String(r.YEAR) === selected.fYear
    );
  }

  setOptions(
    "fMonth",
    rows.map(r => r.MONTH),
    "All Months"
  );

  /* Year + Month */
  rows = DATA;

  if (selected.fYear) {
    rows = rows.filter(
      r => String(r.YEAR) === selected.fYear
    );
  }

  if (selected.fMonth) {
    rows = rows.filter(
      r => String(r.MONTH) === selected.fMonth
    );
  }

  setOptions(
    "fRegion",
    rows.map(r => r.AREA_GROUP),
    "All Regions"
  );

  /* Year + Month + Region */
  rows = DATA;

  if (selected.fYear) {
    rows = rows.filter(
      r => String(r.YEAR) === selected.fYear
    );
  }

  if (selected.fMonth) {
    rows = rows.filter(
      r => String(r.MONTH) === selected.fMonth
    );
  }

  if (selected.fRegion) {
    rows = rows.filter(
      r => String(r.AREA_GROUP) === selected.fRegion
    );
  }

  setOptions(
    "fArea",
    rows.map(r => r.AREA),
    "All Areas"
  );

  /* + Area */
  rows = DATA;

  if (selected.fYear) {
    rows = rows.filter(
      r => String(r.YEAR) === selected.fYear
    );
  }

  if (selected.fMonth) {
    rows = rows.filter(
      r => String(r.MONTH) === selected.fMonth
    );
  }

  if (selected.fRegion) {
    rows = rows.filter(
      r => String(r.AREA_GROUP) === selected.fRegion
    );
  }

  if (selected.fArea) {
    rows = rows.filter(
      r => String(r.AREA) === selected.fArea
    );
  }

  setOptions(
    "fChannel",
    rows.map(r => r.CHANNEL),
    "All Channels"
  );

  /* + Channel */
  rows = DATA;

  if (selected.fYear) {
    rows = rows.filter(
      r => String(r.YEAR) === selected.fYear
    );
  }

  if (selected.fMonth) {
    rows = rows.filter(
      r => String(r.MONTH) === selected.fMonth
    );
  }

  if (selected.fRegion) {
    rows = rows.filter(
      r => String(r.AREA_GROUP) === selected.fRegion
    );
  }

  if (selected.fArea) {
    rows = rows.filter(
      r => String(r.AREA) === selected.fArea
    );
  }

  if (selected.fChannel) {
    rows = rows.filter(
      r => String(r.CHANNEL) === selected.fChannel
    );
  }

  setOptions(
    "fProduct",
    rows.map(r => r.PRODUCT),
    "All Products"
  );

  /* + Product */
  rows = DATA;

  if (selected.fYear) {
    rows = rows.filter(
      r => String(r.YEAR) === selected.fYear
    );
  }

  if (selected.fMonth) {
    rows = rows.filter(
      r => String(r.MONTH) === selected.fMonth
    );
  }

  if (selected.fRegion) {
    rows = rows.filter(
      r => String(r.AREA_GROUP) === selected.fRegion
    );
  }

  if (selected.fArea) {
    rows = rows.filter(
      r => String(r.AREA) === selected.fArea
    );
  }

  if (selected.fChannel) {
    rows = rows.filter(
      r => String(r.CHANNEL) === selected.fChannel
    );
  }

  if (selected.fProduct) {
    rows = rows.filter(
      r => String(r.PRODUCT) === selected.fProduct
    );
  }

  setOptions(
    "fShop",
    rows.map(r => r.SHOP_NAME),
    "All Shops"
  );

  /* Restore selections */
  Object.keys(filters).forEach(id => {

    if (
      [...$(id).options].some(
        o => o.value === selected[id]
      )
    ) {
      $(id).value = selected[id];
    }

  });
}


/* =========================================================
   INITIAL SETUP
   ========================================================= */

function populate() {

  setOptions(
    "fYear",
    DATA.map(r => r.YEAR),
    "All Years"
  );

  setOptions(
    "fMonth",
    DATA.map(r => r.MONTH),
    "All Months"
  );

  setOptions(
    "fRegion",
    DATA.map(r => r.AREA_GROUP),
    "All Regions"
  );

  setOptions(
    "fArea",
    DATA.map(r => r.AREA),
    "All Areas"
  );

  setOptions(
    "fChannel",
    DATA.map(r => r.CHANNEL),
    "All Channels"
  );

  setOptions(
    "fProduct",
    DATA.map(r => r.PRODUCT),
    "All Products"
  );

  setOptions(
    "fShop",
    DATA.map(r => r.SHOP_NAME),
    "All Shops"
  );

  /*
    DEFAULT VIEW

    Company Overview
    2026
    August
    All Regions
    All Areas
  */

  $("fYear").value = "2026";
  $("fMonth").value = "8";

  $("fRegion").value = "";
  $("fArea").value = "";
  $("fChannel").value = "";
  $("fProduct").value = "";
  $("fShop").value = "";

  refreshDependent();
}


/* =========================================================
   KPI
   ========================================================= */

function updateKPIs(rows) {

  const x = aggregate(rows);

  const amountAch =
    x.ta ? x.a / x.ta : 0;

  const volumeAch =
    x.tq ? x.q / x.tq : 0;

  const asp =
    x.q ? x.a / x.q : 0;

  $("kAmount").textContent =
    money(x.a);

  $("kAmountTarget").textContent =
    money(x.ta);

  $("kAmountAch").textContent =
    pct(amountAch);

  $("kAmountGap").textContent =
    (x.a - x.ta >= 0 ? "+" : "") +
    money(x.a - x.ta);

  $("kQty").textContent =
    num(x.q);

  $("kQtyTarget").textContent =
    num(x.tq);

  $("kQtyAch").textContent =
    pct(volumeAch);

  $("kQtyGap").textContent =
    (x.q - x.tq >= 0 ? "+" : "") +
    num(x.q - x.tq);

  $("kAsp").textContent =
    x.q ? nf.format(asp) : "-";

  $("kStatus").textContent =
    status(amountAch);

  $("kStatus").className =
    cls(amountAch);

  $("kStatusNote").textContent =
    amountAch >= 1
      ? "Amount target achieved"
      : `Gap ${pct(Math.abs(1 - amountAch))} to target`;


  /* Subtitle */

  const scope = [];

  const names = [
    ["fYear", "Year"],
    ["fMonth", "Month"],
    ["fRegion", "Region"],
    ["fArea", "Area"],
    ["fChannel", "Channel"],
    ["fProduct", "Product"],
    ["fShop", "Shop"]
  ];

  names.forEach(([id, label]) => {

    if ($(id).value) {
      scope.push(
        `${label}: ${$(id).value}`
      );
    }

  });

  $("subtitle").textContent =
    (scope.length
      ? scope.join(" • ")
      : "Company Overview") +
    " • Net Amount + Volume Performance";


  /* Executive Insight */

  const volumeMsg =
    volumeAch < 1
      ? `Volume is below target by ${num(
          Math.abs(x.q - x.tq)
        )} (${pct(volumeAch)} achievement).`
      : `Volume is at ${pct(
          volumeAch
        )} of target.`;

  const amountMsg =
    amountAch >= 1
      ? `Net Amount achieved ${pct(
          amountAch
        )} of target, with ${money(
          x.a - x.ta
        )} above target.`
      : `Net Amount is ${pct(
          amountAch
        )} of target, with a gap of ${money(
          Math.abs(x.a - x.ta)
        )}.`;

  const driver =
    volumeAch < amountAch
      ? `ASP is ${nf.format(
          asp
        )} per unit, indicating value per unit is supporting the Net Amount result.`
      : `Volume is the stronger driver of Net Amount performance.`;

  $("insightText").textContent =
    `${amountMsg} ${volumeMsg} ${driver}`;


  /* Action */

  $("keyMessage").textContent =
    `Amount status: ${status(
      amountAch
    )} (${pct(
      amountAch
    )}). Volume status: ${status(
      volumeAch
    )} (${pct(
      volumeAch
    )}).`;

  $("actionMessage").textContent =
    volumeAch < amountAch
      ? `Focus on volume recovery while protecting ASP; prioritize products and shops with the largest Volume and Net Amount gaps.`
      : `Focus on sustaining volume while improving value per unit and product mix.`;
}


/* =========================================================
   MONTHLY DATA
   ========================================================= */

function monthly(rows) {

  const by = {};

  rows.forEach(r => {

    const key =
      `${r.YEAR}-${String(
        r.MONTH
      ).padStart(2, "0")}`;

    if (!by[key]) {
      by[key] = {
        a: 0,
        t: 0,
        q: 0,
        tq: 0
      };
    }

    by[key].a +=
      +r.NET_AMOUNT || 0;

    by[key].t +=
      +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;

    by[key].q +=
      +r.QTY || 0;

    by[key].tq +=
      +r.TARGET_BOTTOMUP_QTY || 0;

  });

  return Object.entries(by)
    .sort()
    .map(([k, v]) => ({
      ...v,
      k: k.slice(5)
    }));
}


/* =========================================================
   TREND
   ========================================================= */

function renderTrend(rows) {

  const selectedMonth =
    $("fMonth").value;

  /*
    IMPORTANT:

    KPI = selected month

    Trend =
    Jan -> selected month

    while keeping:
    Year
    Region
    Area
    Channel
    Product
    Shop
  */

  let trendRows = DATA.filter(r => {

    const checks = [
      ["fYear", r.YEAR],
      ["fRegion", r.AREA_GROUP],
      ["fArea", r.AREA],
      ["fChannel", r.CHANNEL],
      ["fProduct", r.PRODUCT],
      ["fShop", r.SHOP_NAME]
    ];

    return checks.every(
      ([id, val]) =>
        !$(id).value ||
        String(val) === $(id).value
    );

  });

  if (!$("fYear").value) {
    trendRows = DATA.slice();
  }

  const d = monthly(trendRows);

  const max = Math.max(
    ...d.map(x => x.a),
    ...d.map(x => x.t),
    1
  );

  $("trendChart").innerHTML =
    `<div class="bars">` +
    d
      .map(
        x =>
          `<div class="chartcol">
            <div class="barwrap">
              <div
                class="bar actual"
                style="height:${x.a / max * 100}%">
              </div>
              <div
                class="bar target"
                style="height:${x.t / max * 100}%">
              </div>
            </div>
            <div class="barlabel">${x.k}</div>
          </div>`
      )
      .join("") +
    `</div>
     <div class="legend">
       Actual ■ &nbsp;
       Target ■
       ${
         selectedMonth
           ? `• Selected month: ${selectedMonth}`
           : ""
       }
     </div>`;


  const maxq = Math.max(
    ...d.map(x => x.q),
    ...d.map(x => x.tq),
    1
  );

  $("volumeChart").innerHTML =
    `<div class="bars">` +
    d
      .map(
        x =>
          `<div class="chartcol">
            <div class="barwrap">
              <div
                class="bar qty"
                style="height:${x.q / maxq * 100}%">
              </div>
              <div
                class="bar target"
                style="height:${x.tq / maxq * 100}%">
              </div>
            </div>
            <div class="barlabel">${x.k}</div>
          </div>`
      )
      .join("") +
    `</div>
     <div class="legend">
       Actual Volume ■ &nbsp;
       Target Volume ■
       ${
         selectedMonth
           ? `• Selected month: ${selectedMonth}`
           : ""
       }
     </div>`;
}


/* =========================================================
   PRODUCT
   ========================================================= */

function renderProduct(rows) {

  const by = {};

  rows.forEach(r => {

    const k = r.PRODUCT;

    if (!by[k]) {
      by[k] = {
        a: 0,
        t: 0,
        q: 0,
        tq: 0
      };
    }

    by[k].a +=
      +r.NET_AMOUNT || 0;

    by[k].t +=
      +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;

    by[k].q +=
      +r.QTY || 0;

    by[k].tq +=
      +r.TARGET_BOTTOMUP_QTY || 0;

  });

  const arr =
    Object.entries(by)
      .map(([k, v]) => ({
        k,
        ...v,
        aa: v.t ? v.a / v.t : 0,
        qa: v.tq ? v.q / v.tq : 0,
        asp: v.q ? v.a / v.q : 0
      }))
      .sort((a, b) => b.a - a.a);


  $("productTable").innerHTML =
    `<div class="tablewrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Net Amount</th>
            <th>Amt Ach.</th>
            <th>Volume</th>
            <th>Vol Ach.</th>
            <th>ASP</th>
          </tr>
        </thead>
        <tbody>
          ${
            arr
              .map(
                x =>
                  `<tr>
                    <td>${esc(x.k)}</td>
                    <td>${money(x.a)}</td>
                    <td class="${cls(x.aa)}">
                      ${pct(x.aa)}
                    </td>
                    <td>${num(x.q)}</td>
                    <td class="${cls(x.qa)}">
                      ${pct(x.qa)}
                    </td>
                    <td>${nf.format(x.asp)}</td>
                  </tr>`
              )
              .join("")
          }
        </tbody>
      </table>
    </div>`;
}


/* =========================================================
   AREA
   ========================================================= */

function renderArea(rows) {

  const by = {};

  rows.forEach(r => {

    const k = r.AREA;

    if (!by[k]) {
      by[k] = {
        a: 0,
        t: 0,
        q: 0,
        tq: 0
      };
    }

    by[k].a +=
      +r.NET_AMOUNT || 0;

    by[k].t +=
      +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;

    by[k].q +=
      +r.QTY || 0;

    by[k].tq +=
      +r.TARGET_BOTTOMUP_QTY || 0;

  });

  const arr =
    Object.entries(by)
      .map(([k, v]) => ({
        k,
        ...v,
        aa: v.t ? v.a / v.t : 0,
        qa: v.tq ? v.q / v.tq : 0
      }))
      .sort((a, b) => b.aa - a.aa);


  $("areaTable").innerHTML =
    `<div class="tablewrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Area</th>
            <th>Net Amount</th>
            <th>Amt Ach.</th>
            <th>Volume</th>
            <th>Vol Ach.</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          ${
            arr
              .map(
                x =>
                  `<tr>
                    <td>${esc(x.k)}</td>
                    <td>${money(x.a)}</td>
                    <td class="${cls(x.aa)}">
                      ${pct(x.aa)}
                    </td>
                    <td>${num(x.q)}</td>
                    <td class="${cls(x.qa)}">
                      ${pct(x.qa)}
                    </td>
                    <td>
                      ${
                        x.a - x.t >= 0
                          ? "+"
                          : ""
                      }${money(x.a - x.t)}
                    </td>
                  </tr>`
              )
              .join("")
          }
        </tbody>
      </table>
    </div>`;
}


/* =========================================================
   SHOP
   ========================================================= */

function renderShops(rows) {

  const by = {};

  rows.forEach(r => {

    const k = r.SHOP_NAME;

    if (!by[k]) {
      by[k] = {
        a: 0,
        t: 0,
        q: 0,
        tq: 0
      };
    }

    by[k].a +=
      +r.NET_AMOUNT || 0;

    by[k].t +=
      +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;

    by[k].q +=
      +r.QTY || 0;

    by[k].tq +=
      +r.TARGET_BOTTOMUP_QTY || 0;

  });

  const arr =
    Object.entries(by)
      .map(([k, v]) => ({
        k,
        ...v,
        aa: v.t ? v.a / v.t : 0,
        qa: v.tq ? v.q / v.tq : 0,
        asp: v.q ? v.a / v.q : 0
      }))
      .filter(x => x.a || x.t)
      .sort(
        (a, b) =>
          (b.a - b.t) -
          (a.a - a.t)
      );


  const show = [
    ...arr.slice(0, 10),
    ...arr.slice(-10)
  ].filter(
    (x, i, a) =>
      a.findIndex(
        y => y.k === x.k
      ) === i
  );


  $("shopTable").innerHTML =
    `<div class="tablewrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Shop</th>
            <th>Net Amount</th>
            <th>Amt Ach.</th>
            <th>Gap</th>
            <th>Volume</th>
            <th>Vol Ach.</th>
            <th>ASP</th>
          </tr>
        </thead>
        <tbody>
          ${
            show
              .map(
                x =>
                  `<tr>
                    <td>${esc(x.k)}</td>
                    <td>${money(x.a)}</td>
                    <td class="${cls(x.aa)}">
                      ${pct(x.aa)}
                    </td>
                    <td class="${
                      x.a - x.t >= 0
                        ? "good"
                        : "critical"
                    }">
                      ${
                        x.a - x.t >= 0
                          ? "+"
                          : ""
                      }${money(x.a - x.t)}
                    </td>
                    <td>${num(x.q)}</td>
                    <td class="${cls(x.qa)}">
                      ${pct(x.qa)}
                    </td>
                    <td>${nf.format(x.asp)}</td>
                  </tr>`
              )
              .join("")
          }
        </tbody>
      </table>
    </div>`;
}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  /*
    Rebuild dependent filters first
  */
  refreshDependent();

  /*
    KPI / Product / Area / Shop
    use selected MONTH
  */
  const rows = activeRows();

  updateKPIs(rows);

  renderTrend(rows);

  renderProduct(rows);

  renderArea(rows);

  renderShops(rows);
}


/* =========================================================
   EVENTS
   ========================================================= */

Object.keys(filters).forEach(id => {

  $(id).addEventListener(
    "change",
    render
  );

});


$("resetBtn").addEventListener(
  "click",
  () => {

    Object.keys(filters).forEach(
      id => $(id).value = ""
    );

    $("fYear").value = "2026";
    $("fMonth").value = "8";

    render();

  }
);


/* =========================================================
   START
   ========================================================= */

populate();

render();
