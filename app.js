const DATA = window.SALES_DATA || [];
const $ = id => document.getElementById(id);
const nf = new Intl.NumberFormat("en-US",{maximumFractionDigits:0});
const money = v => (v/1e6).toFixed(2)+" MB";
const pct = v => (v*100).toFixed(1)+"%";
const num = v => nf.format(Math.round(v||0));
const esc = s => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

const filters = {
  fYear: r=>r.YEAR, fMonth:r=>r.MONTH, fRegion:r=>r.AREA_GROUP, fArea:r=>r.AREA,
  fChannel:r=>r.CHANNEL, fProduct:r=>r.PRODUCT, fShop:r=>r.SHOP_NAME
};

const labels={
  fYear:"All Years",
  fMonth:"All Months",
  fRegion:"All Regions",
  fArea:"All Areas",
  fChannel:"All Channels",
  fProduct:"All Products",
  fShop:"All Shops"
};

/* Product -> Deep Dive page */
const PRODUCT_DEEP_LINKS = {
  "DEVICE":"product_deep_dive.html",
  "GIA":"product_deep_dive.html",
  "POSTPAID":"postpay_deep_dive.html",
  "TRUE ONLINE":"tol_deep_dive.html",
  "PREPAID":"prepaid_deep_dive.html",
  "TRUE VISION":"tvs_deep_dive.html"
};

function uniq(arr){
  return [...new Set(arr.filter(x=>x!=="" && x!==null && x!==undefined))]
}

function setOptions(id, vals, allLabel){
  const el=$(id), current=el.value;
  el.innerHTML=`<option value="">${allLabel}</option>`+
    uniq(vals)
      .sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}))
      .map(v=>`<option value="${esc(v)}">${esc(v)}</option>`)
      .join("");

  if([...el.options].some(o=>o.value===current)) el.value=current;
}

function activeRows(){
  return DATA.filter(r=>Object.keys(filters).every(id=>{
    const v=$(id).value;
    return !v || String(filters[id](r))===v;
  }));
}

function aggregate(rows){
  return rows.reduce((a,r)=>{
    a.tq+=+r.TARGET_BOTTOMUP_QTY||0;
    a.ta+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;
    a.q+=+r.QTY||0;
    a.a+=+r.NET_AMOUNT||0;
    return a;
  },{tq:0,ta:0,q:0,a:0});
}

function status(ach){
  return ach>=1?"ACHIEVE":ach>=.95?"WATCH":ach>=.8?"RISK":"CRITICAL";
}

function cls(ach){
  return ach>=1?"good":ach>=.95?"watch":ach>=.8?"risk":"critical";
}

function refreshDependent(){

  const selected = {};
  Object.keys(filters).forEach(id => selected[id] = $(id).value);

  let rows = DATA;

  if(selected.fYear)
    rows = rows.filter(r=>String(r.YEAR)===selected.fYear);

  setOptions("fMonth", rows.map(r=>r.MONTH), "All Months");

  rows = DATA;

  if(selected.fYear)
    rows = rows.filter(r=>String(r.YEAR)===selected.fYear);

  if(selected.fMonth)
    rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);

  setOptions("fRegion", rows.map(r=>r.AREA_GROUP), "All Regions");

  rows = DATA;

  if(selected.fYear)
    rows = rows.filter(r=>String(r.YEAR)===selected.fYear);

  if(selected.fMonth)
    rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);

  if(selected.fRegion)
    rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);

  setOptions("fArea", rows.map(r=>r.AREA), "All Areas");

  rows = DATA;

  if(selected.fYear)
    rows = rows.filter(r=>String(r.YEAR)===selected.fYear);

  if(selected.fMonth)
    rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);

  if(selected.fRegion)
    rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);

  if(selected.fArea)
    rows = rows.filter(r=>String(r.AREA)===selected.fArea);

  setOptions("fChannel", rows.map(r=>r.CHANNEL), "All Channels");

  rows = DATA;

  if(selected.fYear)
    rows = rows.filter(r=>String(r.YEAR)===selected.fYear);

  if(selected.fMonth)
    rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);

  if(selected.fRegion)
    rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);

  if(selected.fArea)
    rows = rows.filter(r=>String(r.AREA)===selected.fArea);

  if(selected.fChannel)
    rows = rows.filter(r=>String(r.CHANNEL)===selected.fChannel);

  setOptions("fProduct", rows.map(r=>r.PRODUCT), "All Products");

  rows = DATA;

  if(selected.fYear)
    rows = rows.filter(r=>String(r.YEAR)===selected.fYear);

  if(selected.fMonth)
    rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);

  if(selected.fRegion)
    rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);

  if(selected.fArea)
    rows = rows.filter(r=>String(r.AREA)===selected.fArea);

  if(selected.fChannel)
    rows = rows.filter(r=>String(r.CHANNEL)===selected.fChannel);

  if(selected.fProduct)
    rows = rows.filter(r=>String(r.PRODUCT)===selected.fProduct);

  setOptions("fShop", rows.map(r=>r.SHOP_NAME), "All Shops");

  Object.keys(filters).forEach(id=>{
    if([...$(id).options].some(o=>o.value===selected[id]))
      $(id).value=selected[id];
  });
}

