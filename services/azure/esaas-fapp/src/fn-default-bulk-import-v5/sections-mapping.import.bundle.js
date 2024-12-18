(()=>{{let o=i=>{typeof i[0]=="string"&&!i[0].startsWith("[detect]")&&(i[0]=`[detect] ${i[0]}`)},e=console.log;console.log=(...i)=>{o(i),e(...i)},console.debug=(...i)=>{window.DEBUG&&(o(i),e(...i))};let n=console.warn;console.warn=(...i)=>{o(i),n(...i)};let t=console.error;console.error=(...i)=>{o(i),t(...i)}}function b(o){return o.toString(16)}function O(o,e,n,t){return b(o)+b(e)+b(n)+b(t)}var v=class o{constructor({r:e,g:n,b:t,a:i=1,name:r=""}){this.name=r,this.r=e,this.g=n,this.b=t,this.a=i}toHex(){return O(this.r,this.g,this.b,this.a)}static fromRGBA(e){let n=e.replace("rgba(","").replace(")","").split(",").map(t=>parseInt(t.trim()));return new o({r:n[0],g:n[1],b:n[2],a:n[3]})}toRGBA(){return`rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`}withAlpha(e){return new o({...this,a:e})}static random(e=!1){let n=Math.round(Math.random()*255),t=Math.round(Math.random()*255),i=Math.round(Math.random()*255),r=e?Math.random():1;return new o({name:`rand-${n}-${t}-${i}-${r}`,r:n,g:t,b:i,a:r})}static fromHex(e){let n=parseInt(e.substring(0,2),16),t=parseInt(e.substring(2,4),16),i=parseInt(e.substring(4,6),16),r=parseInt(e.substring(6,8),16);return new o({name:`hex-${n}-${t}-${i}-${r}`,r:n,g:t,b:i,a:r})}};function D(o,e){let n=Math.max(0,Math.min(o.x+o.width,e.x+e.width)-Math.max(o.x,e.x)),t=Math.max(0,Math.min(o.y+o.height,e.y+e.height)-Math.max(o.y,e.y)),i=n*t,r=e.width*e.height;return i/r*100}function M(o,e){let n=o.getBoundingClientRect();return{left:n.left+e.document.scrollingElement.scrollLeft,top:n.top+e.document.scrollingElement.scrollTop}}var S=class o{constructor(e,n,t,i,r){this.id=crypto.randomUUID(),this.x=Math.floor(e),this.y=Math.floor(n),this.width=Math.floor(t),this.height=Math.floor(i),this.div=r,this.children=[],this.prediction=null,this.layout=null}static fromDiv(e,n){let t=e.getBoundingClientRect(),i=M(e,n);return new o(i.left,i.top,t.width,t.height,e)}static areBoxesLaidOutAsGrid(e){console.log("areBoxesLaidOutAsGrid");try{if(e.length<2)return!1;let n=e.slice().sort((c,l)=>c.x-l.x||c.y-l.y),t=e.slice().sort((c,l)=>c.y-l.y||c.x-l.x);console.log(n),console.log(t);let i=[];for(let c=1;c<n.length;c++)i.push(n[c].x-n[c-1].x);if([...new Set(i)].length>1)return!1;let s=[];for(let c=1;c<t.length;c++)s.push(t[c].y-t[c-1].y);return!([...new Set(s)].length>1)}finally{return!0}}contains(e,n=!0){return n?e.x-e.width>=this.x-this.width&&e.x+e.width<=this.x+this.width&&e.y-e.height>=this.y-this.height&&e.y+e.height<=this.y+this.height:D(this,e)>75}intersects(e){return!(e.x-e.width>this.x+this.width||e.x+e.width<this.x-this.width||e.y-e.height>this.y+this.height||e.y+e.height<this.y-this.height)}isInside(e){return e.x-e.width<=this.x-this.width&&e.x+e.width>=this.x+this.width&&e.y-e.height<=this.y-this.height&&e.y+e.height>=this.y+this.height}addChild(e){this.children.push(e)}isChild(e){return this.children.some(this.isChild)}determineLayout(){if(this.layout={numCols:P(this.children),numRows:q(this.children)},this.layout.numCols>1){let e=[],n=this.children.slice().sort((t,i)=>t.y-i.y);for(let t=0;t<this.layout.numRows;t++){let i=n.slice(t*this.layout.numCols,(t+1)*this.layout.numCols);e.push(...i.slice().sort((r,s)=>r.x-s.x))}this.children=e}return this.layout}toJSONString(){function e(t){return{id:t.id,x:t.x,y:t.y,width:t.width,height:t.height,layout:t.layout,prediction:t.prediction,template:t.template,xpath:t.xpath,xpathWithDetails:t.xpathWithDetails,children:t.children.map(e)}}let n=e(this);return console.log(n),n}};function P(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.x-t.x).forEach(n=>{let t=n.x,i=n.x+n.width,r=e[e.length-1];r?t>=r-5&&e.push(i):e.push(i)}),e.length}function q(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.y-t.y).forEach(n=>{let t=n.y,i=n.y+n.height,r=e[e.length-1];r?t>=r-5&&e.push(i):e.push(i)}),e.length}var p=class o{static getXPath(e,n,t=!1){for(var i=n.getElementsByTagName("*"),r=[];e&&e.nodeType==1;e=e.parentNode)if(t)if(e.hasAttribute("id")){for(var s=0,a=0;a<i.length&&(i[a].hasAttribute("id")&&i[a].id==e.id&&s++,!(s>1));a++);if(s==1)return r.unshift('id("'+e.getAttribute("id")+'")'),r.join("/");r.unshift(e.localName.toLowerCase()+'[@id="'+e.getAttribute("id")+'"]')}else e.hasAttribute("class")&&r.unshift(e.localName.toLowerCase()+'[@class="'+[...e.classList].join(" ").trim()+'"]');else{for(var c=1,l=e.previousSibling;l;l=l.previousSibling)l.localName==e.localName&&(c+=1);r.unshift(e.localName.toLowerCase()+"["+c+"]")}return r.length?"/"+r.join("/"):null}static isVisible(e,n){if(!e)return!1;if(e.nodeType===n.Node.DOCUMENT_NODE)return!0;if(e.nodeType===n.Node.ELEMENT_NODE){let t=n.getComputedStyle(e);return t.display.includes("none")||t.visibility.includes("hidden")||t.opacity==="0"?!1:o.isVisible(e.parentNode,n)}}static isUserVisible(e,n){if(!o.isVisible(e,n))return!1;let t=e.getBoundingClientRect(),{width:i,height:r}=o.getPageSize(n.document);return!(t.height===0||t.width===0)}static getNSiblingsDivs(e,n,t=null){let i=t;isNaN(t)||(i=a=>a===t);let r="",s=[];e.querySelectorAll("div").forEach(a=>{let c=o.getXPath(a,n),l=c.substring(0,c.lastIndexOf("["));s[l]?s[l].push(a):s[l]=[a]});for(let a in s)if(i(s[a].length)){r=a;break}return s[r]||null}static getPageSize(e){var n=e.documentElement,t=e.body,i=Math.max(n.clientWidth,n.scrollWidth,n.offsetWidth,t.scrollWidth,t.offsetWidth),r=Math.max(n.clientHeight,n.scrollHeight,n.offsetHeight,t.scrollHeight,t.offsetHeight);return{width:i,height:r}}static getOffsetRect(e,n){let t=e.getBoundingClientRect(),i=n.document?.scrollingElement?.scrollLeft||0,r=n.document?.scrollingElement?.scrollTop||0;return{x:t.left+i,y:t.top+r,width:t.width,height:t.height}}static checkElStackUpCSSClasses(e,n){let t=e;for(;t;){if(t.classList.contains(n))return!0;t=t.parentElement}return!1}static getAllVisibleElements=(e=document.body,n)=>{let t=[...e.querySelectorAll("*")].filter(s=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(s.nodeName)).reduce((s,a,c)=>{var l=a.closest("svg");return!(l!==null&&l!==a)&&!s.includes(a.nodeName)&&s.push(a.nodeName),s},[]);console.debug("DOM node types:",t);let r=[...e.querySelectorAll(t.join(","))].filter(s=>o.isUserVisible(s,n));return console.log(`found ${r.length} visible elements in the page.`),r}};var C=class{constructor(...e){e.reduce((n,t,i)=>(n[t]=1<<i,n),this)}},w=class{#e=0;constructor(...e){this.#e=0,this.setFlags(...e)}get flag(){return this.#e}setFlags(...e){this.#e=e.reduce((n,t)=>n|t,0)}setFlag(e){this.#e|=e}unsetFlag(e){this.#e&=~e}isFlagSet(e){return(this.#e&e)!==0}areOnlyFlagsSet(...e){let n=e.reduce((t,i)=>t|i,0);return this.#e===n}getFlags(e){return Object.keys(e).filter(n=>this.isFlagSet(e[n]))}};function E(o){var e=0,n=o.length,t=0;if(n>0)for(;t<n;)e=(e<<5)-e+o.charCodeAt(t++)|0;return e}function B(o,...e){return(...n)=>{let t=n[n.length-1]||{},i=[o[0]];return e.forEach((r,s)=>{let a=Number.isInteger(r)?n[r]:t[r];i.push(a,o[s+1])}),i.join("")}}function I(o,e){let n=null,t=null;if(n=[...o.querySelectorAll("*")].some(a=>{let c=e.getComputedStyle(a),l=a.getBoundingClientRect(),d=c.backgroundImage||"none",u="none";if(u&&u.includes("rgba")&&Color.fromRGBA(u).a===0&&(u="none"),d.includes("none")&&u.includes("none"))return!1;if(d||u)return t=a,!0}),n)return t;let i=o.getBoundingClientRect(),r=i.width*i.height,s=[...o.querySelectorAll("img")].filter(a=>p.isUserVisible(a,e));if(s&&s.length===1){n=s.shift();let a=n.getBoundingClientRect();if(a.width*a.height>=r*.8)return n}return null}function R(o,e){let n=o.getBoundingClientRect(),t=n.width*n.height;if([...o.querySelectorAll("*")].filter(s=>{let a=s.getBoundingClientRect();return a.width*a.height>=t*.8}).find(s=>{let a=e.getComputedStyle(s);return a.backgroundImage&&!a.backgroundImage.includes("none")}))return!0;let r=[...o.querySelectorAll("img")].filter(s=>{let a=s.getBoundingClientRect(),c=a.width*a.height;return p.isUserVisible(s,e)&&c>=t*.8});return!!(r&&r.length===1)}var h=window.xp??{},k=class{constructor({sectionType:e,sectionFeatures:n,template:t,confidence:i}){this.sectionType=e,this.sectionFeatures=n,this.template=t,this.confidence=i}},$=[{name:"carousel",predictFn:(o,e,n,t,i)=>{console.log(o.div),console.groupCollapsed(">>> carousel");let r=p.getNSiblingsDivs(o.div,i.document,s=>s>=2);if(r){console.log("predict carousel"),console.log(r);let s={};r.forEach(c=>{let l=p.getXPath(c,i.document),d=[...c.querySelectorAll("div")].map(f=>p.getXPath(f,i.document).slice(l.length));console.log(d);let u=E(d.join(`
  `));console.log(u),s[u]?s[u].push(c):s[u]=[c]}),console.groupEnd();let a=Object.keys(s).filter(c=>s[c].length>1);if(s[a]){let c=!1,l=!1;if(s[a].forEach(d=>{let u=d.getBoundingClientRect();!p.isVisible(d,i)||u.x+u.width>i.innerWidth?l=!0:c=!0}),c&&l)return!0}return!1}return console.groupEnd(),!1}},{name:"cards",predictFn:(o,e,n,t,i)=>{console.groupCollapsed(">>> cards"),console.log(o.div),console.log(o.div.classList),console.log(o),console.log(o.children.every(s=>p.checkElStackUpCSSClasses(s.div,"card"))),console.log(p.checkElStackUpCSSClasses(o.div,"card")),console.log(t.isFlagSet(g.isGridLayout));let r=t.isFlagSet(g.isGridLayout)&&(o.div.classList.value.includes("card")||o.children.find(s=>s.div.querySelector('[class*="card"]')!==null)!==void 0);return console.log("aaa",r),console.groupEnd(),r}},{name:"columns",predictFn:(o,e,n,t,i)=>(console.log("flags",t.getFlags(g)),t.isFlagSet(g.isGridLayout))},{name:"hero",predictFn:(o,e,n,t,i)=>o.height<=i.innerHeight&&t.isFlagSet(g.hasBackgroundImage)&&t.isFlagSet(g.hasHeading)},{name:"default-content",predictFn:(o,e,n,t,i)=>{let r=!0;[...o.div.querySelectorAll("img")].some(c=>{let l=c.getBoundingClientRect();return l.width>50&&l.height>50})&&(r=!1);let a=!o.children.some(c=>(console.log(c.prediction?.sectionType),!["heading","text","text+icons"].includes(c.prediction?.sectionType)));return console.log("childrenOnlyTextLike",a),t.isFlagSet(g.hasTexts)&&!t.isFlagSet(g.hasImages)&&!t.isFlagSet(g.hasBackground)||!t.isFlagSet(g.isGridLayout)&&a&&t.isFlagSet(g.hasTexts)&&r&&!t.isFlagSet(g.hasBackground)}}];h.DOM=p;h.Flags=C;h.FlagSet=w;function G(o,e){let n=e.document.createElement("a");document.body.appendChild(n);let t=e.getComputedStyle(n);return[...o.querySelectorAll("a")].find(r=>{if(["background","background-color","background-image"].find(c=>{let l=e.getComputedStyle(r);return console.log(c,l[c],t[c]),l[c]!==t[c]}))return console.log("hasBackground"),!0;let a=0;return["left","right","top","bottom"].forEach(c=>{let l=e.getComputedStyle(r).getPropertyValue(`border-${c}-style`);console.log(c,l,t[`border-${c}-style`]),l!==t[`border-${c}-style`]&&a++}),a>1?(console.log("bordersNum"),!0):!1})!==void 0}var U=[new v({name:"violet",r:148,g:0,b:211}),new v({name:"indigo",r:75,g:0,b:130}),new v({name:"blue",r:0,g:0,b:255}),new v({name:"green",r:0,g:255,b:0}),new v({name:"yellow",r:255,g:255,b:0}),new v({name:"orange",r:255,g:127,b:0}),new v({name:"red",r:255,g:0,b:0})];h.filterDivs=o=>{let e=o.filter(t=>{let i=t.getBoundingClientRect(),{width:r,height:s}=p.getPageSize();return!t.classList.contains("xp-ui")&&!t.closest(".xp-ui")&&i.width!==0&&i.height!==0&&i.width*i.height>5e3&&i.width*i.height<.8*r*s&&p.isVisible(t,window)});console.log(e.length),console.log(e.map(t=>t));let n=e.filter(t=>{let i=t.parentElement;for(;i;){let r=t.getBoundingClientRect(),s=i.getBoundingClientRect();if(s.width===0||s.height===0){i=i.parentElement;continue}if(r.width>=.9*s.width&&r.height>=.9*s.height)return!1;i=i.parentElement}return!0});return console.log(n.length),console.log(n.map(t=>t)),n};var z=B`position:absolute;z-index:10000000;left:${0}px;top:${1}px;width:${2}px;height:${3}px;border:2px solid ${4};`,A=(o,{window:e,target:n=document.body,padding:t=0,color:i=null,label:r=null})=>{let s=i||"rgba(0, 0, 255, 1)",a=p.getOffsetRect(o.div,e),l=n.closest("body").getBoundingClientRect().y||0,d=document.createElement("div");d.dataset.boxId=o.id,d.dataset.boxXpath=o.xpath,d.dataset.boxXpathWithDetails=o.xpathWithDetails,d.dataset.layout=JSON.stringify(o.layout);let u=(({id:f,x:y,y:x,width:m,height:F,xpath:N,layout:H})=>({id:f,x:y,y:x,width:m,height:F,xpath:N,layout:H}))(o);if((o.layout.numCols>1||o.layout.numRows>1)&&(u.childrenXpaths=o.children.map(f=>({xpath:f.xpath,xpathWithDetails:f.xpathWithDetails}))),d.dataset.boxData=JSON.stringify(u),d.className="xp-overlay",d.style=z(a.x+t,a.y+t-l,a.width-t*2-4,a.height-t*2-4,s),r){let f=e.document.createElement("div");f.className="xp-overlay-label",f.textContent=r,d.appendChild(f)}n.appendChild(d)};function L(o,e,n=0,t=U,i=null,r=0){o.forEach((s,a)=>{let c=i||t[a%(t.length-1)],l=r===0?1:Math.max(.1,.5-r*.1),d=c.withAlpha(l).toRGBA();s.color=d,A(s,{window:e,target:e.document.body,padding:n,color:d,label:`layout: ${s.layout.numCols}x${s.layout.numRows}`}),s.children.length>0&&L(s.children,e,n+4,t,c,r+1)})}var g=new C("isFromRootBox","hasHeader","hasTexts","hasBackground","hasBackgroundImage","hasHeading","hasCTA","hasImages","hasMultipleColumns","hasMultipleRows","isGridLayout","isInsideAHeaderLikeElement","isInsideAFooterLikeElement");function T(o,e,n=null,t,i=!0){if(o.ignored)return null;let r="unknown",s=new w,a=o.div;if(i&&s.setFlag(g.isFromRootBox),a){let l=a.cloneNode(!0);l.querySelectorAll("script, style, link, meta, noscript").forEach(F=>F.remove()),l.textContent.replaceAll(" ","").replaceAll(`
  `,"").trim().length>0&&s.setFlag(g.hasTexts),([...a.querySelectorAll("img, picture, svg")].length>0||["IMG","PICTURE","SVG"].includes(a.nodeName))&&s.setFlag(g.hasImages),!!I(o.div,t)&&s.setFlag(g.hasBackground),R(o.div,t)&&s.setFlag(g.hasBackgroundImage),([...a.querySelectorAll("h1, h2, h3, h4, h5, h6")].length>0||["H1","H2","H3","H4","H5","H6"].includes(a.nodeName))&&s.setFlag(g.hasHeading),G(a,t)&&s.setFlag(g.hasCTA);let m=o.determineLayout();m.numRows>1&&s.setFlag(g.hasMultipleRows),m.numCols>1&&s.setFlag(g.hasMultipleColumns),m.numCols>1&&S.areBoxesLaidOutAsGrid(o.children)&&s.setFlag(g.isGridLayout),(a.closest("header, .header, #header")||p.checkElStackUpCSSClasses(a,"header"))&&s.setFlag(g.isInsideAHeaderLikeElement),(a.closest("footer, .footer, #footer")||p.checkElStackUpCSSClasses(a,"footer"))&&s.setFlag(g.isInsideAFooterLikeElement)}let c=o.children;if(c.forEach((...l)=>{T(...l,t,!1)}),!i){let l=$.find(d=>d.predictFn(o,e,null,s,t));l&&(r=l.name)}if(c.length===0&&s.isFlagSet(g.isFromRootBox)&&e===0||c.length>0&&c.every(l=>l.prediction.sectionFeatures.includes("isInsideAHeaderLikeElement"))?r="header":c.length>0&&c.every(l=>l.prediction.sectionFeatures.includes("isInsideAFooterLikeElement"))&&(r="footer"),o.prediction=new k({sectionType:r,sectionFeatures:s.getFlags(g),confidence:-1}),console.group("prediction"),console.log("prediction"),console.log(s.getFlags(g)),console.log(a),console.log("section prediction:",o.prediction),console.groupEnd(),i){let l=function(y,x){return y.children.find(m=>m.prediction.sectionType===x?!0:l(m))},d=function(y,x){let m=y.children.slice(x)[0];return!m||m.children.length===0?y.div?y:m:d(m,x)};if(!l(o,"header")){let y=d(o,0);y&&(y.prediction=new k({sectionType:"header",sectionFeatures:y.prediction.sectionFeatures,confidence:-1}))}if(!l(o,"footer")){let y=d(o,-1);y&&(y.prediction=new k({sectionType:"footer",sectionFeatures:y.prediction.sectionFeatures,confidence:-1}))}}return o.prediction}function X(){let o=[...document.body.querySelectorAll("*")].filter(t=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(t.nodeName)).reduce((t,i,r)=>{var s=i.closest("svg");return!(s!==null&&s!==i)&&!t.includes(i.nodeName)&&t.push(i.nodeName),t},[]);console.log("DOM node types:",o);let e=[...document.querySelectorAll(o.join(","))],n=h.filterDivs(e);return console.log(`found ${n.length} visible divs to show!`),n}h.getAllVisibleDivs=X;h.buildBoxTree=(o,e)=>{let n=new S(0,0,e.innerWidth,e.document.scrollingElement.scrollHeight),t=o.map(l=>S.fromDiv(l,e)).sort((l,d)=>l.y-d.y);function i(l,d,u){d.forEach((f,y)=>{if(u.has(y))return;if(l.contains(f,!1)){let m=f;l.addChild(m),u.add(y),i(m,d,u)}})}i(n,t,new Set);function r(l){l.determineLayout(),l.children.forEach(r)}r(n);function s(l){if(l.children.length===1&&l.layout.numCols===1){let d=l.children[0];l.children=d.children,s(l),l.determineLayout()}else l.children.forEach(s)}s(n);function a(l){l.children.length>1&&l.layout.numCols===1&&l.children.every(d=>d.layout.numRows===0&&d.layout.numCols===0)?(l.children=[],a(l),l.determineLayout()):l.children.forEach(a)}a(n);function c(l){if(l.children.length>1){let d=l.children[0].layout.numCols;if(l.layout.numRows>1&&l.layout.numCols===1&&l.children.every(u=>u.layout.numRows===1&&u.layout.numCols>1&&u.layout.numCols===d)){console.log("mergeMultiSingleRowColums",l);let u=[];l.children.forEach(f=>{u.push(...f.children)}),l.children=u,l.determineLayout()}else l.children.forEach(c)}}return c(n),r(n),n};h.getVerticalBoxesFromHierarchy=(o,e=!0)=>{let n={...o};function t(i){let r=i.children;if(r.some(a=>r.some(c=>a!==c&&!a.isInside(c)&&(a.x>=c.x+c.width||a.x+a.width<=c.x)))){i.setChildren([]);return}else for(let a=0;a<r.length;a++)t(r[a])}return t(n),n.children};h.boxes=null;h.selectElementToIgnore=()=>{document.body.style.cursor="crosshair",h.ui.overlaysDiv().addEventListener("click",e=>{let n=e.target;n.classList.contains("xp-overlay")&&n.remove(),h.ignoreElementForDection(n.dataset.boxId),document.body.style.removeProperty("cursor")},{once:!0})};h.ignoreElementForDection=o=>{function e(n){if(n.id===o){let t=function(i){[...h.ui.overlaysDiv().querySelectorAll(".xp-overlay")].forEach(s=>{s.dataset.boxId===i.id&&s.remove()}),i.children.forEach(t)};return n.ignored=!0,t(n),!0}else return n.children.some(e)}e(h.boxes)};h.predictPage=o=>{if(h.boxes?.children?.length>0){let n=function(i){i.ignored||(i.prediction&&i.prediction.sectionType!=="unknown"||i.prediction&&i.prediction.sectionType==="unknown"&&i.children.length===0?(e.push(i),console.warn(i.div,i.prediction),h.ui&&A(i,{window:o,padding:0,color:"rgba(0, 255, 0, 1)",label:i.prediction.sectionType})):i.children.forEach(n))};h.ui?.resetOverlays(),T(h.boxes,0,null,o);let e=[];n(h.boxes);let t=h.boxes.children.map(i=>{let r=[p.getXPath(i.div,document)];return r.push(...i.children.map(s=>"- "+p.getXPath(s.div,document))),r.join(`
  `)||""}).join(`
  `)||"";return h.boxes.template={raw:t,hash:E(t)},h.predictedBoxes=e,console.log("final boxes",h.boxes),console.log("predicted boxes",h.predictedBoxes),h.ui?.toggleOverlays(!0),h.boxes}};h.detectSections=async(o,e,n={autoDetect:!1})=>{h.ui?.resetOverlays();let{document:t}=e,i=p.getAllVisibleElements(o,e);console.log("visible divs",i),i=i.filter(c=>{let l=c.getBoundingClientRect();return l.width*l.height>1e4}),console.log("filtered divs",i);let r=h.buildBoxTree(i,e);console.log("boxes hierarchy",r);function s(c,l){c.div&&(c.xpath=p.getXPath(c.div,l),c.xpathWithDetails=p.getXPath(c.div,l,!0),c.id=`box-id-${E(c.xpath)}`),c.children&&c.children.length>0&&c.children.forEach(d=>s(d,l))}s(r,t),h.boxes=r;let a=r.children.map(c=>{let l=[c.xpath];return l.push(...c.children.map(d=>"- "+d.xpath)),l.join(`
  `)||""}).join(`
  `)||"";if(console.log("template",a),h.template={raw:a,hash:E(a)},!n.autoDetect)L(r.children,e);else if(h.boxes?.children?.length>0){let l=function(u){u.ignored||(u.prediction&&u.prediction.sectionType!=="unknown"||u.prediction&&u.prediction.sectionType==="unknown"&&u.children.length===0?c.push(u):u.children.forEach(l))};T(h.boxes,0,null,e);let c=[];l(h.boxes),c.forEach(u=>{A(u,{window:e,target:e.document.body,padding:0,color:u.color,label:u.prediction.sectionType})});let d=h.boxes.children.map(u=>{let f=[p.getXPath(u.div,t)];return f.push(...u.children.map(y=>"- "+p.getXPath(y.div,t))),f.join(`
  `)||""}).join(`
  `)||"";h.boxes.template={raw:d,hash:E(d)},h.boxes.predictedBoxes=c,console.log("final boxes",h.boxes),h.ui?.toggleOverlays(!0)}return h.ui?.toggleOverlays(!0),h.boxes};window.xp=h;})();



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
    IMPORT_TARGETS: () => IMPORT_TARGETS,
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

  // js/sections-mapping/import/sections-mapping.lpb.import.js
  var IMPORT_TARGETS = {
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
    onLoad: (_0) => __async(void 0, [_0], function* ({
      document: document2
      /* , url, params */
    }) {
      var _a;
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
      (_a = document2.elementFromPoint(0, 0)) == null ? void 0 : _a.click();
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
    }),
    transform: (_0) => __async(void 0, [_0], function* ({ document: document2, params }) {
      const sections = yield window.xp.detectSections(
        document2.body,
        window,
        { autoDetect: true }
      );
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
      const esaasImpId = new URLSearchParams(window.location.search).get("esaasImpId");
      const element = {
        element: document2.body,
        path: generateDocumentPath({ url: params.originalURL }),
        report: {}
      };
      if (esaasImpId) {
        if (parseInt(esaasImpId.slice(-1), 10) % 2 === 0) {
          console.log("esaasImpId is even");
          const el = document2.createElement("div");
          predictedBoxes.filter((s) => s.mapping === "header").forEach((s) => {
            el.appendChild(s.div);
          });
          if (el.children.length === 0) {
            el.appendChild(predictedBoxes[0].div);
          }
          element.element = el;
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
              var _a, _b;
              return ((_a = s.prediction) == null ? void 0 : _a.sectionType) === "header" || ((_b = s.prediction) == null ? void 0 : _b.sectionType) === "footer";
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
            var _a, _b;
            return ((_a = s.prediction) == null ? void 0 : _a.sectionType) === "header" || ((_b = s.prediction) == null ? void 0 : _b.sectionType) === "footer";
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
