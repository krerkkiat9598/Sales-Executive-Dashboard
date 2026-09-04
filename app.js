const DATA = window.SALES_DATA || [];
const $ = id => document.getElementById(id);
const nf = new Intl.NumberFormat("en-US",{maximumFractionDigits:0});
const money = v => (v/1e6).toFixed(2)+" MB";
const pct = v => (v*100).toFixed(1)+"%";
const num = v => nf.format(Math.round(v||0));
const esc = s => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));


const PRODUCT_DEEP_LINKS = {
  "DEVICE":"product_deep_dive.html",
  "GIA":"product_deep_dive.html",
  "POSTPAID":"postpay_deep_dive.html",
  "TRUE ONLINE":"tol_deep_dive.html",
  "PREPAID":"prepaid_deep_dive.html",
  "TRUE VISION":"tvs_deep_dive.html"
};
const productLink = p => PRODUCT_DEEP_LINKS[String(p).trim()] || "bma1.html";

// SAFE DRILLDOWN: navigation only; KPI/filter calculations remain unchanged.
function bma1Url(){
  const p=new URLSearchParams();
  const map={fYear:"year",fMonth:"month",fChannel:"channel",fProduct:"product",fShop:"shop"};
  Object.entries(map).forEach(([id,key])=>{ const v=$(id)?.value; if(v) p.set(key,v); });
  return "bma1.html"+(p.toString()?"?"+p.toString():"");
}
function updateBma1Links(){ document.querySelectorAll("[data-bma1-link]").forEach(a=>a.href=bma1Url()); }

const filters = {
  fYear: r=>r.YEAR, fMonth:r=>r.MONTH, fRegion:r=>r.AREA_GROUP, fArea:r=>r.AREA,
  fChannel:r=>r.CHANNEL, fProduct:r=>r.PRODUCT, fShop:r=>r.SHOP_NAME
};
const labels={fYear:"All Years",fMonth:"All Months",fRegion:"All Regions",fArea:"All Areas",fChannel:"All Channels",fProduct:"All Products",fShop:"All Shops"};

function uniq(arr){return [...new Set(arr.filter(x=>x!=="" && x!==null && x!==undefined))]}
function setOptions(id, vals, allLabel){
  const el=$(id), current=el.value;
  el.innerHTML=`<option value="">${allLabel}</option>`+uniq(vals).sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true})).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
  if([...el.options].some(o=>o.value===current)) el.value=current;
}
function activeRows(){
  return DATA.filter(r=>Object.keys(filters).every(id=>{
    const v=$(id).value; return !v || String(filters[id](r))===v;
  }));
}
function aggregate(rows){
  return rows.reduce((a,r)=>{
    a.tq+=+r.TARGET_BOTTOMUP_QTY||0; a.ta+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;
    a.q+=+r.QTY||0; a.a+=+r.NET_AMOUNT||0; return a;
  },{tq:0,ta:0,q:0,a:0});
}
function status(ach){return ach>=1?"ACHIEVE":ach>=.95?"WATCH":ach>=.8?"RISK":"CRITICAL"}
function cls(ach){return ach>=1?"good":ach>=.95?"watch":ach>=.8?"risk":"critical"}