function populate(){

  setOptions("fYear",DATA.map(r=>r.YEAR),"All Years");
  setOptions("fMonth",DATA.map(r=>r.MONTH),"All Months");
  setOptions("fRegion",DATA.map(r=>r.AREA_GROUP),"All Regions");
  setOptions("fArea",DATA.map(r=>r.AREA),"All Areas");
  setOptions("fChannel",DATA.map(r=>r.CHANNEL),"All Channels");
  setOptions("fProduct",DATA.map(r=>r.PRODUCT),"All Products");
  setOptions("fShop",DATA.map(r=>r.SHOP_NAME),"All Shops");

  $("fYear").value="2026";
  $("fMonth").value="8";
  $("fRegion").value="";
  $("fArea").value="";
  $("fChannel").value="";
  $("fProduct").value="";
  $("fShop").value="";

  refreshDependent();
}

function updateKPIs(rows){

  const x=aggregate(rows);
  const aa=x.ta?x.a/x.ta:0;
  const qa=x.tq?x.q/x.tq:0;
  const asp=x.q?x.a/x.q:0;

  $("kAmount").textContent=money(x.a);
  $("kAmountTarget").textContent=money(x.ta);

  $("kAmountAch").textContent=pct(aa);
  $("kAmountGap").textContent=(x.a-x.ta>=0?"+":"")+money(x.a-x.ta);

  $("kQty").textContent=num(x.q);
  $("kQtyTarget").textContent=num(x.tq);

  $("kQtyAch").textContent=pct(qa);
  $("kQtyGap").textContent=(x.q-x.tq>=0?"+":"")+num(x.q-x.tq);

  $("kAsp").textContent=x.q?nf.format(asp):"-";

  $("kStatus").textContent=status(aa);
  $("kStatus").className=cls(aa);

  $("kStatusNote").textContent=
    aa>=1
      ?"Amount target achieved"
      :`Gap ${pct(Math.abs(1-aa))} to target`;

  const scope=[];

  const names=[
    ["fYear","Year"],
    ["fMonth","Month"],
    ["fRegion","Region"],
    ["fArea","Area"],
    ["fChannel","Channel"],
    ["fProduct","Product"],
    ["fShop","Shop"]
  ];

  names.forEach(([id,l])=>{
    if($(id).value)
      scope.push(`${l}: ${$(id).value}`);
  });

  $("subtitle").textContent=
    (scope.length?scope.join(" • "):"Company Overview")+
    " • Net Amount + QTY Performance";

  const qtyMsg=
    qa<1
      ?`QTY is below target by ${num(Math.abs(x.q-x.tq))} (${pct(qa)} achievement).`
      :`QTY is at ${pct(qa)} of target.`;

  const amountMsg=
    aa>=1
      ?`Net Amount achieved ${pct(aa)} of target, with ${money(x.a-x.ta)} above target.`
      :`Net Amount is ${pct(aa)} of target, with a gap of ${money(Math.abs(x.a-x.ta))}.`;

  const driver=
    qa<aa
      ?`ASP is ${nf.format(asp)} per unit, indicating value per unit is supporting the Net Amount result.`
      :`QTY is the stronger driver of Net Amount performance.`;

  $("insightText").textContent=
    `${amountMsg} ${qtyMsg} ${driver}`;

  $("keyMessage").textContent=
    `Amount status: ${status(aa)} (${pct(aa)}). QTY status: ${status(qa)} (${pct(qa)}).`;

  $("actionMessage").textContent=
    qa<aa
      ?`Focus on QTY recovery while protecting ASP; prioritize products/shops with the largest QTY and Net Amount gaps.`
      :`Focus on sustaining QTY while improving value per unit and mix.`;
}

