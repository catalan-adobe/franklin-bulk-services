(()=>{{let o=i=>{typeof i[0]=="string"&&!i[0].startsWith("[detect]")&&(i[0]=`[detect] ${i[0]}`)},e=console.log;console.log=(...i)=>{o(i),e(...i)},console.debug=(...i)=>{window.DEBUG&&(o(i),e(...i))};let n=console.warn;console.warn=(...i)=>{o(i),n(...i)};let t=console.error;console.error=(...i)=>{o(i),t(...i)}}function b(o){return o.toString(16)}function H(o,e,n,t){return b(o)+b(e)+b(n)+b(t)}var v=class o{constructor({r:e,g:n,b:t,a:i=1,name:l=""}){this.name=l,this.r=e,this.g=n,this.b=t,this.a=i}toHex(){return H(this.r,this.g,this.b,this.a)}static fromRGBA(e){let n=e.replace("rgba(","").replace(")","").split(",").map(t=>parseInt(t.trim()));return new o({r:n[0],g:n[1],b:n[2],a:n[3]})}toRGBA(){return`rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`}withAlpha(e){return new o({...this,a:e})}static random(e=!1){let n=Math.round(Math.random()*255),t=Math.round(Math.random()*255),i=Math.round(Math.random()*255),l=e?Math.random():1;return new o({name:`rand-${n}-${t}-${i}-${l}`,r:n,g:t,b:i,a:l})}static fromHex(e){let n=parseInt(e.substring(0,2),16),t=parseInt(e.substring(2,4),16),i=parseInt(e.substring(4,6),16),l=parseInt(e.substring(6,8),16);return new o({name:`hex-${n}-${t}-${i}-${l}`,r:n,g:t,b:i,a:l})}};function O(o,e){let n=Math.max(0,Math.min(o.x+o.width,e.x+e.width)-Math.max(o.x,e.x)),t=Math.max(0,Math.min(o.y+o.height,e.y+e.height)-Math.max(o.y,e.y)),i=n*t,l=e.width*e.height;return i/l*100}function D(o,e){let n=o.getBoundingClientRect();return{left:n.left+e.document.scrollingElement.scrollLeft,top:n.top+e.document.scrollingElement.scrollTop}}var S=class o{constructor(e,n,t,i,l){this.id=crypto.randomUUID(),this.x=Math.floor(e),this.y=Math.floor(n),this.width=Math.floor(t),this.height=Math.floor(i),this.div=l,this.children=[],this.prediction=null,this.layout=null}static fromDiv(e,n){let t=e.getBoundingClientRect(),i=D(e,n);return new o(i.left,i.top,t.width,t.height,e)}static areBoxesLaidOutAsGrid(e){console.log("areBoxesLaidOutAsGrid");try{if(e.length<2)return!1;let n=e.slice().sort((c,s)=>c.x-s.x||c.y-s.y),t=e.slice().sort((c,s)=>c.y-s.y||c.x-s.x);console.log(n),console.log(t);let i=[];for(let c=1;c<n.length;c++)i.push(n[c].x-n[c-1].x);if([...new Set(i)].length>1)return!1;let r=[];for(let c=1;c<t.length;c++)r.push(t[c].y-t[c-1].y);return!([...new Set(r)].length>1)}finally{return!0}}contains(e,n=!0){return n?e.x-e.width>=this.x-this.width&&e.x+e.width<=this.x+this.width&&e.y-e.height>=this.y-this.height&&e.y+e.height<=this.y+this.height:O(this,e)>75}intersects(e){return!(e.x-e.width>this.x+this.width||e.x+e.width<this.x-this.width||e.y-e.height>this.y+this.height||e.y+e.height<this.y-this.height)}isInside(e){return e.x-e.width<=this.x-this.width&&e.x+e.width>=this.x+this.width&&e.y-e.height<=this.y-this.height&&e.y+e.height>=this.y+this.height}addChild(e){this.children.push(e)}isChild(e){return this.children.some(this.isChild)}determineLayout(){if(this.layout={numCols:M(this.children),numRows:P(this.children)},this.layout.numCols>1){let e=[],n=this.children.slice().sort((t,i)=>t.y-i.y);for(let t=0;t<this.layout.numRows;t++){let i=n.slice(t*this.layout.numCols,(t+1)*this.layout.numCols);e.push(...i.slice().sort((l,r)=>l.x-r.x))}this.children=e}return this.layout}toJSONString(){function e(t){return{id:t.id,x:t.x,y:t.y,width:t.width,height:t.height,layout:t.layout,prediction:t.prediction,template:t.template,xpath:t.xpath,xpathWithDetails:t.xpathWithDetails,children:t.children.map(e)}}let n=e(this);return console.log(n),n}};function M(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.x-t.x).forEach(n=>{let t=n.x,i=n.x+n.width,l=e[e.length-1];l?t>=l-5&&e.push(i):e.push(i)}),e.length}function P(o){if(!o.length)return 0;let e=[];return o.slice().sort((n,t)=>n.y-t.y).forEach(n=>{let t=n.y,i=n.y+n.height,l=e[e.length-1];l?t>=l-5&&e.push(i):e.push(i)}),e.length}var p=class o{static getXPath(e,n,t=!1){for(var i=n.getElementsByTagName("*"),l=[];e&&e.nodeType==1;e=e.parentNode)if(t)if(e.hasAttribute("id")){for(var r=0,a=0;a<i.length&&(i[a].hasAttribute("id")&&i[a].id==e.id&&r++,!(r>1));a++);if(r==1)return l.unshift('id("'+e.getAttribute("id")+'")'),l.join("/");l.unshift(e.localName.toLowerCase()+'[@id="'+e.getAttribute("id")+'"]')}else e.hasAttribute("class")&&l.unshift(e.localName.toLowerCase()+'[@class="'+[...e.classList].join(" ").trim()+'"]');else{for(var c=1,s=e.previousSibling;s;s=s.previousSibling)s.localName==e.localName&&(c+=1);l.unshift(e.localName.toLowerCase()+"["+c+"]")}return l.length?"/"+l.join("/"):null}static isVisible(e,n){if(!e)return!1;if(e.nodeType===n.Node.DOCUMENT_NODE)return!0;if(e.nodeType===n.Node.ELEMENT_NODE){let t=n.getComputedStyle(e);return t.display.includes("none")||t.visibility.includes("hidden")||t.opacity==="0"?!1:o.isVisible(e.parentNode,n)}}static isUserVisible(e,n){if(!o.isVisible(e,n))return!1;let t=e.getBoundingClientRect(),{width:i,height:l}=o.getPageSize(n.document);return!(t.height===0||t.width===0)}static getNSiblingsDivs(e,n,t=null){let i=t;isNaN(t)||(i=a=>a===t);let l="",r=[];e.querySelectorAll("div").forEach(a=>{let c=o.getXPath(a,n),s=c.substring(0,c.lastIndexOf("["));r[s]?r[s].push(a):r[s]=[a]});for(let a in r)if(i(r[a].length)){l=a;break}return r[l]||null}static getPageSize(e){var n=e.documentElement,t=e.body,i=Math.max(n.clientWidth,n.scrollWidth,n.offsetWidth,t.scrollWidth,t.offsetWidth),l=Math.max(n.clientHeight,n.scrollHeight,n.offsetHeight,t.scrollHeight,t.offsetHeight);return{width:i,height:l}}static getOffsetRect(e,n){let t=e.getBoundingClientRect(),i=n.document?.scrollingElement?.scrollLeft||0,l=n.document?.scrollingElement?.scrollTop||0;return{x:t.left+i,y:t.top+l,width:t.width,height:t.height}}static checkElStackUpCSSClasses(e,n){let t=e;for(;t;){if(t.classList.contains(n))return!0;t=t.parentElement}return!1}static getAllVisibleElements=(e=document.body,n)=>{let t=[...e.querySelectorAll("*")].filter(r=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(r.nodeName)).reduce((r,a,c)=>{var s=a.closest("svg");return!(s!==null&&s!==a)&&!r.includes(a.nodeName)&&r.push(a.nodeName),r},[]);console.debug("DOM node types:",t);let l=[...e.querySelectorAll(t.join(","))].filter(r=>o.isUserVisible(r,n));return console.log(`found ${l.length} visible elements in the page.`),l}};var C=class{constructor(...e){e.reduce((n,t,i)=>(n[t]=1<<i,n),this)}},w=class{#e=0;constructor(...e){this.#e=0,this.setFlags(...e)}get flag(){return this.#e}setFlags(...e){this.#e=e.reduce((n,t)=>n|t,0)}setFlag(e){this.#e|=e}unsetFlag(e){this.#e&=~e}isFlagSet(e){return(this.#e&e)!==0}areOnlyFlagsSet(...e){let n=e.reduce((t,i)=>t|i,0);return this.#e===n}getFlags(e){return Object.keys(e).filter(n=>this.isFlagSet(e[n]))}};function E(o){var e=0,n=o.length,t=0;if(n>0)for(;t<n;)e=(e<<5)-e+o.charCodeAt(t++)|0;return e}function B(o,...e){return(...n)=>{let t=n[n.length-1]||{},i=[o[0]];return e.forEach((l,r)=>{let a=Number.isInteger(l)?n[l]:t[l];i.push(a,o[r+1])}),i.join("")}}function I(o,e){let n=null,t=null;if(n=[...o.querySelectorAll("*")].some(l=>{let r=e.getComputedStyle(l),a=l.getBoundingClientRect(),c=r.backgroundImage||"none",s="none";if(s&&s.includes("rgba")&&Color.fromRGBA(s).a===0&&(s="none"),c.includes("none")&&s.includes("none"))return!1;if(c||s)return t=l,!0}),n)return t;let i=[...o.querySelectorAll("img")].filter(l=>p.isUserVisible(l,e));if(i&&i.length===1){n=i[0],console.log("found image",o,i);let l=o.getBoundingClientRect(),r=l.width*l.height,a=n.getBoundingClientRect(),c=a.width*a.height;if(console.log("found image","elArea",r,"bgArea",c),c>=r*.8)return n}return null}var d=window.xp??{},k=class{constructor({sectionType:e,sectionFeatures:n,template:t,confidence:i}){this.sectionType=e,this.sectionFeatures=n,this.template=t,this.confidence=i}},q=[{name:"carousel",predictFn:(o,e,n,t,i)=>{console.log(o.div),console.groupCollapsed(">>> carousel");let l=p.getNSiblingsDivs(o.div,i.document,r=>r>=2);if(l){console.log("predict carousel"),console.log(l);let r={};l.forEach(c=>{let s=p.getXPath(c,i.document),u=[...c.querySelectorAll("div")].map(f=>p.getXPath(f,i.document).slice(s.length));console.log(u);let h=E(u.join(`
  `));console.log(h),r[h]?r[h].push(c):r[h]=[c]}),console.groupEnd();let a=Object.keys(r).filter(c=>r[c].length>1);if(r[a]){let c=!1,s=!1;if(r[a].forEach(u=>{let h=u.getBoundingClientRect();!p.isVisible(u,i)||h.x+h.width>i.innerWidth?s=!0:c=!0}),c&&s)return!0}return!1}return console.groupEnd(),!1}},{name:"cards",predictFn:(o,e,n,t,i)=>{console.groupCollapsed(">>> cards"),console.log(o.div),console.log(o.div.classList),console.log(o),console.log(o.children.every(r=>p.checkElStackUpCSSClasses(r.div,"card"))),console.log(p.checkElStackUpCSSClasses(o.div,"card")),console.log(t.isFlagSet(g.isGridLayout));let l=t.isFlagSet(g.isGridLayout)&&(o.div.classList.value.includes("card")||o.children.find(r=>r.div.querySelector('[class*="card"]')!==null)!==void 0);return console.log("aaa",l),console.groupEnd(),l}},{name:"columns",predictFn:(o,e,n,t,i)=>(console.log("flags",t.getFlags(g)),t.isFlagSet(g.isGridLayout))},{name:"hero",predictFn:(o,e,n,t,i)=>o.height<=i.innerHeight&&t.isFlagSet(g.hasBackground)&&t.isFlagSet(g.hasHeading)},{name:"default-content",predictFn:(o,e,n,t,i)=>{let l=!0;[...o.div.querySelectorAll("img")].some(c=>{let s=c.getBoundingClientRect();return s.width>50&&s.height>50})&&(l=!1);let a=!o.children.some(c=>(console.log(c.prediction?.sectionType),!["heading","text","text+icons"].includes(c.prediction?.sectionType)));return console.log("childrenOnlyTextLike",a),t.isFlagSet(g.hasTexts)&&!t.isFlagSet(g.hasImages)&&!t.isFlagSet(g.hasBackground)||!t.isFlagSet(g.isGridLayout)&&a&&t.isFlagSet(g.hasTexts)&&l&&!t.isFlagSet(g.hasBackground)}}];d.DOM=p;d.Flags=C;d.FlagSet=w;function $(o,e){let n=e.document.createElement("a");document.body.appendChild(n);let t=e.getComputedStyle(n);return[...o.querySelectorAll("a")].find(l=>{if(["background","background-color","background-image"].find(c=>{let s=e.getComputedStyle(l);return console.log(c,s[c],t[c]),s[c]!==t[c]}))return console.log("hasBackground"),!0;let a=0;return["left","right","top","bottom"].forEach(c=>{let s=e.getComputedStyle(l).getPropertyValue(`border-${c}-style`);console.log(c,s,t[`border-${c}-style`]),s!==t[`border-${c}-style`]&&a++}),a>1?(console.log("bordersNum"),!0):!1})!==void 0}var G=[new v({name:"violet",r:148,g:0,b:211}),new v({name:"indigo",r:75,g:0,b:130}),new v({name:"blue",r:0,g:0,b:255}),new v({name:"green",r:0,g:255,b:0}),new v({name:"yellow",r:255,g:255,b:0}),new v({name:"orange",r:255,g:127,b:0}),new v({name:"red",r:255,g:0,b:0})];d.filterDivs=o=>{let e=o.filter(t=>{let i=t.getBoundingClientRect(),{width:l,height:r}=p.getPageSize();return!t.classList.contains("xp-ui")&&!t.closest(".xp-ui")&&i.width!==0&&i.height!==0&&i.width*i.height>5e3&&i.width*i.height<.8*l*r&&p.isVisible(t,window)});console.log(e.length),console.log(e.map(t=>t));let n=e.filter(t=>{let i=t.parentElement;for(;i;){let l=t.getBoundingClientRect(),r=i.getBoundingClientRect();if(r.width===0||r.height===0){i=i.parentElement;continue}if(l.width>=.9*r.width&&l.height>=.9*r.height)return!1;i=i.parentElement}return!0});return console.log(n.length),console.log(n.map(t=>t)),n};var U=B`position:absolute;z-index:10000000;left:${0}px;top:${1}px;width:${2}px;height:${3}px;border:2px solid ${4};`,T=(o,{window:e,target:n=document.body,padding:t=0,color:i=null,label:l=null})=>{let r=i||"rgba(0, 0, 255, 1)",a=p.getOffsetRect(o.div,e),s=n.closest("body").getBoundingClientRect().y||0,u=document.createElement("div");u.dataset.boxId=o.id,u.dataset.boxXpath=o.xpath,u.dataset.boxXpathWithDetails=o.xpathWithDetails,u.dataset.layout=JSON.stringify(o.layout);let h=(({id:f,x:y,y:x,width:m,height:F,xpath:R,layout:N})=>({id:f,x:y,y:x,width:m,height:F,xpath:R,layout:N}))(o);if((o.layout.numCols>1||o.layout.numRows>1)&&(h.childrenXpaths=o.children.map(f=>({xpath:f.xpath,xpathWithDetails:f.xpathWithDetails}))),u.dataset.boxData=JSON.stringify(h),u.className="xp-overlay",u.style=U(a.x+t,a.y+t-s,a.width-t*2-4,a.height-t*2-4,r),l){let f=e.document.createElement("div");f.className="xp-overlay-label",f.textContent=l,u.appendChild(f)}n.appendChild(u)};function L(o,e,n=0,t=G,i=null,l=0){o.forEach((r,a)=>{let c=i||t[a%(t.length-1)],s=l===0?1:Math.max(.1,.5-l*.1),u=c.withAlpha(s).toRGBA();r.color=u,T(r,{window:e,target:e.document.body,padding:n,color:u,label:`layout: ${r.layout.numCols}x${r.layout.numRows}`}),r.children.length>0&&L(r.children,e,n+4,t,c,l+1)})}var g=new C("isFromRootBox","hasHeader","hasTexts","hasBackground","hasHeading","hasCTA","hasImages","hasMultipleColumns","hasMultipleRows","isGridLayout","isInsideAHeaderLikeElement","isInsideAFooterLikeElement");function A(o,e,n=null,t,i=!0){if(o.ignored)return null;let l="unknown",r=new w,a=o.div;if(i&&r.setFlag(g.isFromRootBox),a){let s=a.cloneNode(!0);s.querySelectorAll("script, style, link, meta, noscript").forEach(F=>F.remove()),s.textContent.replaceAll(" ","").replaceAll(`
  `,"").trim().length>0&&r.setFlag(g.hasTexts),([...a.querySelectorAll("img, picture, svg")].length>0||["IMG","PICTURE","SVG"].includes(a.nodeName))&&r.setFlag(g.hasImages);let f=!!I(o.div,t);console.log("hasBackground",a,f),f&&r.setFlag(g.hasBackground),([...a.querySelectorAll("h1, h2, h3, h4, h5, h6")].length>0||["H1","H2","H3","H4","H5","H6"].includes(a.nodeName))&&r.setFlag(g.hasHeading),$(a,t)&&r.setFlag(g.hasCTA);let m=o.determineLayout();m.numRows>1&&r.setFlag(g.hasMultipleRows),m.numCols>1&&r.setFlag(g.hasMultipleColumns),m.numCols>1&&S.areBoxesLaidOutAsGrid(o.children)&&r.setFlag(g.isGridLayout),(a.closest("header, .header")||p.checkElStackUpCSSClasses(a,"header"))&&r.setFlag(g.isInsideAHeaderLikeElement),(a.closest("footer, .footer")||p.checkElStackUpCSSClasses(a,"footer"))&&r.setFlag(g.isInsideAFooterLikeElement)}let c=o.children;if(c.forEach((...s)=>{A(...s,t,!1)}),!i){let s=q.find(u=>u.predictFn(o,e,null,r,t));s&&(l=s.name)}if(c.length===0&&r.isFlagSet(g.isFromRootBox)&&e===0||c.length>0&&c.every(s=>s.prediction.sectionFeatures.includes("isInsideAHeaderLikeElement"))?l="header":c.length>0&&c.every(s=>s.prediction.sectionFeatures.includes("isInsideAFooterLikeElement"))&&(l="footer"),o.prediction=new k({sectionType:l,sectionFeatures:r.getFlags(g),confidence:-1}),console.group("prediction"),console.log("prediction"),console.log(r.getFlags(g)),console.log(a),console.log("section prediction:",o.prediction),console.groupEnd(),i){let s=function(y,x){return y.children.find(m=>m.prediction.sectionType===x?!0:s(m))},u=function(y,x){let m=y.children.slice(x)[0];return!m||m.children.length===0?y.div&&y.prediction.sectionType==="unknown"?y:m:u(m,x)};if(!s(o,"header")){let y=u(o,0);y&&(y.prediction=new k({sectionType:"header",sectionFeatures:y.prediction.sectionFeatures,confidence:-1}))}if(!s(o,"footer")){let y=u(o,-1);y&&(y.prediction=new k({sectionType:"footer",sectionFeatures:y.prediction.sectionFeatures,confidence:-1}))}}return o.prediction}function z(){let o=[...document.body.querySelectorAll("*")].filter(t=>!["IFRAME","NOSCRIPT","BR","EM","STRONG","STYLE","SCRIPT"].includes(t.nodeName)).reduce((t,i,l)=>{var r=i.closest("svg");return!(r!==null&&r!==i)&&!t.includes(i.nodeName)&&t.push(i.nodeName),t},[]);console.log("DOM node types:",o);let e=[...document.querySelectorAll(o.join(","))],n=d.filterDivs(e);return console.log(`found ${n.length} visible divs to show!`),n}d.getAllVisibleDivs=z;d.buildBoxTree=(o,e)=>{let n=new S(0,0,e.innerWidth,e.document.scrollingElement.scrollHeight),t=o.map(s=>S.fromDiv(s,e));function i(s,u,h){u.forEach((f,y)=>{if(h.has(y))return;if(s.contains(f,!1)){let m=f;s.addChild(m),h.add(y),i(m,u,h)}})}i(n,t,new Set);function l(s){s.determineLayout(),s.children.forEach(l)}l(n);function r(s){if(s.children.length===1&&s.layout.numCols===1){let u=s.children[0];s.children=u.children,r(s),s.determineLayout()}else s.children.forEach(r)}r(n);function a(s){s.children.length>1&&s.layout.numCols===1&&s.children.every(u=>u.layout.numRows===0&&u.layout.numCols===0)?(s.children=[],a(s),s.determineLayout()):s.children.forEach(a)}a(n);function c(s){if(s.children.length>1){let u=s.children[0].layout.numCols;if(s.layout.numRows>1&&s.layout.numCols===1&&s.children.every(h=>h.layout.numRows===1&&h.layout.numCols>1&&h.layout.numCols===u)){console.log("mergeMultiSingleRowColums",s);let h=[];s.children.forEach(f=>{h.push(...f.children)}),s.children=h,s.determineLayout()}else s.children.forEach(c)}}return c(n),l(n),n};d.getVerticalBoxesFromHierarchy=(o,e=!0)=>{let n={...o};function t(i){let l=i.children;if(l.some(a=>l.some(c=>a!==c&&!a.isInside(c)&&(a.x>=c.x+c.width||a.x+a.width<=c.x)))){i.setChildren([]);return}else for(let a=0;a<l.length;a++)t(l[a])}return t(n),n.children};d.boxes=null;d.selectElementToIgnore=()=>{document.body.style.cursor="crosshair",d.ui.overlaysDiv().addEventListener("click",e=>{let n=e.target;n.classList.contains("xp-overlay")&&n.remove(),d.ignoreElementForDection(n.dataset.boxId),document.body.style.removeProperty("cursor")},{once:!0})};d.ignoreElementForDection=o=>{function e(n){if(n.id===o){let t=function(i){[...d.ui.overlaysDiv().querySelectorAll(".xp-overlay")].forEach(r=>{r.dataset.boxId===i.id&&r.remove()}),i.children.forEach(t)};return n.ignored=!0,t(n),!0}else return n.children.some(e)}e(d.boxes)};d.predictPage=o=>{if(d.boxes?.children?.length>0){let n=function(i){i.ignored||(i.prediction&&i.prediction.sectionType!=="unknown"||i.prediction&&i.prediction.sectionType==="unknown"&&i.children.length===0?(e.push(i),console.warn(i.div,i.prediction),d.ui&&T(i,{window:o,padding:0,color:"rgba(0, 255, 0, 1)",label:i.prediction.sectionType})):i.children.forEach(n))};d.ui?.resetOverlays(),A(d.boxes,0,null,o);let e=[];n(d.boxes);let t=d.boxes.children.map(i=>{let l=[p.getXPath(i.div,document)];return l.push(...i.children.map(r=>"- "+p.getXPath(r.div,document))),l.join(`
  `)||""}).join(`
  `)||"";return d.boxes.template={raw:t,hash:E(t)},d.predictedBoxes=e,console.log("final boxes",d.boxes),console.log("predicted boxes",d.predictedBoxes),d.ui?.toggleOverlays(!0),d.boxes}};d.detectSections=async(o,e,n={autoDetect:!1})=>{d.ui?.resetOverlays();let{document:t}=e,i=p.getAllVisibleElements(o,e);console.log("visible divs",i),i=i.filter(c=>{let s=c.getBoundingClientRect();return s.width*s.height>1e4}),console.log("filtered divs",i);let l=d.buildBoxTree(i,e);console.log("boxes hierarchy",l);function r(c,s){c.div&&(c.xpath=p.getXPath(c.div,s),c.xpathWithDetails=p.getXPath(c.div,s,!0),c.id=`box-id-${E(c.xpath)}`),c.children&&c.children.length>0&&c.children.forEach(u=>r(u,s))}r(l,t),d.boxes=l;let a=l.children.map(c=>{let s=[c.xpath];return s.push(...c.children.map(u=>"- "+u.xpath)),s.join(`
  `)||""}).join(`
  `)||"";if(console.log("template",a),d.template={raw:a,hash:E(a)},!n.autoDetect)L(l.children,e);else if(d.boxes?.children?.length>0){let s=function(h){h.ignored||(h.prediction&&h.prediction.sectionType!=="unknown"||h.prediction&&h.prediction.sectionType==="unknown"&&h.children.length===0?c.push(h):h.children.forEach(s))};A(d.boxes,0,null,e);let c=[];s(d.boxes),c.forEach(h=>{T(h,{window:e,target:e.document.body,padding:0,color:h.color,label:h.prediction.sectionType})});let u=d.boxes.children.map(h=>{let f=[p.getXPath(h.div,t)];return f.push(...h.children.map(y=>"- "+p.getXPath(y.div,t))),f.join(`
  `)||""}).join(`
  `)||"";d.boxes.template={raw:u,hash:E(u)},d.boxes.predictedBoxes=c,console.log("final boxes",d.boxes),d.ui?.toggleOverlays(!0)}return d.ui?.toggleOverlays(!0),d.boxes};window.xp=d;})();
  
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