function refreshDependent(){
  // Preserve current selections, but rebuild only the dependent dropdowns.
  const selected = {};
  Object.keys(filters).forEach(id => selected[id] = $(id).value);

  let rows = DATA;
  if(selected.fYear) rows = rows.filter(r=>String(r.YEAR)===selected.fYear);
  setOptions("fMonth", rows.map(r=>r.MONTH), "All Months");

  rows = DATA;
  if(selected.fYear) rows = rows.filter(r=>String(r.YEAR)===selected.fYear);
  if(selected.fMonth) rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);
  setOptions("fRegion", rows.map(r=>r.AREA_GROUP), "All Regions");

  rows = DATA;
  if(selected.fYear) rows = rows.filter(r=>String(r.YEAR)===selected.fYear);
  if(selected.fMonth) rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);
  if(selected.fRegion) rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);
  setOptions("fArea", rows.map(r=>r.AREA), "All Areas");

  rows = DATA;
  if(selected.fYear) rows = rows.filter(r=>String(r.YEAR)===selected.fYear);
  if(selected.fMonth) rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);
  if(selected.fRegion) rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);
  if(selected.fArea) rows = rows.filter(r=>String(r.AREA)===selected.fArea);
  setOptions("fChannel", rows.map(r=>r.CHANNEL), "All Channels");

  // Product is a master dimension: every Channel must expose the full Product list.
  // Do NOT derive Product options from the currently filtered transaction rows;
  // a missing transaction in a selected Area/Month/Channel must not hide a Product.
  setOptions("fProduct", DATA.map(r=>r.PRODUCT), "All Products");

  rows = DATA;
  if(selected.fYear) rows = rows.filter(r=>String(r.YEAR)===selected.fYear);
  if(selected.fMonth) rows = rows.filter(r=>String(r.MONTH)===selected.fMonth);
  if(selected.fRegion) rows = rows.filter(r=>String(r.AREA_GROUP)===selected.fRegion);
  if(selected.fArea) rows = rows.filter(r=>String(r.AREA)===selected.fArea);
  if(selected.fChannel) rows = rows.filter(r=>String(r.CHANNEL)===selected.fChannel);
  if(selected.fProduct) rows = rows.filter(r=>String(r.PRODUCT)===selected.fProduct);
  setOptions("fShop", rows.map(r=>r.SHOP_NAME), "All Shops");

  // Restore selections when still valid.
  Object.keys(filters).forEach(id=>{
    if([...$(id).options].some(o=>o.value===selected[id])) $(id).value=selected[id];
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

  // Initial view = Company Overview, latest available month in 2026.
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
  const x=aggregate(rows), aa=x.ta?x.a/x.ta:0, qa=x.tq?x.q/x.tq:0, asp=x.q?x.a/x.q:0;
  $("kAmount").textContent=money(x.a); $("kAmountTarget").textContent=money(x.ta);
  $("kAmountAch").textContent=pct(aa); $("kAmountGap").textContent=(x.a-x.ta>=0?"+":"")+money(x.a-x.ta);
  $("kQty").textContent=num(x.q); $("kQtyTarget").textContent=num(x.tq);
  $("kQtyAch").textContent=pct(qa); $("kQtyGap").textContent=(x.q-x.tq>=0?"+":"")+num(x.q-x.tq);
  $("kAsp").textContent=x.q?nf.format(asp):"-";
  $("kStatus").textContent=status(aa); $("kStatus").className=cls(aa);
  $("kStatusNote").textContent=aa>=1?"Amount target achieved":`Gap ${pct(Math.abs(1-aa))} to target`;
  const scope=[];
  const names=[["fYear","Year"],["fMonth","Month"],["fRegion","Region"],["fArea","Area"],["fChannel","Channel"],["fProduct","Product"],["fShop","Shop"]];
  names.forEach(([id,l])=>{if($(id).value)scope.push(`${l}: ${$(id).value}`)});
  $("subtitle").textContent=(scope.length?scope.join(" • "):"Company Overview")+" • Net Amount + QTY Performance";
  const volumeMsg=qa<1?`Volume is below target by ${num(Math.abs(x.q-x.tq))} (${pct(qa)} achievement).`:`Volume is at ${pct(qa)} of target.`;
  const amountMsg=aa>=1?`Net Amount achieved ${pct(aa)} of target, with ${money(x.a-x.ta)} above target.`:`Net Amount is ${pct(aa)} of target, with a gap of ${money(Math.abs(x.a-x.ta))}.`;
  const driver=qa<aa?`ASP is ${nf.format(asp)} per unit, indicating value per unit is supporting the Net Amount result.`:`Volume is the stronger driver of Net Amount performance.`;
  $("insightText").textContent=`${amountMsg} ${volumeMsg} ${driver}`;
  $("keyMessage").textContent=`Amount status: ${status(aa)} (${pct(aa)}). Volume status: ${status(qa)} (${pct(qa)}).`;
  $("actionMessage").textContent=qa<aa?`Focus on volume recovery while protecting ASP; prioritize products/shops with the largest volume and Net Amount gaps.`:`Focus on sustaining volume while improving value per unit and mix.`;
}
function monthly(rows){
  const by={}; rows.forEach(r=>{const k=`${r.YEAR}-${String(r.MONTH).padStart(2,"0")}`;(by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;by[k].q+=+r.QTY||0;by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0});
  return Object.entries(by).sort().map(([k,v])=>({...v,k:k.slice(5)}));
}
function renderTrend(rows){
  const selectedMonth = $("fMonth").value;
  const d = monthly(rows).sort((a,b)=>Number(a.k)-Number(b.k));
  const months = d;
  const amountMax = Math.max(...months.flatMap(x=>[x.a,x.t]),1);
  const qtyMax = Math.max(...months.flatMap(x=>[x.q,x.tq]),1);
  const escNum = v => (v/1e6).toFixed(2);
  const selected = m => selectedMonth && String(Number(m))===String(Number(selectedMonth));
  const mkGrid = max => `<div class="exec-grid"><span></span><span></span><span></span><span></span></div><div class="exec-scale"><span>${max>=1e9?(max/1e9).toFixed(1)+'B':max>=1e6?(max/1e6).toFixed(1):max>=1e3?Math.round(max/1e3)+'K':Math.round(max)}</span><span>${max>=1e6?(max/2e6).toFixed(1):max>=1e3?Math.round(max/2e3)+'K':Math.round(max/2)}</span><span>${max>=1e6?(max/4e6).toFixed(1):max>=1e3?Math.round(max/4e3)+'K':Math.round(max/4)}</span><span>0</span></div>`;
  const amountBars = months.map(x=>`<div class="exec-col ${selected(x.k)?'selected':''}"><div class="exec-pair"><div class="exec-bar actual" style="height:${x.a/amountMax*100}%"><span class="exec-value">${escNum(x.a)}</span></div><div class="exec-bar target" style="height:${x.t/amountMax*100}%"><span class="exec-value">${escNum(x.t)}</span></div></div><div class="exec-month">${String(x.k).padStart(2,'0')}</div></div>`).join('');
  const qtyBars = months.map(x=>`<div class="exec-col qty ${selected(x.k)?'selected':''}"><div class="exec-pair"><div class="exec-bar qty" style="height:${x.q/qtyMax*100}%"><span class="exec-value">${num(x.q)}</span></div><div class="exec-bar target" style="height:${x.tq/qtyMax*100}%"><span class="exec-value">${num(x.tq)}</span></div></div><div class="exec-month">${String(x.k).padStart(2,'0')}</div></div>`).join('');
  const ytdA=months.reduce((s,x)=>s+x.a,0), ytdT=months.reduce((s,x)=>s+x.t,0), ytdQ=months.reduce((s,x)=>s+x.q,0), ytdTQ=months.reduce((s,x)=>s+x.tq,0);
  const bestA=months.reduce((b,x)=>x.a>b.a?x:b,months[0]||{a:0,k:'-'}) , lowA=months.reduce((b,x)=>x.a<b.a?x:b,months[0]||{a:0,k:'-'}) ;
  const bestQ=months.reduce((b,x)=>x.q>b.q?x:b,months[0]||{q:0,k:'-'}) , lowQ=months.reduce((b,x)=>x.q<b.q?x:b,months[0]||{q:0,k:'-'}) ;
  const amountGapPct=ytdT?((ytdA/ytdT)-1)*100:0, qtyGapPct=ytdTQ?((ytdQ/ytdTQ)-1)*100:0;
  const statHtml=(type)=>type==='amount'?`<div class="exec-stat"><div><div class="label">YTD (Jan – ${months.length?String(months[months.length-1].k).padStart(2,'0'):'-'})</div><div class="value">${money(ytdA)}</div></div><div><div class="sub">Target ${money(ytdT)}</div><div class="${amountGapPct<0?'neg':'pos'}">${amountGapPct>=0?'+':''}${amountGapPct.toFixed(1)}%</div></div></div><div class="exec-stat"><div><div class="label">Best Month</div><div class="value">${bestA.k==='-'?'-':String(bestA.k).padStart(2,'0')}</div></div><div><div class="sub">${money(bestA.a)}</div></div></div><div class="exec-stat"><div><div class="label">Lowest Month</div><div class="value">${lowA.k==='-'?'-':String(lowA.k).padStart(2,'0')}</div></div><div><div class="sub">${money(lowA.a)}</div></div></div>`:`<div class="exec-stat"><div><div class="label">YTD (Jan – ${months.length?String(months[months.length-1].k).padStart(2,'0'):'-'})</div><div class="value">${num(ytdQ)}</div></div><div><div class="sub">Target ${num(ytdTQ)}</div><div class="${qtyGapPct<0?'neg':'pos'}">${qtyGapPct>=0?'+':''}${qtyGapPct.toFixed(1)}%</div></div></div><div class="exec-stat"><div><div class="label">Best Month</div><div class="value">${bestQ.k==='-'?'-':String(bestQ.k).padStart(2,'0')}</div></div><div><div class="sub">${num(bestQ.q)}</div></div></div><div class="exec-stat"><div><div class="label">Lowest Month</div><div class="value">${lowQ.k==='-'?'-':String(lowQ.k).padStart(2,'0')}</div></div><div><div class="sub">${num(lowQ.q)}</div></div></div>`;
  $("trendChart").innerHTML=`<div class="exec-chart-wrap"><div class="exec-chart">${mkGrid(amountMax)}<div class="exec-bars">${amountBars}</div></div><div class="exec-legend"><span><i class="dot actual"></i>Actual</span><span><i class="dot target"></i>Target</span><span><i class="dot selected"></i>Selected Month</span><span>Unit: MB</span></div><div class="exec-insight">${statHtml('amount')}</div></div>`;
  $("volumeChart").innerHTML=`<div class="exec-chart-wrap"><div class="exec-chart">${mkGrid(qtyMax)}<div class="exec-bars">${qtyBars}</div></div><div class="exec-legend"><span><i class="dot qty"></i>Actual</span><span><i class="dot target"></i>Target</span><span><i class="dot selected"></i>Selected Month</span><span>Unit: Units</span></div><div class="exec-insight">${statHtml('qty')}</div></div>`;
}

function renderProduct(rows){
  const by={}; rows.forEach(r=>{const k=r.PRODUCT;(by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;by[k].q+=+r.QTY||0;by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0});
  const arr=Object.entries(by).map(([k,v])=>({k,...v,aa:v.t?v.a/v.t:0,qa:v.tq?v.q/v.tq:0,asp:v.q?v.a/v.q:0})).sort((a,b)=>b.a-a.a);
  $("productTable").innerHTML=`<div class="tablewrap"><table class="data-table"><thead><tr><th>Product</th><th>Net Amount</th><th>Amt Ach.</th><th>QTY</th><th>QTY Ach.</th><th>ASP</th></tr></thead><tbody>${arr.map(x=>`<tr><td><a href="${productLink(x.k)}" class="product-link">${esc(x.k)}</a></td><td>${money(x.a)}</td><td class="${cls(x.aa)}">${pct(x.aa)}</td><td>${num(x.q)}</td><td class="${cls(x.qa)}">${pct(x.qa)}</td><td>${nf.format(x.asp)}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderArea(rows){
  const by={}; rows.forEach(r=>{const k=r.AREA;(by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;by[k].q+=+r.QTY||0;by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0});
  const arr=Object.entries(by).map(([k,v])=>({k,...v,aa:v.t?v.a/v.t:0,qa:v.tq?v.q/v.tq:0})).sort((a,b)=>b.aa-a.aa);
  $("areaTable").innerHTML=`<div class="tablewrap"><table class="data-table"><thead><tr><th>Area</th><th>Net Amount</th><th>Amt Ach.</th><th>QTY</th><th>QTY Ach.</th><th>Gap</th></tr></thead><tbody>${arr.map(x=>{const areaCell=x.k==="BMA I (North West)"?`<a href="${bma1Url()}" class="area-link" style="text-decoration:none;color:inherit;font-weight:600;">${esc(x.k)}</a>`:esc(x.k);return `<tr><td>${areaCell}</td><td>${money(x.a)}</td><td class="${cls(x.aa)}">${pct(x.aa)}</td><td>${num(x.q)}</td><td class="${cls(x.qa)}">${pct(x.qa)}</td><td>${(x.a-x.t>=0?"+":"")}${money(x.a-x.t)}</td></tr>`}).join("")}</tbody></table></div>`;
}
function renderShops(rows){
  const by={}; rows.forEach(r=>{const k=r.SHOP_NAME;(by[k]??={a:0,t:0,q:0,tq:0}).a+=+r.NET_AMOUNT||0;by[k].t+=+r.TARGET_BOTTOMUP_NET_AMOUNT||0;by[k].q+=+r.QTY||0;by[k].tq+=+r.TARGET_BOTTOMUP_QTY||0});
  const arr=Object.entries(by).map(([k,v])=>({k,...v,aa:v.t?v.a/v.t:0,qa:v.tq?v.q/v.tq:0,asp:v.q?v.a/v.q:0})).filter(x=>x.a||x.t).sort((a,b)=>(b.a-b.t)-(a.a-a.t));
  const show=[...arr.slice(0,10),...arr.slice(-10)].filter((x,i,a)=>a.findIndex(y=>y.k===x.k)===i);
  $("shopTable").innerHTML=`<div class="tablewrap"><table class="data-table"><thead><tr><th>Shop</th><th>Net Amount</th><th>Amt Ach.</th><th>Gap</th><th>QTY</th><th>QTY Ach.</th><th>ASP</th></tr></thead><tbody>${show.map(x=>`<tr><td>${esc(x.k)}</td><td>${money(x.a)}</td><td class="${cls(x.aa)}">${pct(x.aa)}</td><td class="${x.a-x.t>=0?'good':'critical'}">${(x.a-x.t>=0?"+":"")+money(x.a-x.t)}</td><td>${num(x.q)}</td><td class="${cls(x.qa)}">${pct(x.qa)}</td><td>${nf.format(x.asp)}</td></tr>`).join("")}</tbody></table></div>`;
}
function trendRows(){
  // Monthly trend should keep all current dimensions except Month,
  // so selecting Aug-26 still shows Jan-Aug trend for the selected scope.
  const excluded="fMonth";
  return DATA.filter(r=>Object.keys(filters).every(id=>{
    if(id===excluded) return true;
    const v=$(id).value;
    return !v || String(filters[id](r))===v;
  }));
}
function render(){
  refreshDependent();
  updateBma1Links();
  const rows=activeRows();
  updateKPIs(rows);
  renderTrend(trendRows());
  renderProduct(rows);
  renderArea(rows);
  renderShops(rows);
}
Object.keys(filters).forEach(id=>$(id).addEventListener("change",render));
$("resetBtn").addEventListener("click",()=>{Object.keys(filters).forEach(id=>$(id).value=""); $("fYear").value="2026"; $("fMonth").value="8"; render();});
populate(); render();