function monthly(rows){

  const by={};

  rows.forEach(r=>{
    const k=`${r.YEAR}-${String(r.MONTH).padStart(2,"0")}`;

    (by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;
    by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;
    by[k].q+=+r.QTY||0;
    by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0;
  });

  return Object.entries(by)
    .sort()
    .map(([k,v])=>({...v,k:k.slice(5)}));
}

function renderTrend(rows){
  const selectedMonth = $("fMonth").value;

  const by = {};
  rows.forEach(r=>{
    const k = `${r.YEAR}-${String(r.MONTH).padStart(2,"0")}`;

    if(!by[k]){
      by[k] = {a:0,t:0,q:0,tq:0};
    }

    by[k].a += +r.NET_AMOUNT || 0;
    by[k].t += +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;
    by[k].q += +r.QTY || 0;
    by[k].tq += +r.TARGET_BOTTOMUP_QTY || 0;
  });

  const data = Object.entries(by)
    .sort()
    .map(([k,v])=>({
      month:k.slice(5),
      ...v
    }));

  if(!data.length){
    $("trendChart").innerHTML = "";
    $("volumeChart").innerHTML = "";
    return;
  }

  function buildChart(containerId, config){

    const W = 760;
    const H = 300;

    const left = 55;
    const right = 25;
    const top = 38;
    const bottom = 58;

    const chartW = W-left-right;
    const chartH = H-top-bottom;

    const max = Math.max(
      ...data.map(x=>x[config.actualKey]),
      ...data.map(x=>x[config.targetKey]),
      1
    );

    const gap = chartW / data.length;
    const barW = Math.min(42,gap*0.55);

    const y = v => top + chartH - (v/max)*chartH;

    const selectedIndex =
      data.findIndex(x=>String(x.month)===String(selectedMonth).padStart(2,"0"));

    const bars = data.map((x,i)=>{

      const cx = left + gap*i + gap/2;
      const barX = cx-barW/2;

      const actualY = y(x[config.actualKey]);
      const actualH = top+chartH-actualY;

      const selected = i===selectedIndex;

      return `
        ${selected ? `
          <rect
            x="${cx-gap/2}"
            y="${top-12}"
            width="${gap}"
            height="${chartH+30}"
            rx="10"
            fill="#eaf4ff"/>
        ` : ""}

        <rect
          x="${barX}"
          y="${actualY}"
          width="${barW}"
          height="${actualH}"
          rx="5"
          fill="${selected ? "#1479c9" : "#9fc4ea"}"
        />

        <text
          x="${cx}"
          y="${actualY-9}"
          text-anchor="middle"
          font-size="11"
          font-weight="600"
          fill="#24496b">
          ${config.numberFormat(x[config.actualKey])}
        </text>

        <text
          x="${cx}"
          y="${H-27}"
          text-anchor="middle"
          font-size="11"
          fill="${selected ? "#1479c9" : "#60758b"}"
          font-weight="${selected ? "700" : "400"}">
          ${x.month}
        </text>
      `;
    }).join("");

    const targetPoints = data.map((x,i)=>{

      const cx = left + gap*i + gap/2;
      const cy = y(x[config.targetKey]);

      return `${cx},${cy}`;
    }).join(" ");

    const targetDots = data.map((x,i)=>{

      const cx = left + gap*i + gap/2;
      const cy = y(x[config.targetKey]);

      return `
        <circle
          cx="${cx}"
          cy="${cy}"
          r="4"
          fill="#ffffff"
          stroke="#6d8297"
          stroke-width="2"/>
      `;
    }).join("");

    $(""+containerId).innerHTML = `

      <div style="
        width:100%;
        overflow:hidden;
        background:#ffffff;
        border-radius:12px;
      ">

        <svg
          viewBox="0 0 ${W} ${H}"
          width="100%"
          height="300"
          preserveAspectRatio="xMidYMid meet">

          <!-- Grid -->
          <line
            x1="${left}"
            y1="${top+chartH}"
            x2="${W-right}"
            y2="${top+chartH}"
            stroke="#d9e3ec"/>

          <line
            x1="${left}"
            y1="${top+chartH*0.66}"
            x2="${W-right}"
            y2="${top+chartH*0.66}"
            stroke="#edf2f6"/>

          <line
            x1="${left}"
            y1="${top+chartH*0.33}"
            x2="${W-right}"
            y2="${top+chartH*0.33}"
            stroke="#edf2f6"/>

          <line
            x1="${left}"
            y1="${top}"
            x2="${W-right}"
            y2="${top}"
            stroke="#edf2f6"/>

          <!-- Chart title -->
          <text
            x="${left}"
            y="20"
            font-size="13"
            font-weight="700"
            fill="#1e4568">
            ${config.title}
          </text>

          <!-- Actual bars -->
          ${bars}

          <!-- Target line -->
          <polyline
            points="${targetPoints}"
            fill="none"
            stroke="#6d8297"
            stroke-width="2"
            stroke-dasharray="7 5"/>

          ${targetDots}

          <!-- Legend -->
          <rect
            x="${left}"
            y="${H-14}"
            width="11"
            height="11"
            rx="2"
            fill="#9fc4ea"/>

          <text
            x="${left+17}"
            y="${H-5}"
            font-size="10"
            fill="#60758b">
            ${config.actualLabel}
          </text>

          <line
            x1="${left+105}"
            y1="${H-9}"
            x2="${left+123}"
            y2="${H-9}"
            stroke="#6d8297"
            stroke-width="2"
            stroke-dasharray="5 4"/>

          <text
            x="${left+130}"
            y="${H-5}"
            font-size="10"
            fill="#60758b">
            ${config.targetLabel}
          </text>

          ${selectedIndex>=0 ? `
            <rect
              x="${left+230}"
              y="${H-14}"
              width="11"
              height="11"
              rx="2"
              fill="#1479c9"/>

            <text
              x="${left+247}"
              y="${H-5}"
              font-size="10"
              fill="#60758b">
              Selected: ${data[selectedIndex].month}
            </text>
          ` : ""}

        </svg>

      </div>

      <div style="
        margin:4px 14px 14px;
        padding:14px 18px;
        background:#eef6ff;
        border-left:4px solid #1479c9;
        border-radius:10px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
      ">

        <div>
          <div style="
            font-size:11px;
            font-weight:800;
            letter-spacing:.8px;
            color:#1479c9;
            margin-bottom:4px;">
            ${config.insightTitle}
          </div>

          <div style="
            font-size:14px;
            font-weight:700;
            color:#24496b;">
            ${config.insightText}
          </div>

          <div style="
            font-size:11px;
            color:#60758b;
            margin-top:3px;">
            Achievement ${config.achievement}
          </div>
        </div>

        <div style="
          padding:9px 14px;
          border-radius:10px;
          background:#fff0f0;
          color:#df4b4b;
          font-size:13px;
          font-weight:800;
          white-space:nowrap;">
          ▼ ${config.achievement}
        </div>

      </div>
    `;
  }

  const selectedData =
    data.find(x=>String(x.month)===String(selectedMonth).padStart(2,"0"))
    || data[data.length-1];

  const amountAchievement =
    selectedData.t
      ? selectedData.a / selectedData.t
      : 0;

  const qtyAchievement =
    selectedData.tq
      ? selectedData.q / selectedData.tq
      : 0;

  buildChart("trendChart",{
    actualKey:"a",
    targetKey:"t",
    title:"NET AMOUNT",
    actualLabel:"Actual",
    targetLabel:"Target",
    numberFormat:v=>(v/1000000).toFixed(2)+" MB",
    insightTitle:"MONTHLY INSIGHT",
    insightText:
      `Net Amount ${money(selectedData.a)} ต่ำกว่า Target ${money(Math.abs(selectedData.a-selectedData.t))}`,
    achievement:pct(amountAchievement)
  });

  buildChart("volumeChart",{
    actualKey:"q",
    targetKey:"tq",
    title:"QTY",
    actualLabel:"Actual QTY",
    targetLabel:"Target QTY",
    numberFormat:v=>nf.format(Math.round(v)),
    insightTitle:"QTY INSIGHT",
    insightText:
      `QTY ${num(selectedData.q)} ต่ำกว่า Target ${num(Math.abs(selectedData.q-selectedData.tq))}`,
    achievement:pct(qtyAchievement)
  });
}

function renderProduct(rows){

  const by={};

  rows.forEach(r=>{
    const k=r.PRODUCT;

    (by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;
    by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;
    by[k].q+=+r.QTY||0;
    by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0;
  });

  const arr=Object.entries(by)
    .map(([k,v])=>({
      k,
      ...v,
      aa:v.t?v.a/v.t:0,
      qa:v.tq?v.q/v.tq:0,
      asp:v.q?v.a/v.q:0
    }))
    .sort((a,b)=>b.a-a.a);

  $("productTable").innerHTML=
    `<div class="tablewrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Net Amount</th>
            <th>Amt Ach.</th>
            <th>QTY</th>
            <th>QTY Ach.</th>
            <th>ASP</th>
          </tr>
        </thead>
        <tbody>
          ${arr.map(x=>{

            const page=PRODUCT_DEEP_LINKS[String(x.k).toUpperCase()];

            const productCell=page
              ?`<a href="${page}" class="product-link">${esc(x.k)}</a>`
              :esc(x.k);

            return `<tr>
              <td>${productCell}</td>
              <td>${money(x.a)}</td>
              <td class="${cls(x.aa)}">${pct(x.aa)}</td>
              <td>${num(x.q)}</td>
              <td class="${cls(x.qa)}">${pct(x.qa)}</td>
              <td>${nf.format(x.asp)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderArea(rows){

  const by={};

  rows.forEach(r=>{
    const k=r.AREA;

    (by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;
    by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;
    by[k].q+=+r.QTY||0;
    by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0;
  });

  const arr=Object.entries(by)
    .map(([k,v])=>({
      k,
      ...v,
      aa:v.t?v.a/v.t:0,
      qa:v.tq?v.q/v.tq:0
    }))
    .sort((a,b)=>b.aa-a.aa);

  $("areaTable").innerHTML=
    `<div class="tablewrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Area</th>
            <th>Net Amount</th>
            <th>Amt Ach.</th>
            <th>QTY</th>
            <th>QTY Ach.</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          ${arr.map(x=>
            `<tr>
              <td>${esc(x.k)}</td>
              <td>${money(x.a)}</td>
              <td class="${cls(x.aa)}">${pct(x.aa)}</td>
              <td>${num(x.q)}</td>
              <td class="${cls(x.qa)}">${pct(x.qa)}</td>
              <td>${(x.a-x.t>=0?"+":"")+money(x.a-x.t)}</td>
            </tr>`
          ).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderShops(rows){

  const by={};

  rows.forEach(r=>{
    const k=r.SHOP_NAME;

    (by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;
    by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;
    by[k].q+=+r.QTY||0;
    by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0;
  });

  const arr=Object.entries(by)
    .map(([k,v])=>({
      k,
      ...v,
      aa:v.t?v.a/v.t:0,
      qa:v.tq?v.q/v.tq:0,
      asp:v.q?v.a/v.q:0
    }))
    .filter(x=>x.a||x.t)
    .sort((a,b)=>(b.a-b.t)-(a.a-a.t));

  const show=[
    ...arr.slice(0,10),
    ...arr.slice(-10)
  ].filter((x,i,a)=>
    a.findIndex(y=>y.k===x.k)===i
  );

  $("shopTable").innerHTML=
    `<div class="tablewrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Shop</th>
            <th>Net Amount</th>
            <th>Amt Ach.</th>
            <th>Gap</th>
            <th>QTY</th>
            <th>QTY Ach.</th>
            <th>ASP</th>
          </tr>
        </thead>
        <tbody>
          ${show.map(x=>
            `<tr>
              <td>${esc(x.k)}</td>
              <td>${money(x.a)}</td>
              <td class="${cls(x.aa)}">${pct(x.aa)}</td>
              <td class="${x.a-x.t>=0?'good':'critical'}">
                ${(x.a-x.t>=0?"+":"")+money(x.a-x.t)}
              </td>
              <td>${num(x.q)}</td>
              <td class="${cls(x.qa)}">${pct(x.qa)}</td>
              <td>${nf.format(x.asp)}</td>
            </tr>`
          ).join("")}
        </tbody>
      </table>
    </div>`;
}

function trendRows(){

  const excluded="fMonth";

  return DATA.filter(r=>
    Object.keys(filters).every(id=>{
      if(id===excluded) return true;

      const v=$(id).value;

      return !v || String(filters[id](r))===v;
    })
  );
}
/* =========================================================
   EXECUTIVE TREND CHART — Actual vs Target
   ========================================================= */

function renderTrend(rows){

  const selectedMonth = $("fMonth").value;

  /* ---------- Monthly aggregation ---------- */
  const by = {};

  rows.forEach(r=>{
    const k = `${r.YEAR}-${String(r.MONTH).padStart(2,"0")}`;

    if(!by[k]){
      by[k] = {
        a:0,
        t:0,
        q:0,
        tq:0
      };
    }

    by[k].a  += +r.NET_AMOUNT || 0;
    by[k].t  += +r.TARGET_BOTTOMUP_NET_AMOUNT || 0;
    by[k].q  += +r.QTY || 0;
    by[k].tq += +r.TARGET_BOTTOMUP_QTY || 0;
  });

  const data = Object.entries(by)
    .sort()
    .map(([k,v])=>({
      month:k.slice(5),
      ...v
    }));

  if(!data.length){
    $("trendChart").innerHTML = "<div style='padding:30px;text-align:center'>No data</div>";
    $("volumeChart").innerHTML = "<div style='padding:30px;text-align:center'>No data</div>";
    return;
  }

  /* ---------- Shared chart renderer ---------- */

  function buildChart(containerId, config){

    const {
      actualKey,
      targetKey,
      title,
      actualLabel,
      targetLabel,
      numberFormat,
      insightTitle
    } = config;

    const values = data.map(d=>+d[actualKey]||0);
    const targets = data.map(d=>+d[targetKey]||0);

    const maxValue = Math.max(
      ...values,
      ...targets,
      1
    );

    const selectedIndex = data.findIndex(
      d=>String(d.month) === String(selectedMonth)
    );

    /* ---------- SVG target line ---------- */

    const W = 1000;
    const H = 280;

    const left = 55;
    const right = 25;
    const top = 20;
    const bottom = 45;

    const chartW = W-left-right;
    const chartH = H-top-bottom;

    const step = chartW / Math.max(data.length,1);

    const points = targets.map((v,i)=>{

      const x = left + step*i + step/2;
      const y = top + chartH - (v/maxValue)*chartH;

      return `${x},${y}`;
    }).join(" ");

    /* ---------- Bars ---------- */

    const bars = data.map((d,i)=>{

      const value = +d[actualKey]||0;

      const height = (value/maxValue)*chartH;

      const x = left + step*i + step*0.18;

      const width = step*0.64;

      const y = top + chartH-height;

      const selected =
        i === selectedIndex;

      return `
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="${Math.max(height,1)}"
          rx="5"
          fill="${selected ? "#0066CC" : "#8DB8E8"}"
          opacity="${selected ? "1" : "0.82"}"
        />

        <text
          x="${x + width/2}"
          y="${Math.max(y-7,12)}"
          text-anchor="middle"
          font-size="13"
          font-weight="700"
          fill="#183B5B"
        >
          ${numberFormat(value)}
        </text>

        <text
          x="${x + width/2}"
          y="${H-17}"
          text-anchor="middle"
          font-size="12"
          font-weight="${selected ? "800" : "500"}"
          fill="${selected ? "#0066CC" : "#667788"}"
        >
          ${d.month}
        </text>
      `;
    }).join("");

    /* ---------- Selected month highlight ---------- */

    let highlight = "";

    if(selectedIndex >= 0){

      const x =
        left +
        step*selectedIndex;

      highlight = `
        <rect
          x="${x}"
          y="${top}"
          width="${step}"
          height="${chartH}"
          fill="#EAF4FF"
          opacity="0.75"
        />
      `;
    }

    /* ---------- Target dots ---------- */

    const dots = targets.map((v,i)=>{

      const x = left + step*i + step/2;
      const y = top + chartH - (v/maxValue)*chartH;

      return `
        <circle
          cx="${x}"
          cy="${y}"
          r="4"
          fill="#64748B"
        />
      `;
    }).join("");

    /* ---------- SVG ---------- */

    const svg = `
      <svg
        viewBox="0 0 ${W} ${H}"
        width="100%"
        height="280"
        preserveAspectRatio="none"
      >

        ${highlight}

        <!-- Target line -->
        <polyline
          points="${points}"
          fill="none"
          stroke="#64748B"
          stroke-width="3"
          stroke-dasharray="8 6"
        />

        ${bars}

        ${dots}

      </svg>
    `;

    /* ---------- Insight ---------- */

    const current =
      selectedIndex >= 0
        ? data[selectedIndex]
        : data[data.length-1];

    const actual = +current[actualKey]||0;
    const target = +current[targetKey]||0;

    const gap = actual-target;

    const achievement =
      target ? actual/target : 0;

    const achievementText =
      (achievement*100).toFixed(1)+"%";

    const gapText =
      numberFormat(Math.abs(gap));

    const direction =
      gap >= 0 ? "สูงกว่า" : "ต่ำกว่า";

    const insight = `
      <div
        style="
          margin-top:10px;
          padding:14px 18px;
          border-radius:12px;
          background:#F1F7FD;
          border-left:5px solid #0066CC;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
        "
      >

        <div>

          <div
            style="
              font-size:11px;
              font-weight:800;
              letter-spacing:.8px;
              color:#0066CC;
              margin-bottom:5px;
            "
          >
            ${insightTitle}
          </div>

          <div
            style="
              font-size:14px;
              font-weight:700;
              color:#183B5B;
            "
          >
            ${title} ${numberFormat(actual)}
            ${direction} Target ${gapText}
          </div>

          <div
            style="
              font-size:12px;
              color:#64748B;
              margin-top:3px;
            "
          >
            Achievement ${achievementText}
          </div>

        </div>

        <div
          style="
            padding:8px 13px;
            border-radius:10px;
            background:${gap>=0 ? "#E8F7EF" : "#FFF0F0"};
            color:${gap>=0 ? "#15936B" : "#D64545"};
            font-size:13px;
            font-weight:800;
            white-space:nowrap;
          "
        >
          ${gap>=0 ? "▲" : "▼"} ${achievementText}
        </div>

      </div>
    `;

    $(containerId).innerHTML = `

      <div
        style="
          background:#FFFFFF;
          border-radius:12px;
          padding:8px 8px 0 8px;
        "
      >

        <div
          style="
            display:flex;
            justify-content:flex-end;
            align-items:center;
            gap:18px;
            padding:0 12px 4px;
            font-size:11px;
            color:#64748B;
          "
        >

          <span>
            <span
              style="
                display:inline-block;
                width:10px;
                height:10px;
                border-radius:2px;
                background:#0066CC;
                margin-right:5px;
              "
            ></span>
            ${actualLabel}
          </span>

          <span>
            <span
              style="
                display:inline-block;
                width:22px;
                border-top:2px dashed #64748B;
                margin-right:5px;
                vertical-align:middle;
              "
            ></span>
            ${targetLabel}
          </span>

          ${
            selectedMonth
              ? `<span style="font-weight:700;color:#0066CC">
                   Selected: ${selectedMonth}
                 </span>`
              : ""
          }

        </div>

        ${svg}

        ${insight}

      </div>
    `;
  }


  /* =========================================================
     1. MONTHLY NET AMOUNT
     ========================================================= */

  buildChart("trendChart",{

    actualKey:"a",
    targetKey:"t",

    title:"Net Amount",

    actualLabel:"Actual",
    targetLabel:"Target",

    numberFormat:v=>{
      return (v/1000000).toFixed(2)+" MB";
    },

    insightTitle:"MONTHLY INSIGHT"
  });


  /* =========================================================
     2. MONTHLY QTY
     ========================================================= */

  buildChart("volumeChart",{

    actualKey:"q",
    targetKey:"tq",

    title:"QTY",

    actualLabel:"Actual QTY",
    targetLabel:"Target QTY",

    numberFormat:v=>{
      return nf.format(Math.round(v));
    },

    insightTitle:"QTY INSIGHT"
  });

}
function render(){

  refreshDependent();

  const rows=activeRows();

  updateKPIs(rows);
  renderTrend(trendRows());
  renderProduct(rows);
  renderArea(rows);
  renderShops(rows);
}

Object.keys(filters).forEach(id=>
  $(id).addEventListener("change",render)
);

$("resetBtn").addEventListener("click",()=>{
  Object.keys(filters).forEach(id=>$(id).value="");

  $("fYear").value="2026";
  $("fMonth").value="8";

  render();
});

populate();
render();
