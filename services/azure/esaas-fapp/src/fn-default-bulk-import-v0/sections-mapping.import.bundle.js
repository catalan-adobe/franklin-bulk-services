// Adobe Corp. internal project "webpage-blueprint-detector" - Author: catalan@adobe.com
(()=>{{let o=i=>{typeof i[0]=="string"&&!i[0].startsWith("[detect]")&&(i[0]=`[detect] ${i[0]}`)},e=console.log;console.log=(...i)=>{o(i),e(...i)},console.debug=(...i)=>{window.DEBUG&&(o(i),e(...i))};let n=console.warn;console.warn=(...i)=>{o(i),n(...i)};let t=console.error;console.error=(...i)=>{o(i),t(...i)}}function F(o){return o.toString(16)}function O(o,e,n,t){return F(o)+F(e)+F(n)+F(t)}var v=class o{constructor({r:e,g:n,b:t,a:i=1,name:s=""}){this.name=s,this.r=e,this.g=n,this.b=t,this.a=i}toHex(){return O(this.r,this.g,this.b,this.a)}static fromRGBA(e){let n=e.replace("rgba(","").replace(")","").split(",").map(t=>parseInt(t.trim()));return new o({r:n[0],g:n[1],b:n[2],a:n[3]})}toRGBA(){return`rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`}withAlpha(e){return new o({...this,a:e})}static random(e=!1){let n=Math.round(Math.random()*255),t=Math.round(Math.random()*255),i=Math.round(Math.random()*255),s=e?Math.random():1;return new o({name:`rand-${n}-${t}-${i}-${s}`,r:n,g:t,b:i,a:s})}static fromHex(e){let n=parseInt(e.substring(0,2),16),t=parseInt(e.substring(2,4),16),i=parseInt(e.substring(4,6),16),s=parseInt(e.substring(6,8),16);return new o({name:`hex-${n}-${t}-${i}-${s}`,r:n,g:t,b:i,a:s})}};function D(o,e){let n=Math.max(0,Math.min(o.x+o.width,e.x+e.width)-Math.max(o.x,e.x)),t=Math.max(0,Math.min(o.y+o.height,e.y+e.height)-Math.max(o.y,e.y)),i=n*t,s=e.width*e.height;return i/s*100}function M(o,e){let n=o.getBoundingClientRect();return{left:n.left+e.document.scrollingElement.scrollLeft,top:n.top+e.document.scrollingElement.scrollTop}}var x=class o{constructor(e,n,t,i,s){this.id=crypto.randomUUID(),this.x=Math.floor(e),this.y=Math.floor(n),this.width=Math.floor(t),this.height=Math.floor(i),this.div=s,this.children=[],this.prediction=null,this.layout=null}static fromDiv(e,n){let t=e.getBoundingClientRect(),i=M(e,n);return new o(i.left,i.top,t.width,t.height,e)}static areBoxesLaidOutAsGrid(e){console.log("areBoxesLaidOutAsGrid");try{if(e.length<2)return!1;let n=e.slice().sort((c,r)=>c.x-r.x||c.y-r.y),t=e.slice().sort((c,r)=>c.y-r.y||c.x-r.x);console.log(n),console.log(t);let i=[];for(let c=1;c<n.length;c++)i.push(n[c].x-n[c-1].x);if([...new Set(i)].length>1)return!1;let l=[];for(let c=1;c<t.length;c++)l.push(t[c].y-t[c-1].y);return!([...new Set(l)].length>1)}finally{return!0}}contains(e,n=!0){return n?e.x-e.width>=this.x-this.width&&e.x+e.width<=this.x+this.width&&e.y-e.height>=this.y-this.height&&e.y+e.height<=this.y+this.height:D(this,e)>75}intersects(e){return!(e.x-e.width>this.x+this.width||e.x+e.width<this.x-this.width||e.y-e.height>this.y+this.height||e.y+e.height<this.y-this.height)}isInside(e){return e.x-e.width<=this.x-this.width&&e.x+e.width>=this.x+this.width&&e.y-e.height<=this.y-this.height&&e.y+e.height>=this.y+this.height}addChild(e){this.children.push(e)}isChild(e){return this.children.some(this.isChild)}determineLayout(){if(this.layout={numCols:P(this.children),numRows:q(this.children)},this.layout.numCols>1){let e=[],n=this.children.slice().sort((t,i)=>t.y-i.y);for(let t=0;t<this.layout.numRows;t++){let i=n.slice(t*this.layout.numCols,(t+1)*this.layout.numCols);e.push(...i.slice().sort((s,l)=>s.x-l.x))}this.children=e}return this.layout}toJSONString(){function e(t){return{id:t.id,x:t.x,y:t.y,width:t.width,height:t.height,layout:t.layout,prediction:t.prediction,template:t.template,xpath:t.xpath,xpathWithDetails:t.xpathWithDetails,children:t.children.map(e)}}let n=e(this);return console.log(n),n}};function P(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.x-t.x).forEach(n=>{let t=n.x,i=n.x+n.width,s=e[e.length-1];s?t>=s-5&&e.push(i):e.push(i)}),e.length}function q(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.y-t.y).forEach(n=>{let t=n.y,i=n.y+n.height,s=e[e.length-1];s?t>=s-5&&e.push(i):e.push(i)}),e.length}var p=class o{static getXPath(e,n,t=!1){for(var i=n.getElementsByTagName("*"),s=[];e&&e.nodeType==1;e=e.parentNode)if(t)if(e.hasAttribute("id")){for(var l=0,a=0;a<i.length&&(i[a].hasAttribute("id")&&i[a].id==e.id&&l++,!(l>1));a++);if(l==1)return s.unshift('id("'+e.getAttribute("id")+'")'),s.join("/");s.unshift(e.localName.toLowerCase()+'[@id="'+e.getAttribute("id")+'"]')}else e.hasAttribute("class")&&s.unshift(e.localName.toLowerCase()+'[@class="'+[...e.classList].join(" ").trim()+'"]');else{for(var c=1,r=e.previousSibling;r;r=r.previousSibling)r.localName==e.localName&&(c+=1);s.unshift(e.localName.toLowerCase()+"["+c+"]")}return s.length?"/"+s.join("/"):null}static isVisible(e,n){if(!e)return!1;if(e.nodeType===n.Node.DOCUMENT_NODE)return!0;if(e.nodeType===n.Node.ELEMENT_NODE){let t=n.getComputedStyle(e);return t.display.includes("none")||t.visibility.includes("hidden")||t.opacity==="0"?!1:o.isVisible(e.parentNode,n)}}static isUserVisible(e,n){if(!o.isVisible(e,n))return!1;let t=e.getBoundingClientRect(),{width:i,height:s}=o.getPageSize(n.document);return!(t.height===0||t.width===0)}static getNSiblingsDivs(e,n,t=null){let i=t;isNaN(t)||(i=a=>a===t);let s="",l=[];e.querySelectorAll("div").forEach(a=>{let c=o.getXPath(a,n),r=c.substring(0,c.lastIndexOf("["));l[r]?l[r].push(a):l[r]=[a]});for(let a in l)if(i(l[a].length)){s=a;break}return l[s]||null}static getPageSize(e){var n=e.documentElement,t=e.body,i=Math.max(n.clientWidth,n.scrollWidth,n.offsetWidth,t.scrollWidth,t.offsetWidth),s=Math.max(n.clientHeight,n.scrollHeight,n.offsetHeight,t.scrollHeight,t.offsetHeight);return{width:i,height:s}}static getOffsetRect(e,n){let t=e.getBoundingClientRect(),i=n.document?.scrollingElement?.scrollLeft||0,s=n.document?.scrollingElement?.scrollTop||0;return{x:t.left+i,y:t.top+s,width:t.width,height:t.height}}static checkElStackUpCSSClasses(e,n){let t=e;for(;t;){if(t.classList.contains(n))return!0;t=t.parentElement}return!1}static getAllVisibleElements=(e=document.body,n)=>{let t=[...e.querySelectorAll("*")].filter(l=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(l.nodeName)).reduce((l,a,c)=>{var r=a.closest("svg");return!(r!==null&&r!==a)&&!l.includes(a.nodeName)&&l.push(a.nodeName),l},[]);console.debug("DOM node types:",t);let s=[...e.querySelectorAll(t.join(","))].filter(l=>o.isUserVisible(l,n));return console.log(`found ${s.length} visible elements in the page.`),s}};var C=class{constructor(...e){e.reduce((n,t,i)=>(n[t]=1<<i,n),this)}},w=class{#e=0;constructor(...e){this.#e=0,this.setFlags(...e)}get flag(){return this.#e}setFlags(...e){this.#e=e.reduce((n,t)=>n|t,0)}setFlag(e){this.#e|=e}unsetFlag(e){this.#e&=~e}isFlagSet(e){return(this.#e&e)!==0}areOnlyFlagsSet(...e){let n=e.reduce((t,i)=>t|i,0);return this.#e===n}getFlags(e){return Object.keys(e).filter(n=>this.isFlagSet(e[n]))}};function E(o){var e=0,n=o.length,t=0;if(n>0)for(;t<n;)e=(e<<5)-e+o.charCodeAt(t++)|0;return e}function b(o,...e){return(...n)=>{let t=n[n.length-1]||{},i=[o[0]];return e.forEach((s,l)=>{let a=Number.isInteger(s)?n[s]:t[s];i.push(a,o[l+1])}),i.join("")}}function I(o,e){let n=null,t=null;if(n=[...o.querySelectorAll("*")].some(a=>{let c=e.getComputedStyle(a),r=a.getBoundingClientRect(),u=c.backgroundImage||"none",d="none";if(d&&d.includes("rgba")&&Color.fromRGBA(d).a===0&&(d="none"),u.includes("none")&&d.includes("none"))return!1;if(u||d)return t=a,!0}),n)return t;let i=o.getBoundingClientRect(),s=i.width*i.height,l=[...o.querySelectorAll("img")].filter(a=>p.isUserVisible(a,e));if(l&&l.length===1){n=l.shift();let a=n.getBoundingClientRect();if(a.width*a.height>=s*.8)return n}return null}function R(o,e){let n=o.getBoundingClientRect(),t=n.width*n.height;if([...o.querySelectorAll("*")].filter(l=>{let a=l.getBoundingClientRect();return a.width*a.height>=t*.8}).find(l=>{let a=e.getComputedStyle(l);return a.backgroundImage&&!a.backgroundImage.includes("none")}))return!0;let s=[...o.querySelectorAll("img")].filter(l=>{let a=l.getBoundingClientRect(),c=a.width*a.height;return p.isUserVisible(l,e)&&c>=t*.8});return!!(s&&s.length===1)}var h=window.xp??{},k=class{constructor({sectionType:e,sectionFeatures:n,template:t,confidence:i}){this.sectionType=e,this.sectionFeatures=n,this.template=t,this.confidence=i}},$=[{name:"carousel",predictFn:(o,e,n,t,i)=>{console.log(o.div),console.groupCollapsed(">>> carousel");let s=p.getNSiblingsDivs(o.div,i.document,l=>l>=2);if(s){console.log("predict carousel"),console.log(s);let l={};s.forEach(c=>{let r=p.getXPath(c,i.document),u=[...c.querySelectorAll("div")].map(f=>p.getXPath(f,i.document).slice(r.length));console.log(u);let d=E(u.join(`
  `));console.log(d),l[d]?l[d].push(c):l[d]=[c]}),console.groupEnd();let a=Object.keys(l).filter(c=>l[c].length>1);if(l[a]){let c=!1,r=!1;if(l[a].forEach(u=>{let d=u.getBoundingClientRect();!p.isVisible(u,i)||d.x+d.width>i.innerWidth?r=!0:c=!0}),c&&r)return!0}return!1}return console.groupEnd(),!1}},{name:"cards",predictFn:(o,e,n,t,i)=>{console.groupCollapsed(">>> cards"),console.log(o.div),console.log(o.div.classList),console.log(o),console.log(o.children.every(l=>p.checkElStackUpCSSClasses(l.div,"card"))),console.log(p.checkElStackUpCSSClasses(o.div,"card")),console.log(t.isFlagSet(g.isGridLayout));let s=t.isFlagSet(g.isGridLayout)&&(o.div.classList.value.includes("card")||o.children.find(l=>l.div.querySelector('[class*="card"]')!==null)!==void 0);return console.log("aaa",s),console.groupEnd(),s}},{name:"columns",predictFn:(o,e,n,t,i)=>(console.log("flags",t.getFlags(g)),t.isFlagSet(g.isGridLayout))},{name:"hero",predictFn:(o,e,n,t,i)=>o.height<=i.innerHeight&&(t.isFlagSet(g.hasBackgroundImage)&&t.isFlagSet(g.hasHeading)||o.children.length===2&&o.children.some(s=>s.prediction?.sectionFeatures.includes("hasBackgroundImage"))&&o.children.some(s=>s.prediction?.sectionFeatures.includes("hasHeading")))},{name:"default-content",predictFn:(o,e,n,t,i)=>{let s=!0;[...o.div.querySelectorAll("img")].some(c=>{let r=c.getBoundingClientRect();return r.width>50&&r.height>50})&&(s=!1);let a=!o.children?.some(c=>(console.log(c.prediction?.sectionType),!["heading","text","text+icons"].includes(c.prediction?.sectionType)));return console.log("childrenOnlyTextLike",o,a),a&&(t.isFlagSet(g.hasTexts)&&!t.isFlagSet(g.hasImages)&&!t.isFlagSet(g.hasBackground)||!t.isFlagSet(g.isGridLayout)&&t.isFlagSet(g.hasTexts)&&s&&!t.isFlagSet(g.hasBackground))}}];h.DOM=p;h.Flags=C;h.FlagSet=w;function G(o,e){let n=e.document.createElement("a");document.body.appendChild(n);let t=e.getComputedStyle(n);return[...o.querySelectorAll("a")].find(s=>{if(["background","background-color","background-image"].find(c=>{let r=e.getComputedStyle(s);return console.log(c,r[c],t[c]),r[c]!==t[c]}))return console.log("hasBackground"),!0;let a=0;return["left","right","top","bottom"].forEach(c=>{let r=e.getComputedStyle(s).getPropertyValue(`border-${c}-style`);console.log(c,r,t[`border-${c}-style`]),r!==t[`border-${c}-style`]&&a++}),a>1?(console.log("bordersNum"),!0):!1})!==void 0}var U=[new v({name:"violet",r:148,g:0,b:211}),new v({name:"indigo",r:75,g:0,b:130}),new v({name:"blue",r:0,g:0,b:255}),new v({name:"green",r:0,g:255,b:0}),new v({name:"yellow",r:255,g:255,b:0}),new v({name:"orange",r:255,g:127,b:0}),new v({name:"red",r:255,g:0,b:0})];h.filterDivs=o=>{let e=o.filter(t=>{let i=t.getBoundingClientRect(),{width:s,height:l}=p.getPageSize();return!t.classList.contains("xp-ui")&&!t.closest(".xp-ui")&&i.width!==0&&i.height!==0&&i.width*i.height>5e3&&i.width*i.height<.8*s*l&&p.isVisible(t,window)});console.log(e.length),console.log(e.map(t=>t));let n=e.filter(t=>{let i=t.parentElement;for(;i;){let s=t.getBoundingClientRect(),l=i.getBoundingClientRect();if(l.width===0||l.height===0){i=i.parentElement;continue}if(s.width>=.9*l.width&&s.height>=.9*l.height)return!1;i=i.parentElement}return!0});return console.log(n.length),console.log(n.map(t=>t)),n};var z=b`position:absolute;z-index:10000000;left:${0}px;top:${1}px;width:${2}px;height:${3}px;border:2px solid ${4};`,A=(o,{window:e,target:n=document.body,padding:t=0,color:i=null,label:s=null})=>{let l=i||"rgba(0, 0, 255, 1)",a=p.getOffsetRect(o.div,e),r=n.closest("body").getBoundingClientRect().y||0,u=document.createElement("div");u.dataset.boxId=o.id,u.dataset.boxXpath=o.xpath,u.dataset.boxXpathWithDetails=o.xpathWithDetails,u.dataset.layout=JSON.stringify(o.layout);let d=(({id:f,x:y,y:S,width:m,height:T,xpath:N,layout:H})=>({id:f,x:y,y:S,width:m,height:T,xpath:N,layout:H}))(o);if((o.layout.numCols>1||o.layout.numRows>1)&&(d.childrenXpaths=o.children.map(f=>({xpath:f.xpath,xpathWithDetails:f.xpathWithDetails}))),u.dataset.boxData=JSON.stringify(d),u.className="xp-overlay",u.style=z(a.x+t,a.y+t-r,a.width-t*2-4,a.height-t*2-4,l),s){let f=e.document.createElement("div");f.className="xp-overlay-label",f.textContent=s,u.appendChild(f)}n.appendChild(u)};function L(o,e,n=0,t=U,i=null,s=0){o.forEach((l,a)=>{let c=i||t[a%(t.length-1)],r=s===0?1:Math.max(.1,.5-s*.1),u=c.withAlpha(r).toRGBA();l.color=u,A(l,{window:e,target:e.document.body,padding:n,color:u,label:`layout: ${l.layout.numCols}x${l.layout.numRows}`}),l.children.length>0&&L(l.children,e,n+4,t,c,s+1)})}var g=new C("isFromRootBox","hasHeader","hasTexts","hasBackground","hasBackgroundImage","hasHeading","hasCTA","hasImages","hasMultipleColumns","hasMultipleRows","isGridLayout","isInsideAHeaderLikeElement","isInsideAFooterLikeElement");function B(o,e,n=null,t,i=!0){if(o.ignored)return null;let s="unknown",l=new w,a=o.div;if(i&&l.setFlag(g.isFromRootBox),a){let r=a.cloneNode(!0);r.querySelectorAll("script, style, link, meta, noscript").forEach(T=>T.remove()),r.textContent.replaceAll(" ","").replaceAll(`
  `,"").trim().length>0&&l.setFlag(g.hasTexts),([...a.querySelectorAll("img, picture, svg")].length>0||["IMG","PICTURE","SVG"].includes(a.nodeName))&&l.setFlag(g.hasImages),!!I(o.div,t)&&l.setFlag(g.hasBackground),(o.div&&o.div.nodeName==="IMG"||R(o.div,t))&&l.setFlag(g.hasBackgroundImage),([...a.querySelectorAll("h1, h2, h3, h4, h5, h6")].length>0||["H1","H2","H3","H4","H5","H6"].includes(a.nodeName))&&l.setFlag(g.hasHeading),G(a,t)&&l.setFlag(g.hasCTA);let m=o.determineLayout();m.numRows>1&&l.setFlag(g.hasMultipleRows),m.numCols>1&&l.setFlag(g.hasMultipleColumns),m.numCols>1&&x.areBoxesLaidOutAsGrid(o.children)&&l.setFlag(g.isGridLayout),(a.closest("header, .header, #header")||p.checkElStackUpCSSClasses(a,"header")||o.x===0&&o.y===0)&&l.setFlag(g.isInsideAHeaderLikeElement),(a.closest("footer, .footer, #footer")||p.checkElStackUpCSSClasses(a,"footer"))&&l.setFlag(g.isInsideAFooterLikeElement)}let c=o.children;if(c.forEach((...r)=>{B(...r,t,!1)}),!i){let r=$.find(u=>u.predictFn(o,e,null,l,t));r&&(s=r.name)}if(c.length===0&&l.isFlagSet(g.isFromRootBox)&&e===0||c.length>0&&c.every(r=>r.prediction.sectionFeatures.includes("isInsideAHeaderLikeElement"))?s="header":c.length>0&&c.every(r=>r.prediction.sectionFeatures.includes("isInsideAFooterLikeElement"))&&(s="footer"),o.prediction=new k({sectionType:s,sectionFeatures:l.getFlags(g),confidence:-1}),console.group("prediction"),console.log("prediction"),console.log(l.getFlags(g)),console.log(a),console.log("section prediction:",o.prediction),console.groupEnd(),i){let r=function(y,S){return y.children.find(m=>m.prediction.sectionType===S?!0:r(m))},u=function(y,S){let m=y.children.slice(S)[0];return!m||m.children.length===0?y.div?y:m:u(m,S)};if(!r(o,"header")){let y=u(o,0);y&&(y.prediction=new k({sectionType:"header",sectionFeatures:y.prediction.sectionFeatures,confidence:-1}))}if(!r(o,"footer")){let y=u(o,-1);y&&(y.prediction=new k({sectionType:"footer",sectionFeatures:y.prediction.sectionFeatures,confidence:-1}))}}return o.prediction}function X(){let o=[...document.body.querySelectorAll("*")].filter(t=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(t.nodeName)).reduce((t,i,s)=>{var l=i.closest("svg");return!(l!==null&&l!==i)&&!t.includes(i.nodeName)&&t.push(i.nodeName),t},[]);console.log("DOM node types:",o);let e=[...document.querySelectorAll(o.join(","))],n=h.filterDivs(e);return console.log(`found ${n.length} visible divs to show!`),n}h.getAllVisibleDivs=X;h.buildBoxTree=(o,e)=>{let n=new x(0,0,e.innerWidth,e.document.scrollingElement.scrollHeight),t=o.map(r=>x.fromDiv(r,e)).sort((r,u)=>r.y-u.y);function i(r,u,d){u.forEach((f,y)=>{if(d.has(y))return;if(r.contains(f,!1)){let m=f;r.addChild(m),d.add(y),i(m,u,d)}})}i(n,t,new Set);function s(r){r.determineLayout(),r.children.forEach(s)}s(n);function l(r){if(r.children.length===1&&r.layout.numCols===1){let u=r.children[0];r.children=u.children,l(r),r.determineLayout()}else r.children.forEach(l)}l(n);function a(r){r.children.length>1&&r.layout.numCols===1&&r.children.every(u=>u.layout.numRows===0&&u.layout.numCols===0)?(r.children=[],a(r),r.determineLayout()):r.children.forEach(a)}a(n);function c(r){if(r.children.length>1){let u=r.children[0].layout.numCols;if(r.layout.numRows>1&&r.layout.numCols===1&&r.children.every(d=>d.layout.numRows===1&&d.layout.numCols>1&&d.layout.numCols===u)){console.log("mergeMultiSingleRowColums",r);let d=[];r.children.forEach(f=>{d.push(...f.children)}),r.children=d,r.determineLayout()}else r.children.forEach(c)}}return c(n),s(n),n};h.getVerticalBoxesFromHierarchy=(o,e=!0)=>{let n={...o};function t(i){let s=i.children;if(s.some(a=>s.some(c=>a!==c&&!a.isInside(c)&&(a.x>=c.x+c.width||a.x+a.width<=c.x)))){i.setChildren([]);return}else for(let a=0;a<s.length;a++)t(s[a])}return t(n),n.children};h.boxes=null;h.selectElementToIgnore=()=>{document.body.style.cursor="crosshair",h.ui.overlaysDiv().addEventListener("click",e=>{let n=e.target;n.classList.contains("xp-overlay")&&n.remove(),h.ignoreElementForDection(n.dataset.boxId),document.body.style.removeProperty("cursor")},{once:!0})};h.ignoreElementForDection=o=>{function e(n){if(n.id===o){let t=function(i){[...h.ui.overlaysDiv().querySelectorAll(".xp-overlay")].forEach(l=>{l.dataset.boxId===i.id&&l.remove()}),i.children.forEach(t)};return n.ignored=!0,t(n),!0}else return n.children.some(e)}e(h.boxes)};h.predictPage=o=>{if(h.boxes?.children?.length>0){let n=function(i){i.ignored||(i.prediction&&i.prediction.sectionType!=="unknown"||i.prediction&&i.prediction.sectionType==="unknown"&&i.children.length===0?(e.push(i),console.warn(i.div,i.prediction),h.ui&&A(i,{window:o,padding:0,color:"rgba(0, 255, 0, 1)",label:i.prediction.sectionType})):i.children.forEach(n))};h.ui?.resetOverlays(),B(h.boxes,0,null,o);let e=[];n(h.boxes);let t=h.boxes.children.map(i=>{let s=[p.getXPath(i.div,document)];return s.push(...i.children.map(l=>"- "+p.getXPath(l.div,document))),s.join(`
  `)||""}).join(`
  `)||"";return h.boxes.template={raw:t,hash:E(t)},h.predictedBoxes=e,console.log("final boxes",h.boxes),console.log("predicted boxes",h.predictedBoxes),h.ui?.toggleOverlays(!0),h.boxes}};h.detectSections=async(o,e,n={autoDetect:!1})=>{h.ui?.resetOverlays();let{document:t}=e,i=p.getAllVisibleElements(o,e);console.log("visible divs",i),i=i.filter(c=>{let r=c.getBoundingClientRect();return r.width*r.height>1e4}),console.log("filtered divs",i);let s=h.buildBoxTree(i,e);console.log("boxes hierarchy",s);function l(c,r){c.div&&(c.xpath=p.getXPath(c.div,r),c.xpathWithDetails=p.getXPath(c.div,r,!0),c.id=`box-id-${E(c.xpath)}`),c.children&&c.children.length>0&&c.children.forEach(u=>l(u,r))}l(s,t),h.boxes=s;let a=s.children.map(c=>{let r=[c.xpath];return r.push(...c.children.map(u=>"- "+u.xpath)),r.join(`
  `)||""}).join(`
  `)||"";if(console.log("template",a),h.template={raw:a,hash:E(a)},!n.autoDetect)L(s.children,e);else if(h.boxes?.children?.length>0){let r=function(d){d.ignored||(d.prediction&&d.prediction.sectionType!=="unknown"||d.prediction&&d.prediction.sectionType==="unknown"&&d.children.length===0?c.push(d):d.children.forEach(r))};B(h.boxes,0,null,e);let c=[];r(h.boxes),c.forEach((d,f)=>{f===0?d.prediction.sectionType="header":f===c.length-1&&(d.prediction.sectionType="footer"),A(d,{window:e,target:e.document.body,padding:0,color:d.color,label:d.prediction.sectionType})});let u=h.boxes.children.map(d=>{let f=[p.getXPath(d.div,t)];return f.push(...d.children.map(y=>"- "+p.getXPath(y.div,t))),f.join(`
  `)||""}).join(`
  `)||"";h.boxes.template={raw:u,hash:E(u)},h.boxes.predictedBoxes=c,console.log("final boxes",h.boxes),h.ui?.toggleOverlays(!0)}return h.ui?.toggleOverlays(!0),h.boxes};window.xp=h;})();
    
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
    const children = mapping.childrenXpaths.reduce(
      (acc, c) => {
        console.log("columnsParser - child XPath", c.xpath);
        colsCtr += 1;
        const cEl = getElementByXpath(document2, c.xpath);
        if (!cEl) {
          console.warn("element not found", c.section, c.xpath);
        } else {
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
      var _a, _b, _c;
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
      document2.querySelectorAll("#onetrust-consent-sdk, #ot-sdk-btn").forEach((el) => el.remove());
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
      const sections = yield window.xp.detectSections(
        document2.body,
        window,
        { autoDetect: true }
      );
      window.detectedSections = sections;
      const predictedBoxes = sections.predictedBoxes.map((b) => ({
        id: b.id,
        div: b.div,
        color: "rgba(0, 0, 255, 1)",
        width: b.width,
        height: b.height,
        xpath: b.xpath,
        childrenXpaths: b.layout.numCols > 1 || b.layout.numRows > 1 ? b.children.map((child) => ({
          xpath: child.xpath,
          xpathWithDetails: child.xpathWithDetails
        })) : null,
        layout: b.layout,
        x: b.x,
        y: b.y,
        prediction: b.prediction,
        mapping: DETECTED_SECTIONS_BLOCKS_MAPPING[b.prediction.sectionType] || "unset"
      }));
      console.log("predictedBoxes", predictedBoxes);
      document2.body.querySelectorAll(":scope > div[data-box-id]").forEach((el) => {
        el.remove();
      });
      const searchParams = new URLSearchParams(window.location.search);
      const esaasImpId = searchParams.get("esaasImpId");
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
          const el = document2.createElement("div");
          predictedBoxes.filter((s) => s.mapping === "footer").forEach((s) => {
            el.appendChild(s.div);
          });
          if (el.children.length === 0) {
            el.appendChild(predictedBoxes[predictedBoxes.length - 1].div);
          }
          element.element = el;
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
