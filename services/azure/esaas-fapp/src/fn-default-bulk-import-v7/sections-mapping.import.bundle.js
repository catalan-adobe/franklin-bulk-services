// Adobe Corp. internal project "webpage-blueprint-detector" - Author: catalan@adobe.com
(()=>{{let o=i=>{typeof i[0]=="string"&&!i[0].startsWith("[detect]")&&(i[0]=`[detect] ${i[0]}`)},e=console.log;console.log=(...i)=>{o(i),e(...i)},console.debug=(...i)=>{window.DEBUG&&(o(i),e(...i))};let n=console.warn;console.warn=(...i)=>{o(i),n(...i)};let t=console.error;console.error=(...i)=>{o(i),t(...i)}}function T(o){return o.toString(16)}function D(o,e,n,t){return T(o)+T(e)+T(n)+T(t)}var S=class o{constructor({r:e,g:n,b:t,a:i=1,name:l=""}){this.name=l,this.r=e,this.g=n,this.b=t,this.a=i}toHex(){return D(this.r,this.g,this.b,this.a)}static fromRGBA(e){let n=e.replace("rgba(","").replace(")","").split(",").map(t=>parseInt(t.trim()));return new o({r:n[0],g:n[1],b:n[2],a:n[3]})}toRGBA(){return`rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`}withAlpha(e){return new o({...this,a:e})}static random(e=!1){let n=Math.round(Math.random()*255),t=Math.round(Math.random()*255),i=Math.round(Math.random()*255),l=e?Math.random():1;return new o({name:`rand-${n}-${t}-${i}-${l}`,r:n,g:t,b:i,a:l})}static fromHex(e){let n=parseInt(e.substring(0,2),16),t=parseInt(e.substring(2,4),16),i=parseInt(e.substring(4,6),16),l=parseInt(e.substring(6,8),16);return new o({name:`hex-${n}-${t}-${i}-${l}`,r:n,g:t,b:i,a:l})}};function O(o,e){let n=Math.max(0,Math.min(o.x+o.width,e.x+e.width)-Math.max(o.x,e.x)),t=Math.max(0,Math.min(o.y+o.height,e.y+e.height)-Math.max(o.y,e.y)),i=n*t,l=e.width*e.height;return i/l*100}function M(o,e){let n=o.getBoundingClientRect();return{left:n.left+e.document.scrollingElement.scrollLeft,top:n.top+e.document.scrollingElement.scrollTop}}var x=class o{constructor(e,n,t,i,l){this.id=crypto.randomUUID(),this.x=Math.floor(e),this.y=Math.floor(n),this.width=Math.floor(t),this.height=Math.floor(i),this.div=l,this.children=[],this.prediction=null,this.layout=null}static fromDiv(e,n){let t=e.getBoundingClientRect(),i=M(e,n);return new o(i.left,i.top,t.width,t.height,e)}static areBoxesLaidOutAsGrid(e){console.log("areBoxesLaidOutAsGrid");try{if(e.length<2)return!1;let n=e.slice().sort((a,c)=>a.x-c.x||a.y-c.y),t=e.slice().sort((a,c)=>a.y-c.y||a.x-c.x);console.log(n),console.log(t);let i=[];for(let a=1;a<n.length;a++)i.push(n[a].x-n[a-1].x);if([...new Set(i)].length>1)return!1;let s=[];for(let a=1;a<t.length;a++)s.push(t[a].y-t[a-1].y);return!([...new Set(s)].length>1)}finally{return!0}}contains(e,n=!0){return n?e.x-e.width>=this.x-this.width&&e.x+e.width<=this.x+this.width&&e.y-e.height>=this.y-this.height&&e.y+e.height<=this.y+this.height:O(this,e)>75}intersects(e){return!(e.x-e.width>this.x+this.width||e.x+e.width<this.x-this.width||e.y-e.height>this.y+this.height||e.y+e.height<this.y-this.height)}isInside(e){return e.x-e.width<=this.x-this.width&&e.x+e.width>=this.x+this.width&&e.y-e.height<=this.y-this.height&&e.y+e.height>=this.y+this.height}addChild(e){this.children.push(e)}isChild(e){return this.children.some(this.isChild)}determineLayout(){if(this.layout={numCols:P(this.children),numRows:q(this.children)},this.layout.numCols>1){let e=[],n=this.children.slice().sort((t,i)=>t.y-i.y);for(let t=0;t<this.layout.numRows;t++){let i=n.slice(t*this.layout.numCols,(t+1)*this.layout.numCols);e.push(...i.slice().sort((l,s)=>l.x-s.x))}this.children=e}return this.layout}toJSONString(){function e(t){return{id:t.id,x:t.x,y:t.y,width:t.width,height:t.height,layout:t.layout,prediction:t.prediction,template:t.template,xpath:t.xpath,xpathWithDetails:t.xpathWithDetails,children:t.children.map(e)}}let n=e(this);return console.log(n),n}};function P(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.x-t.x).forEach(n=>{let t=n.x,i=n.x+n.width,l=e[e.length-1];l?t>=l-5&&e.push(i):e.push(i)}),e.length}function q(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.y-t.y).forEach(n=>{let t=n.y,i=n.y+n.height,l=e[e.length-1];l?t>=l-5&&e.push(i):e.push(i)}),e.length}var p=class o{static getXPath(e,n,t=!1){for(var i=n.getElementsByTagName("*"),l=[];e&&e.nodeType==1;e=e.parentNode)if(t)if(e.hasAttribute("id")){for(var s=0,r=0;r<i.length&&(i[r].hasAttribute("id")&&i[r].id==e.id&&s++,!(s>1));r++);if(s==1)return l.unshift('id("'+e.getAttribute("id")+'")'),l.join("/");l.unshift(e.localName.toLowerCase()+'[@id="'+e.getAttribute("id")+'"]')}else e.hasAttribute("class")&&l.unshift(e.localName.toLowerCase()+'[@class="'+[...e.classList].join(" ").trim()+'"]');else{for(var a=1,c=e.previousSibling;c;c=c.previousSibling)c.localName==e.localName&&(a+=1);l.unshift(e.localName.toLowerCase()+"["+a+"]")}return l.length?"/"+l.join("/"):null}static isVisible(e,n){if(!e)return!1;if(e.nodeType===n.Node.DOCUMENT_NODE)return!0;if(e.nodeType===n.Node.ELEMENT_NODE){let t=n.getComputedStyle(e);return t.display.includes("none")||t.visibility.includes("hidden")||t.opacity==="0"?!1:o.isVisible(e.parentNode,n)}}static isUserVisible(e,n){if(!o.isVisible(e,n))return!1;let t=e.getBoundingClientRect(),{width:i,height:l}=o.getPageSize(n.document);return!(t.height===0||t.width===0)}static getNSiblingsDivs(e,n,t=null){let i=t;isNaN(t)||(i=r=>r===t);let l="",s=[];e.querySelectorAll("div").forEach(r=>{let a=o.getXPath(r,n),c=a.substring(0,a.lastIndexOf("["));s[c]?s[c].push(r):s[c]=[r]});for(let r in s)if(i(s[r].length)){l=r;break}return s[l]||null}static getPageSize(e){var n=e.documentElement,t=e.body,i=Math.max(n.clientWidth,n.scrollWidth,n.offsetWidth,t.scrollWidth,t.offsetWidth),l=Math.max(n.clientHeight,n.scrollHeight,n.offsetHeight,t.scrollHeight,t.offsetHeight);return{width:i,height:l}}static getOffsetRect(e,n){let t=e.getBoundingClientRect(),i=n.document?.scrollingElement?.scrollLeft||0,l=n.document?.scrollingElement?.scrollTop||0;return{x:t.left+i,y:t.top+l,width:t.width,height:t.height}}static checkElStackUpCSSClasses(e,n){let t=e;for(;t;){if(t.classList.contains(n))return!0;t=t.parentElement}return!1}static getAllVisibleElements=(e=document.body,n)=>{let t=[...e.querySelectorAll("*")].filter(s=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(s.nodeName)).reduce((s,r,a)=>{var c=r.closest("svg");return!(c!==null&&c!==r)&&!s.includes(r.nodeName)&&s.push(r.nodeName),s},[]);console.debug("DOM node types:",t);let l=[...e.querySelectorAll(t.join(","))].filter(s=>o.isUserVisible(s,n));return console.log(`found ${l.length} visible elements in the page.`),l}};var w=class{constructor(...e){e.reduce((n,t,i)=>(n[t]=1<<i,n),this)}},k=class{#e=0;constructor(...e){this.#e=0,this.setFlags(...e)}get flag(){return this.#e}setFlags(...e){this.#e=e.reduce((n,t)=>n|t,0)}setFlag(e){this.#e|=e}unsetFlag(e){this.#e&=~e}isFlagSet(e){return(this.#e&e)!==0}areOnlyFlagsSet(...e){let n=e.reduce((t,i)=>t|i,0);return this.#e===n}getFlags(e){return Object.keys(e).filter(n=>this.isFlagSet(e[n]))}};function E(o){var e=0,n=o.length,t=0;if(n>0)for(;t<n;)e=(e<<5)-e+o.charCodeAt(t++)|0;return e}function B(o,...e){return(...n)=>{let t=n[n.length-1]||{},i=[o[0]];return e.forEach((l,s)=>{let r=Number.isInteger(l)?n[l]:t[l];i.push(r,o[s+1])}),i.join("")}}function I(o,e){let n=null,t=null;if(n=[...o.querySelectorAll("*")].some(r=>{let a=e.getComputedStyle(r),c=r.getBoundingClientRect(),d=a.backgroundImage||"none",u="none";if(u&&u.includes("rgba")&&Color.fromRGBA(u).a===0&&(u="none"),d.includes("none")&&u.includes("none"))return!1;if(d||u)return t=r,!0}),n)return t;let i=o.getBoundingClientRect(),l=i.width*i.height,s=[...o.querySelectorAll("img")].filter(r=>p.isUserVisible(r,e));if(s&&s.length===1){n=s.shift();let r=n.getBoundingClientRect();if(r.width*r.height>=l*.8)return n}return null}function R(o,e){let n=o.getBoundingClientRect(),t=n.width*n.height;if([...o.querySelectorAll("*")].filter(s=>{let r=s.getBoundingClientRect();return r.width*r.height>=t*.8}).find(s=>{let r=e.getComputedStyle(s);return r.backgroundImage&&!r.backgroundImage.includes("none")}))return!0;let l=[...o.querySelectorAll("img")].filter(s=>{let r=s.getBoundingClientRect(),a=r.width*r.height;return p.isUserVisible(s,e)&&a>=t*.8});return!!(l&&l.length===1)}var h=window.xp??{},C=class{constructor({sectionType:e,sectionFeatures:n,template:t,confidence:i}){this.sectionType=e,this.sectionFeatures=n,this.template=t,this.confidence=i}},$=[{name:"carousel",predictFn:(o,e,n,t,i)=>{console.log(o.div),console.groupCollapsed(">>> carousel");let l=p.getNSiblingsDivs(o.div,i.document,s=>s>=2);if(l){console.log("predict carousel"),console.log(l);let s={};l.forEach(a=>{let c=p.getXPath(a,i.document),d=[...a.querySelectorAll("div")].map(y=>p.getXPath(y,i.document).slice(c.length));console.log(d);let u=E(d.join(`
  `));console.log(u),s[u]?s[u].push(a):s[u]=[a]}),console.groupEnd();let r=Object.keys(s).filter(a=>s[a].length>1);if(s[r]){let a=!1,c=!1;if(s[r].forEach(d=>{let u=d.getBoundingClientRect();u.width>0&&u.height>0&&(!p.isVisible(d,i)||u.x+u.width>i.innerWidth)?c=!0:a=!0}),a&&c)return console.log(o.div,"is a carousel:",a&&c),!0}return console.log("is not a carousel"),!1}return console.log("no siblings, not a carousel"),console.groupEnd(),!1}},{name:"cards",predictFn:(o,e,n,t,i)=>{console.groupCollapsed(">>> cards"),console.log(o.div),console.log(o.div.classList),console.log(o),console.log(o.children.every(s=>p.checkElStackUpCSSClasses(s.div,"card"))),console.log(p.checkElStackUpCSSClasses(o.div,"card")),console.log(t.isFlagSet(f.isGridLayout));let l=t.isFlagSet(f.isGridLayout)&&(o.div.classList.value.includes("card")||o.children.find(s=>s.div.querySelector('[class*="card"]')!==null)!==void 0);return console.log("aaa",l),console.groupEnd(),l}},{name:"columns",predictFn:(o,e,n,t,i)=>(console.log("flags",t.getFlags(f)),t.isFlagSet(f.isGridLayout))},{name:"hero",predictFn:(o,e,n,t,i)=>o.height<=i.innerHeight&&(t.isFlagSet(f.hasBackgroundImage)&&t.isFlagSet(f.hasHeading)||o.children.length===2&&o.children.some(l=>l.prediction?.sectionFeatures.includes("hasBackgroundImage"))&&o.children.some(l=>l.prediction?.sectionFeatures.includes("hasHeading")))},{name:"default-content",predictFn:(o,e,n,t,i)=>{let l=!0;[...o.div.querySelectorAll("img")].some(a=>{let c=a.getBoundingClientRect();return c.width>50&&c.height>50})&&(l=!1);let r=!o.children?.some(a=>(console.log(a.prediction?.sectionType),!["heading","text","text+icons"].includes(a.prediction?.sectionType)));return console.log("childrenOnlyTextLike",o,r),r&&(t.isFlagSet(f.hasTexts)&&!t.isFlagSet(f.hasImages)&&!t.isFlagSet(f.hasBackground)||!t.isFlagSet(f.isGridLayout)&&t.isFlagSet(f.hasTexts)&&l&&!t.isFlagSet(f.hasBackground))}}];h.DOM=p;h.Flags=w;h.FlagSet=k;function G(o,e){let n=e.document.createElement("a");document.body.appendChild(n);let t=e.getComputedStyle(n);return[...o.querySelectorAll("a")].find(l=>{if(["background","background-color","background-image"].find(a=>{let c=e.getComputedStyle(l);return console.log(a,c[a],t[a]),c[a]!==t[a]}))return console.log("hasBackground"),!0;let r=0;return["left","right","top","bottom"].forEach(a=>{let c=e.getComputedStyle(l).getPropertyValue(`border-${a}-style`);console.log(a,c,t[`border-${a}-style`]),c!==t[`border-${a}-style`]&&r++}),r>1?(console.log("bordersNum"),!0):!1})!==void 0}var z=[new S({name:"violet",r:148,g:0,b:211}),new S({name:"indigo",r:75,g:0,b:130}),new S({name:"blue",r:0,g:0,b:255}),new S({name:"green",r:0,g:255,b:0}),new S({name:"yellow",r:255,g:255,b:0}),new S({name:"orange",r:255,g:127,b:0}),new S({name:"red",r:255,g:0,b:0})];h.filterDivs=o=>{let{width:e,height:n}=p.getPageSize();console.log("page size:",e,n);let t=o.filter(l=>{let s=l.getBoundingClientRect();return console.log(l,.8*e*n,s.width*s.height),!l.classList.contains("xp-ui")&&!l.closest(".xp-ui")&&s.width!==0&&s.height!==0&&s.width*s.height>5e3&&s.width*s.height<.8*e*n&&p.isVisible(l,window)});console.log(t.length),console.log(t.map(l=>l));let i=t.filter(l=>{let s=l.parentElement;for(;s;){let r=l.getBoundingClientRect(),a=s.getBoundingClientRect();if(a.width===0||a.height===0){s=s.parentElement;continue}if(r.width>=.9*a.width&&r.height>=.9*a.height)return!1;s=s.parentElement}return!0});return console.log(i.length),console.log(i.map(l=>l)),i};var U=B`position:absolute;z-index:10000000;left:${0}px;top:${1}px;width:${2}px;height:${3}px;border:2px solid ${4};`,F=(o,{window:e,target:n=document.body,padding:t=0,color:i=null,label:l=null})=>{let s=i||"rgba(0, 0, 255, 1)",r=p.getOffsetRect(o.div,e),c=n.closest("body").getBoundingClientRect().y||0,d=document.createElement("div");d.dataset.boxId=o.id,d.dataset.boxXpath=o.xpath,d.dataset.boxXpathWithDetails=o.xpathWithDetails,d.dataset.layout=JSON.stringify(o.layout);let u=(({id:y,x:g,y:v,width:m,height:b,xpath:L,layout:H})=>({id:y,x:g,y:v,width:m,height:b,xpath:L,layout:H}))(o);if((o.layout.numCols>1||o.layout.numRows>1)&&(u.childrenXpaths=o.children.map(y=>({xpath:y.xpath,xpathWithDetails:y.xpathWithDetails}))),d.dataset.boxData=JSON.stringify(u),d.className="xp-overlay",d.style=U(r.x+t,r.y+t-c,r.width-t*2-4,r.height-t*2-4,s),l){let y=e.document.createElement("div");y.className="xp-overlay-label",y.textContent=l,d.appendChild(y)}n.appendChild(d)};function N(o,e,n=0,t=z,i=null,l=0){o.forEach((s,r)=>{let a=i||t[r%(t.length-1)],c=l===0?1:Math.max(.1,.5-l*.1),d=a.withAlpha(c).toRGBA();s.color=d,F(s,{window:e,target:e.document.body,padding:n,color:d,label:`layout: ${s.layout.numCols}x${s.layout.numRows}`}),s.children.length>0&&N(s.children,e,n+4,t,a,l+1)})}var f=new w("isFromRootBox","hasHeader","hasTexts","hasBackground","hasBackgroundImage","hasHeading","hasCTA","hasImages","hasMultipleColumns","hasMultipleRows","isGridLayout","isInsideAHeaderLikeElement","isInsideAFooterLikeElement");function A(o,e,n=null,t,i=!0){if(o.ignored)return null;let l="unknown",s=new k,r=o.div;if(i&&s.setFlag(f.isFromRootBox),r){let c=r.cloneNode(!0);c.querySelectorAll("script, style, link, meta, noscript").forEach(b=>b.remove()),c.textContent.replaceAll(" ","").replaceAll(`
  `,"").trim().length>0&&s.setFlag(f.hasTexts),([...r.querySelectorAll("img, picture, svg")].length>0||["IMG","PICTURE","SVG"].includes(r.nodeName))&&s.setFlag(f.hasImages),!!I(o.div,t)&&s.setFlag(f.hasBackground),(o.div&&o.div.nodeName==="IMG"||R(o.div,t))&&s.setFlag(f.hasBackgroundImage),([...r.querySelectorAll("h1, h2, h3, h4, h5, h6")].length>0||["H1","H2","H3","H4","H5","H6"].includes(r.nodeName))&&s.setFlag(f.hasHeading),G(r,t)&&s.setFlag(f.hasCTA);let m=o.determineLayout();m.numRows>1&&s.setFlag(f.hasMultipleRows),m.numCols>1&&s.setFlag(f.hasMultipleColumns),m.numCols>1&&x.areBoxesLaidOutAsGrid(o.children)&&s.setFlag(f.isGridLayout),(r.closest("header, .header, #header")||p.checkElStackUpCSSClasses(r,"header")||o.x===0&&o.y===0)&&s.setFlag(f.isInsideAHeaderLikeElement),(r.closest("footer, .footer, #footer")||p.checkElStackUpCSSClasses(r,"footer"))&&s.setFlag(f.isInsideAFooterLikeElement)}if(o.children.forEach((...c)=>{A(...c,t,!1)}),!i){let c=$.find(d=>d.predictFn(o,e,null,s,t));c&&(l=c.name)}if(o.prediction=new C({sectionType:l,sectionFeatures:s.getFlags(f),confidence:-1}),console.group("prediction"),console.log("prediction"),console.log(s.getFlags(f)),console.log(r),console.log("section prediction:",o.prediction),console.groupEnd(),i){let c=function(g,v){return g.children.find(m=>m.prediction.sectionType===v?!0:c(m))},d=function(g,v){let m=g.children.slice(v)[0];return!m||m.children.length===0?g.div?g:m:d(m,v)};if(!c(o,"header")){let g=d(o,0);g&&(g.prediction=new C({sectionType:"header",sectionFeatures:g.prediction.sectionFeatures,confidence:-1}))}if(!c(o,"footer")){let g=d(o,-1);if(g)if(g.prediction.sectionType==="unknown")g.prediction=new C({sectionType:"footer",sectionFeatures:g.prediction.sectionFeatures,confidence:-1});else{let v={...g};g.children=[v],g.prediction=new C({sectionType:"footer",sectionFeatures:g.prediction.sectionFeatures,confidence:-1})}}}return o.prediction}function X(){let o=[...document.body.querySelectorAll("*")].filter(t=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(t.nodeName)).reduce((t,i,l)=>{var s=i.closest("svg");return!(s!==null&&s!==i)&&!t.includes(i.nodeName)&&t.push(i.nodeName),t},[]);console.log("DOM node types:",o);let e=[...document.querySelectorAll(o.join(","))],n=h.filterDivs(e);return console.log(`found ${n.length} visible divs to show!`),n}h.getAllVisibleDivs=X;h.buildBoxTree=(o,e)=>{let n=new x(0,0,e.innerWidth,e.document.scrollingElement.scrollHeight),t=o.map(c=>x.fromDiv(c,e)).sort((c,d)=>c.y-d.y);function i(c,d,u){d.forEach((y,g)=>{if(u.has(g))return;if(c.contains(y,!1)){let m=y;c.addChild(m),u.add(g),i(m,d,u)}})}i(n,t,new Set);function l(c){c.determineLayout(),c.children.forEach(l)}l(n);function s(c){if(c.children.length===1&&c.layout.numCols===1){let d=c.children[0];c.children=d.children,s(c),c.determineLayout()}else c.children.forEach(s)}s(n);function r(c){c.children.length>1&&c.layout.numCols===1&&c.children.every(d=>d.layout.numRows===0&&d.layout.numCols===0)?(c.children=[],r(c),c.determineLayout()):c.children.forEach(r)}r(n);function a(c){if(c.children.length>1){let d=c.children[0].layout.numCols;if(c.layout.numRows>1&&c.layout.numCols===1&&c.children.every(u=>u.layout.numRows===1&&u.layout.numCols>1&&u.layout.numCols===d)){console.log("mergeMultiSingleRowColums",c);let u=[];c.children.forEach(y=>{u.push(...y.children)}),c.children=u,c.determineLayout()}else c.children.forEach(a)}}return a(n),l(n),n};h.getVerticalBoxesFromHierarchy=(o,e=!0)=>{let n={...o};function t(i){let l=i.children;if(l.some(r=>l.some(a=>r!==a&&!r.isInside(a)&&(r.x>=a.x+a.width||r.x+r.width<=a.x)))){i.setChildren([]);return}else for(let r=0;r<l.length;r++)t(l[r])}return t(n),n.children};h.boxes=null;h.selectElementToIgnore=()=>{document.body.style.cursor="crosshair",h.ui.overlaysDiv().addEventListener("click",e=>{let n=e.target;n.classList.contains("xp-overlay")&&n.remove(),h.ignoreElementForDection(n.dataset.boxId),document.body.style.removeProperty("cursor")},{once:!0})};h.ignoreElementForDection=o=>{function e(n){if(n.id===o){let t=function(i){[...h.ui.overlaysDiv().querySelectorAll(".xp-overlay")].forEach(s=>{s.dataset.boxId===i.id&&s.remove()}),i.children.forEach(t)};return n.ignored=!0,t(n),!0}else return n.children.some(e)}e(h.boxes)};h.predictPage=o=>{if(h.boxes?.children?.length>0){let n=function(i){i.ignored||(i.prediction&&i.prediction.sectionType!=="unknown"||i.prediction&&i.prediction.sectionType==="unknown"&&i.children.length===0?(e.push(i),console.warn(i.div,i.prediction),h.ui&&F(i,{window:o,padding:0,color:"rgba(0, 255, 0, 1)",label:i.prediction.sectionType})):i.children.forEach(n))};h.ui?.resetOverlays(),A(h.boxes,0,null,o);let e=[];n(h.boxes);let t=h.boxes.children.map(i=>{let l=[p.getXPath(i.div,document)];return l.push(...i.children.map(s=>"- "+p.getXPath(s.div,document))),l.join(`
  `)||""}).join(`
  `)||"";return h.boxes.template={raw:t,hash:E(t)},h.predictedBoxes=e,console.log("final boxes",h.boxes),console.log("predicted boxes",h.predictedBoxes),h.ui?.toggleOverlays(!0),h.boxes}};h.detectSections=async(o,e,n={autoDetect:!1})=>{h.ui?.resetOverlays();let{document:t}=e,i=p.getAllVisibleElements(o,e);console.log("visible divs",i);let{width:l,height:s}=p.getPageSize(t);i=i.filter(d=>{let u=d.getBoundingClientRect();return u.width*u.height>1e4&&u.width*u.height<.8*l*s}),console.log("filtered divs",i);let r=h.buildBoxTree(i,e);console.log("boxes hierarchy",r);function a(d,u){d.div&&(d.xpath=p.getXPath(d.div,u),d.xpathWithDetails=p.getXPath(d.div,u,!0),d.id=`box-id-${E(d.xpath)}`),d.children&&d.children.length>0&&d.children.forEach(y=>a(y,u))}a(r,t),h.boxes=r;let c=r.children.map(d=>{let u=[d.xpath];return u.push(...d.children.map(y=>"- "+y.xpath)),u.join(`
  `)||""}).join(`
  `)||"";if(console.log("template",c),h.template={raw:c,hash:E(c)},!n.autoDetect)N(r.children,e);else if(h.boxes?.children?.length>0){let u=function(g){g.ignored||(g.prediction&&g.prediction.sectionType!=="unknown"||g.prediction&&g.prediction.sectionType==="unknown"&&g.children.length===0?d.push(g):g.children.forEach(u))};A(h.boxes,0,null,e);let d=[];u(h.boxes),d.forEach((g,v)=>{v===0&&(g.prediction.sectionType="header"),console.log("label",g.prediction.sectionType),F(g,{window:e,target:e.document.body,padding:0,color:g.color,label:g.prediction.sectionType})});let y=h.boxes.children.map(g=>{let v=[p.getXPath(g.div,t)];return v.push(...g.children.map(m=>"- "+p.getXPath(m.div,t))),v.join(`
  `)||""}).join(`
  `)||"";h.boxes.template={raw:y,hash:E(y)},h.boxes.predictedBoxes=d,console.log("final boxes",h.boxes),h.ui?.toggleOverlays(!0)}return h.ui?.toggleOverlays(!0),h.boxes};window.xp=h;})();
  
// ==>> CUSTOM SCRIPT <<==

var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // js/sections-mapping/import/sections-mapping.lpb.import.js
  var sections_mapping_lpb_import_exports = {};
  __export(sections_mapping_lpb_import_exports, {
    IMPORT_TARGETS: () => IMPORT_TARGETS2,
    default: () => sections_mapping_lpb_import_default
  });

  // js/shared/ui.js
  var IS_EXPRESS = document.querySelector(".import-express") !== null;
  var IS_FRAGMENTS = document.querySelector(".import-fragments") !== null;
  var DETECT_BUTTON = document.getElementById("detect-sections-button");
  var IMPORT_BUTTON = document.getElementById("import-doimport-button");
  var SPTABS = document.querySelector(".import sp-tabs");
  var getContentFrame = () => document.querySelector(".import iframe");

  // js/shared/alert.js
  var ALERT = document.getElementById("alert-container");

  // js/sections-mapping/sm.ui.js
  var ADD_FRAGMENT_BTN = document.getElementById("sm-add-fragment");
  var SM_FRAGMENTS_CONTAINER = document.getElementById("sm-fragments-container");
  var selectedSectionInFragmentProxy = { id: null };
  var selectedSectionInFragment = new Proxy(selectedSectionInFragmentProxy, {
    set: (target, key, value) => {
      console.log("selectedSectionInFragment", target, key, value);
      const oldValue = target[key];
      console.log(`${key} set from ${selectedSectionInFragmentProxy.id} to ${value}`);
      target[key] = value;
      const oldOverlayDiv = SM_FRAGMENTS_CONTAINER.querySelector(`[data-id="${oldValue}"]`);
      if (oldOverlayDiv) {
        oldOverlayDiv.classList.remove("selected");
      }
      const overlayDiv = SM_FRAGMENTS_CONTAINER.querySelector(`[data-id="${value}"]`);
      if (overlayDiv) {
        overlayDiv.classList.add("selected");
      }
      return true;
    }
  });
  var selectedBoxInSectionProxy = { id: null };
  var selectedBoxInSection = new Proxy(selectedBoxInSectionProxy, {
    set: (target, key, value) => {
      const oldValue = target[key];
      target[key] = value;
      const oldOverlayDiv = getContentFrame().contentDocument.querySelector(`.xp-overlay[data-box-id="${oldValue}"]`);
      if (oldOverlayDiv) {
        oldOverlayDiv.classList.remove("hover");
      }
      const overlayDiv = getContentFrame().contentDocument.querySelector(`.xp-overlay[data-box-id="${value}"]`);
      if (overlayDiv) {
        overlayDiv.classList.add("hover");
      }
      return true;
    }
  });

  // js/sections-mapping/utils.js
  function generateDocumentPath({ url }) {
    let p = new URL(url).pathname;
    if (p.endsWith("/")) {
      p = `${p}index`;
    }
    p = decodeURIComponent(p).toLowerCase().replace(/\.html$/, "").replace(/[^a-z0-9/]/gm, "-");
    return WebImporter.FileUtils.sanitizePath(p);
  }

  // js/shared/utils.js
  function getElementByXpath(document2, path) {
    try {
      return document2.evaluate(
        path,
        document2,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    } catch (e) {
      console.warn("Error evaluating this xpath:", path, e);
    }
    return void 0;
  }

  // js/sections-mapping/import/import.utils.js
  function getElementByXpath2(document2, path) {
    try {
      return document2.evaluate(
        path,
        document2,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    } catch (e) {
      console.warn("Error evaluating this xpath:", path, e);
    }
    return void 0;
  }
  var BG_EXTRACTION_STRATEGIES = {
    default: "default",
    image: "image",
    color: "color"
  };
  function extractBackground(el, document2, options = {}) {
    var _a, _b;
    if (!el) {
      return null;
    }
    const opts = __spreadValues(__spreadValues({}, { strategy: "default", defaultBackground: "" }), options);
    console.log("extractBackground options:", opts);
    let background = null;
    if (options.strategy === BG_EXTRACTION_STRATEGIES.image || options.strategy === BG_EXTRACTION_STRATEGIES.default) {
      try {
        const bg = document2.defaultView.getComputedStyle(el).getPropertyValue("background-image");
        if (bg !== "" && !bg.includes("none") && bg.includes("url(")) {
          background = WebImporter.DOMUtils.getImgFromBackground(el, document2);
        }
        if (options.strategy === BG_EXTRACTION_STRATEGIES.image && background && background.src.includes("url")) {
          console.log("extractBackground s1: background", background.src);
          console.log(el);
          return background;
        }
      } catch (e) {
      }
    }
    if (!background) {
      if (options.strategy === BG_EXTRACTION_STRATEGIES.image || options.strategy === BG_EXTRACTION_STRATEGIES.default) {
        el.querySelectorAll("div").forEach((d) => {
          if (!d.querySelector("video")) {
            try {
              const bg = document2.defaultView.getComputedStyle(d).getPropertyValue("background-image");
              if (bg !== "" && !bg.includes("none") && bg.includes("url(")) {
                background = WebImporter.DOMUtils.getImgFromBackground(d, document2);
              }
            } catch (e) {
            }
          }
        });
        if (options.strategy === BG_EXTRACTION_STRATEGIES.image && background) {
          console.log("extractBackground s2: background", background.src);
          return background;
        }
      }
    }
    if (!background) {
      const bgImage = (_b = (_a = el.querySelector("[data-hlx-background-image]")) == null ? void 0 : _a.dataset) == null ? void 0 : _b.hlxBackgroundImage;
      if (bgImage) {
        if (bgImage.trim().startsWith("url")) {
          const img = WebImporter.DOMUtils.getImgFromBackground(el.querySelector("[data-hlx-background-image]"), document2);
          if (img) {
            background = img;
            if (options.strategy === BG_EXTRACTION_STRATEGIES.image && background) {
              console.log("extractBackground s3: background", background.src);
              return background;
            }
          }
        }
      }
    }
    if (background) {
      console.log("extractBackground: background", background.src);
      try {
        const u = new URL(background.src);
      } catch (e) {
        console.warn("extractBackground: invalid URL", background.src);
        background = null;
      }
    }
    if (!background) {
      background = opts.defaultBackground;
    }
    return background;
  }

  // js/sections-mapping/import/parsers/cards.js
  function cardsParser(el, { mapping, document: document2 }) {
    if (!(mapping == null ? void 0 : mapping.childrenXpaths)) {
      console.warn("cardsParser: missing childrenXpaths, returning default content");
      return el;
    }
    const blockName = mapping.customBlockName || "cards";
    const children = mapping.childrenXpaths.map((c) => {
      const cEl = getElementByXpath2(document2, c.xpath);
      if (!cEl) {
        console.warn("element not found", c.section, c.xpath);
        return;
      }
      cEl.querySelectorAll("[data-hlx-imp-hidden-div]").forEach((d) => d.remove());
      let content = cEl;
      if (cEl.nodeName === "LI") {
        content = document2.createElement("div");
        content.append(...cEl.children);
      }
      const imgEl = document2.createElement("div");
      const bgImg = extractBackground(content, document2, { strategy: "image" }) || content.querySelector("img");
      if (bgImg) {
        imgEl.appendChild(bgImg);
      }
      return [imgEl, content];
    });
    return WebImporter.DOMUtils.createTable([
      [blockName],
      ...children
    ], document2);
  }

  // js/sections-mapping/import/parsers/columns.js
  function columnsParser(el, { mapping, document: document2 }) {
    const blockName = mapping.customBlockName || "columns";
    console.log("columnsParser", { mapping });
    const { numCols } = mapping.layout;
    let colsCtr = 0;
    const childrenEls = [];
    if (mapping.childrenXpaths) {
      mapping.childrenXpaths.forEach((c) => {
        console.log("columnsParser - child XPath", c.xpath);
        const cEl = getElementByXpath(document2, c.xpath);
        if (!cEl) {
          console.warn("element not found", c.section, c.xpath);
        } else {
          childrenEls.push(cEl);
        }
      });
    } else if (mapping.children) {
      childrenEls.push(...mapping.children.map((c) => c.div));
    }
    console.log("columnsParser - childrenEls", childrenEls);
    const children = childrenEls.reduce(
      (acc, cEl) => {
        console.log("columnsParser - child XPath", cEl);
        let content = cEl;
        if (cEl.nodeName === "LI") {
          content = document2.createElement("div");
          content.append(...cEl.children);
        }
        if (colsCtr > numCols) {
          colsCtr = 1;
          acc.push([[content]]);
        } else {
          const arr = acc[acc.length - 1];
          if (!arr) {
            acc.push([[content]]);
          } else {
            arr.push([content]);
          }
        }
        return acc;
      },
      []
    ) || [];
    if (children.length > 1) {
      while (children[children.length - 1].length < numCols) {
        children[children.length - 1].push([""]);
      }
    }
    const block = WebImporter.DOMUtils.createTable([
      [blockName],
      ...children
    ], document2);
    return block;
  }

  // js/sections-mapping/import/parsers/hero.js
  function heroParser(el, { mapping, document: document2, target }) {
    const blockName = mapping.customBlockName || "hero";
    const imgEl = extractBackground(el, document2, { strategy: "image" }) || el.querySelector("img") || null;
    const cells = [
      [blockName]
    ];
    if (target === "crosswalk") {
      cells.push([imgEl || ""]);
    } else if (imgEl) {
      el.prepend(imgEl);
    }
    cells.push([el.cloneNode(true)]);
    return WebImporter.DOMUtils.createTable(cells, document2);
  }

  // js/sections-mapping/import/sections-mapping.import.js
  var IMPORT_TARGETS = {
    AEM_BLOCK_COLLECTION: "aem-block-collection",
    CROSSWALK: "crosswalk"
  };

  // js/sections-mapping/import/parsers/header.js
  var brandLogoMapping = [
    {
      checkFn: (e) => [...e.querySelectorAll("a > picture, a > img")].filter((i) => i.closest("[data-hlx-imp-hidden-div]") === null)[0],
      parseFn: (e, targetEl, bodyWidth, x, target) => {
        if (bodyWidth && x < bodyWidth / 2) {
          if (target === IMPORT_TARGETS.CROSSWALK) {
            targetEl.append(e);
          } else {
            const linkedPictureEl = document.createElement("div");
            const linkEl = e.parentElement;
            linkEl.parentElement.append(linkedPictureEl);
            linkedPictureEl.append(document.createElement("br"));
            linkedPictureEl.append(linkEl);
            linkedPictureEl.prepend(...linkEl.children);
            if (linkEl.textContent.replaceAll(/[\n\t]/gm, "").trim().length === 0) {
              linkEl.textContent = linkEl.href;
            }
            if (linkedPictureEl.closest("li")) {
              const liEl = linkedPictureEl.closest("li");
              targetEl.append(...liEl.children);
              liEl.remove();
            } else {
              targetEl.append(linkedPictureEl);
            }
          }
          return true;
        }
        return false;
      }
    },
    {
      checkFn: (e) => e.querySelector("picture + br + a, img + br + a"),
      parseFn: (e, targetEl, bodyWidth, x, target) => {
        if (bodyWidth && x < bodyWidth / 2) {
          const imgEl = e.closest("picture, img");
          if (imgEl) {
            if (target === IMPORT_TARGETS.CROSSWALK) {
              targetEl.append(imgEl);
            } else {
              if (imgEl.closest("li")) {
                const liEl = imgEl.closest("li");
                targetEl.append(...liEl.children);
                liEl.remove();
              } else {
                targetEl.append(imgEl);
              }
            }
          }
          return true;
        }
        return false;
      }
    },
    {
      checkFn: (e) => e.querySelector("img"),
      parseFn: (e, targetEl, bodyWidth, x) => {
        if (bodyWidth && x < bodyWidth / 2) {
          if (e.closest("li")) {
            const liEl = e.closest("li");
            targetEl.append(...liEl.children);
            liEl.remove();
          } else {
            targetEl.append(e);
          }
          return true;
        }
        return false;
      }
    },
    {
      checkFn: (e, { originURL }) => e.querySelector(`a[href="/"], a[href="${originURL}"], a[href="${originURL}/"]`),
      parseFn: (e, targetEl, bodyWidth, x) => {
        if (bodyWidth && x < bodyWidth / 2) {
          targetEl.append(e);
          return true;
        }
        return false;
      }
    },
    {
      checkFn: () => {
        const resp = fetch("/favicon.ico");
        if (resp && resp.status === 200) {
          const logoEl = document.createElement("img");
          logoEl.src = "/favicon.ico";
          return logoEl;
        }
        return null;
      },
      parseFn: (e, targetEl) => {
        targetEl.append(e);
        return true;
      }
    }
  ];
  function getBrandLogo(rootEl, document2, { bodyWidth, originURL, target }) {
    const brandEl = document2.createElement("div");
    brandLogoMapping.some((m) => {
      var _a;
      const logoEl = m.checkFn(rootEl, { originURL, target });
      if (logoEl) {
        let x = 0;
        try {
          x = JSON.parse((_a = logoEl.closest("div")) == null ? void 0 : _a.getAttribute("data-hlx-imp-rect")).x;
        } catch (e) {
          console.error("error", e);
        }
        return m.parseFn(logoEl, brandEl, bodyWidth, x, target);
      }
      return false;
    });
    return brandEl;
  }
  var navMapping = [
    {
      checkFn: (e) => [...e.querySelectorAll("nav ul, nav ol")].filter((i) => !i.parentElement.closest("ul, ol") && !i.hasAttribute("data-hlx-imp-hidden-div")).reduce((acc, navListEl) => {
        var _a;
        let x = null;
        try {
          x = JSON.parse((_a = navListEl.closest("div")) == null ? void 0 : _a.getAttribute("data-hlx-imp-rect")).x;
        } catch (err) {
          console.error("error", err);
        }
        if (!acc || typeof x === "number" && x < acc.x) {
          return {
            el: navListEl,
            x
          };
        }
        return acc;
      }, null),
      parseFn: (e, targetEl) => {
        targetEl.append(e == null ? void 0 : e.el);
        return true;
      }
    },
    {
      checkFn: (e) => [...e.querySelectorAll("nav")].filter((i) => !i.parentElement.closest("nav") && !i.hasAttribute("data-hlx-imp-hidden-div")).reduce((acc, navListEl) => {
        var _a;
        let x = null;
        try {
          x = JSON.parse((_a = navListEl.closest("div")) == null ? void 0 : _a.getAttribute("data-hlx-imp-rect")).x;
        } catch (err) {
          console.error("error", err);
        }
        if (!acc || typeof x === "number" && x < acc.x) {
          return {
            el: navListEl,
            x
          };
        }
        return acc;
      }, null),
      parseFn: (e, targetEl) => {
        targetEl.append(e == null ? void 0 : e.el);
        return true;
      }
    },
    {
      checkFn: (e, { bodyWidth }) => [...e.querySelectorAll("ol,ul")].filter((f) => f.parentElement.closest("ol,ul") === null).reduce(
        (acc, listEl) => {
          var _a;
          console.log("listEl", listEl);
          const items = [...listEl.querySelectorAll(":scope > li")].filter((liEl) => {
            liEl.querySelectorAll("script", "style").forEach((d) => d.remove());
            return liEl.textContent.replaceAll("\n", "").trim().length > 0;
          });
          let x = null;
          try {
            x = JSON.parse((_a = listEl.closest("div")) == null ? void 0 : _a.getAttribute("data-hlx-imp-rect")).x;
          } catch (err) {
            console.error("error", err);
          }
          console.log("items", items.length, acc == null ? void 0 : acc.children.length, x, bodyWidth, listEl);
          if (items.length > 1 && (!acc || items.length > acc.children.length) && (!bodyWidth || typeof x === "number" && x < bodyWidth / 2)) {
            console.log("found", listEl);
            return listEl;
          }
          return acc;
        },
        null
      ),
      parseFn: (e, targetEl) => {
        const elsToDelete = e.querySelectorAll(":scope > :not(li)");
        elsToDelete.forEach((d) => d.remove());
        targetEl.append(e);
        return true;
      }
    }
  ];
  function getNavigation(rootEl, document2, { bodyWidth }) {
    const navEl = document2.createElement("div");
    navMapping.some((m) => {
      var _a;
      const el = m.checkFn(rootEl, { bodyWidth });
      if (el) {
        console.log("nav", el);
        let x = 0;
        try {
          x = JSON.parse((_a = el.closest("div")) == null ? void 0 : _a.getAttribute("data-hlx-imp-rect")).x;
        } catch (e) {
          console.error("error", e);
        }
        return m.parseFn(el, navEl, bodyWidth, x);
      }
      return false;
    });
    return navEl;
  }
  function cleanup(el) {
    el.querySelectorAll("script", "style").forEach((e) => e.remove());
    el.querySelectorAll("a").forEach((a) => {
      if (a.textContent.replaceAll("\n", "").trim().toLowerCase() === "skip to content") {
        a.remove();
      }
    });
    return el;
  }
  function headerParser(el, { document: document2, params, allMappings, target, bodyW }) {
    var _a, _b;
    console.log("headerParser", el, params, allMappings, target, bodyW);
    const containerEl = document2.createElement("div");
    const bodyWidth = allMappings ? (_b = (_a = allMappings == null ? void 0 : allMappings.sections[0]) == null ? void 0 : _a.blocks[0]) == null ? void 0 : _b.width : bodyW;
    const originURL = new URL(params.originalURL).origin;
    const brandEl = getBrandLogo(el, document2, { bodyWidth, originURL, target });
    const navEl = getNavigation(el, document2, { bodyWidth });
    const hiddenEls = document2.createElement("div");
    while (el.querySelector("[data-hlx-imp-hidden-div]")) {
      hiddenEls.append(el.querySelector("[data-hlx-imp-hidden-div]"));
    }
    const toolsEl = document2.createElement("div");
    toolsEl.append(...el.children);
    containerEl.append(brandEl);
    containerEl.append(document2.createElement("hr"));
    containerEl.append(navEl);
    containerEl.append(document2.createElement("hr"));
    containerEl.append(toolsEl);
    if (hiddenEls.children.length > 0 && hiddenEls.textContent.replaceAll("\n", "").trim().length > 0) {
      containerEl.append(document2.createElement("hr"));
      containerEl.append(hiddenEls);
      containerEl.append(WebImporter.DOMUtils.createTable([
        ["section-metadata"],
        ["style", "hidden"]
      ], document2));
    }
    cleanup(containerEl);
    return containerEl;
  }

  // js/sections-mapping/import/sections-mapping.lpb.import.js
  var IMPORT_TARGETS2 = {
    AEM_BLOCK_COLLECTION: "aem-block-collection",
    CROSSWALK: "crosswalk"
  };
  var parsers = {
    cards: cardsParser,
    columns: columnsParser,
    hero: heroParser
  };
  var DETECTED_SECTIONS_BLOCKS_MAPPING = {
    unknown: "defaultContent",
    "default-content": "defaultContent",
    carousel: "defaultContent",
    hero: "hero",
    columns: "columns",
    header: "header",
    footer: "footer",
    cards: "cards"
  };
  var sections_mapping_lpb_import_default = {
    transform: (_0) => __async(void 0, [_0], function* ({ document: document2, params }) {
      var _a, _b, _c, _d;
      yield new Promise((resolve) => setTimeout(resolve, 3e3));
      yield new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 1e3;
        const timer = setInterval(() => {
          var _a2;
          const { scrollHeight } = window.document.scrollingElement;
          totalHeight += distance;
          (_a2 = window.document.scrollingElement) == null ? void 0 : _a2.scrollTo({ top: totalHeight, left: 0, behavior: "instant" });
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(true);
          }
        }, 100);
      });
      (_a = window.document.scrollingElement) == null ? void 0 : _a.scrollTo({ left: 0, top: 0, behavior: "instant" });
      yield new Promise((resolve) => setTimeout(resolve, 1e3));
      document2.dispatchEvent(
        new KeyboardEvent("keydown", {
          altKey: false,
          code: "Escape",
          ctrlKey: false,
          isComposing: false,
          key: "Escape",
          location: 0,
          metaKey: false,
          repeat: false,
          shiftKey: false,
          which: 27,
          charCode: 0,
          keyCode: 27
        })
      );
      (_b = document2.elementFromPoint(0, 0)) == null ? void 0 : _b.click();
      document2.querySelectorAll("#onetrust-consent-sdk, ot-sdk-btn").forEach((el) => el.remove());
      document2.querySelectorAll("*").forEach((el) => {
        if (el && (/none/i.test(window.getComputedStyle(el).display.trim()) || /hidden/i.test(window.getComputedStyle(el).visibility.trim()))) {
          el.setAttribute("data-hlx-imp-hidden-div", "");
        }
      });
      document2.querySelectorAll("div").forEach((div) => {
        if (div && (/none/i.test(window.getComputedStyle(div).display.trim()) || /hidden/i.test(window.getComputedStyle(div).visibility.trim()))) {
          div.setAttribute("data-hlx-imp-hidden-div", "");
        } else {
          const domRect = div.getBoundingClientRect().toJSON();
          if (Math.round(domRect.width) > 0 && Math.round(domRect.height) > 0) {
            div.setAttribute("data-hlx-imp-rect", JSON.stringify(domRect));
          }
          const bgImage = window.getComputedStyle(div).getPropertyValue("background-image");
          if (bgImage && bgImage !== "none" && bgImage.includes("url(")) {
            div.setAttribute("data-hlx-background-image", bgImage);
          }
          const bgColor = window.getComputedStyle(div).getPropertyValue("background-color");
          if (bgColor && bgColor !== "rgb(0, 0, 0)" && bgColor !== "rgba(0, 0, 0, 0)") {
            div.setAttribute("data-hlx-imp-bgcolor", bgColor);
          }
          const color = window.getComputedStyle(div).getPropertyValue("color");
          if (color && color !== "rgb(0, 0, 0)") {
            div.setAttribute("data-hlx-imp-color", color);
          }
        }
      });
      document2.querySelectorAll("img").forEach((img) => {
        var _a2;
        const src = img.getAttribute("src");
        const srcset = (_a2 = img.getAttribute("srcset")) == null ? void 0 : _a2.split(" ")[0];
        if (!src && srcset) {
          img.setAttribute("src", srcset);
        }
      });
      const searchParams = new URLSearchParams(window.location.search);
      const esaasImpId = searchParams.get("esaasImpId");
      const enforceCustomBlockName = searchParams.get("ecbn") === "true";
      const sections = yield window.xp.detectSections(
        document2.body,
        window,
        { autoDetect: true }
      );
      window.detectedSections = sections;
      const usedMappings = {};
      const predictedBoxes = sections.predictedBoxes.map((b) => {
        const pb = {
          id: b.id,
          div: b.div,
          color: "rgba(0, 0, 255, 1)",
          width: b.width,
          height: b.height,
          xpath: b.xpath,
          children: b.children,
          childrenXpaths: b.layout.numCols > 1 || b.layout.numRows > 1 ? b.children.map((child) => ({
            xpath: child.xpath,
            xpathWithDetails: child.xpathWithDetails
          })) : null,
          layout: b.layout,
          x: b.x,
          y: b.y,
          prediction: b.prediction,
          mapping: DETECTED_SECTIONS_BLOCKS_MAPPING[b.prediction.sectionType] || "unset",
          customBlockName: null
        };
        if (enforceCustomBlockName) {
          if (usedMappings[pb.mapping]) {
            usedMappings[pb.mapping] += 1;
          } else {
            usedMappings[pb.mapping] = 1;
          }
          pb.customBlockName = `ai-${pb.mapping}-${usedMappings[pb.mapping].toString().padStart(2, "0")}`;
        }
        return pb;
      });
      console.log("predictedBoxes", predictedBoxes);
      document2.body.querySelectorAll(":scope > div[data-box-id]").forEach((el) => {
        el.remove();
      });
      const element = {
        element: document2.body,
        path: generateDocumentPath({ url: params.originalURL }),
        report: {}
      };
      if (esaasImpId) {
        if (parseInt(esaasImpId.slice(-1), 10) % 2 === 0) {
          console.log("esaasImpId is even");
          const headerEl = predictedBoxes.find((s) => s.mapping === "header");
          if (headerEl == null ? void 0 : headerEl.div) {
            const headerBlock = headerParser(headerEl.div, {
              document: document2,
              params,
              allMappings: null,
              target: IMPORT_TARGETS2.AEM_BLOCK_COLLECTION,
              bodyW: (_c = predictedBoxes[0]) == null ? void 0 : _c.width
            });
            element.element = headerBlock;
          }
          element.path = "/nav";
        } else if (parseInt(esaasImpId.slice(-1), 10) % 2 === 1) {
          console.log("esaasImpId is odd");
          let finalEl = document2.createElement("div");
          const footerBox = predictedBoxes.find((s) => s.mapping === "footer");
          if (footerBox == null ? void 0 : footerBox.div) {
            let footerEl = footerBox.div;
            if (((_d = footerBox.children) == null ? void 0 : _d.length) > 0) {
              const footerUsedMappings = {};
              const fElsToReplace = [];
              footerBox.children.forEach((child) => {
                const parser = parsers[DETECTED_SECTIONS_BLOCKS_MAPPING[child.prediction.sectionType]];
                if (parser) {
                  console.log("footer child", child);
                  child.customBlockName = null;
                  const mapping = child.prediction.sectionType;
                  if (enforceCustomBlockName) {
                    if (footerUsedMappings[mapping]) {
                      footerUsedMappings[mapping] += 1;
                    } else {
                      footerUsedMappings[mapping] = 1;
                    }
                    child.customBlockName = `ai-footer-${mapping}-${footerUsedMappings[mapping].toString().padStart(2, "0")}`;
                  }
                  const fEl = getElementByXpath(document2, child.xpath);
                  const block = parser(fEl, {
                    mapping: child,
                    document: document2
                  });
                  if (block) {
                    fElsToReplace.push({
                      target: fEl,
                      new: block
                    });
                  }
                }
              });
              console.log("fElsToReplace", fElsToReplace);
              fElsToReplace.forEach((r) => {
                if (r.target === footerEl) {
                  finalEl.appendChild(r.new);
                } else {
                  if (r.new) {
                    r.target.replaceWith(r.new);
                  }
                  finalEl = footerEl;
                }
              });
            } else {
              finalEl = footerEl;
            }
          }
          element.element = finalEl;
          element.path = "/footer";
        } else {
          console.error("esaasImpId is not a number, continue!");
          const el = document2.body;
          const elsToRemove = [];
          let elsToReplace = [];
          elsToRemove.concat(
            predictedBoxes.filter((s) => {
              var _a2, _b2;
              return ((_a2 = s.prediction) == null ? void 0 : _a2.sectionType) === "header" || ((_b2 = s.prediction) == null ? void 0 : _b2.sectionType) === "footer";
            }).map((s) => getElementByXpath(document2, s.xpath))
          );
          elsToReplace = predictedBoxes.filter((s) => s.mapping === "columns" || s.mapping === "cards" || s.mapping === "hero").map((b) => {
            const bEl = getElementByXpath(document2, b.xpath);
            let block = null;
            if (bEl) {
              const parser = parsers[b.mapping];
              console.log("imp-scr", b.mapping, parser);
              if (parser) {
                block = parser(bEl, {
                  mapping: b,
                  document: document2
                });
              }
            }
            return {
              target: bEl,
              new: block
            };
          });
          elsToReplace.forEach((r) => {
            if (r.new) {
              r.target.replaceWith(r.new);
            }
          });
          predictedBoxes.filter((s) => {
            var _a2, _b2;
            return ((_a2 = s.prediction) == null ? void 0 : _a2.sectionType) === "header" || ((_b2 = s.prediction) == null ? void 0 : _b2.sectionType) === "footer";
          }).forEach((s) => {
            const elFromXpath = getElementByXpath(document2, s.xpath);
            console.log("elFromXpath", elFromXpath);
            if (elFromXpath) {
              elsToRemove.push(elFromXpath);
            }
          });
          elsToRemove.forEach((elToRemove) => {
            elToRemove.remove();
          });
          element.element = el;
        }
      }
      element.element.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href");
        if (href) {
          a.href = new URL(href, params.originalURL).href;
        }
        if (!href && a.textContent.trim().length === 0) {
          a.remove();
        }
      });
      element.element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        if (!src.startsWith("./") && !src.startsWith("/") && !src.startsWith("../") && !src.startsWith("http")) {
          const u = new URL(src, params.originalURL);
          img.src = u.toString();
        }
      });
      if (element.element.querySelector('a[href^="#"]')) {
        const u = new URL(params.originalURL);
        const links = element.element.querySelectorAll('a[href^="#"]');
        for (let i = 0; i < links.length; i += 1) {
          const a = links[i];
          a.href = `${u.pathname}${a.getAttribute("href")}`;
        }
      }
      function cleanUpAttributes(e) {
        e.removeAttribute("class");
        e.removeAttribute("style");
        const attrNames = e.getAttributeNames().filter((a) => a.startsWith("data-") || a.startsWith("aria-"));
        if (attrNames.length > 0) {
          attrNames.forEach((a) => {
            e.removeAttribute(a);
          });
        }
      }
      cleanUpAttributes(element.element);
      element.element.querySelectorAll("*").forEach((e) => cleanUpAttributes(e));
      WebImporter.rules.adjustImageUrls(element.element, params.originalURL, params.originalURL);
      WebImporter.DOMUtils.remove(element.element, [
        "style",
        "source",
        "script",
        "noscript"
      ]);
      return element;
    })
  };
  return __toCommonJS(sections_mapping_lpb_import_exports);
})();
