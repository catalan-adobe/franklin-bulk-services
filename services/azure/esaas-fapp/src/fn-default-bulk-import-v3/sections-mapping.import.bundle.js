(() => {
  // src/utils/logger.js
  {
    const patchArgs = (args) => {
      if (typeof args[0] === "string" && !args[0].startsWith("[detect]")) {
        args[0] = `[detect] ${args[0]}`;
      }
    };
    const _log = console.log;
    console.log = (...args) => {
      patchArgs(args);
      _log(...args);
    };
    console.debug = (...args) => {
      if (window.DEBUG) {
        patchArgs(args);
        _log(...args);
      }
    };
    const _warn = console.warn;
    console.warn = (...args) => {
      patchArgs(args);
      _warn(...args);
    };
    const _error = console.error;
    console.error = (...args) => {
      patchArgs(args);
      _error(...args);
    };
  }

  // src/utils/color.js
  function valueToHex(c) {
    return c.toString(16);
  }
  function rgbaToHex(r, g, b, a) {
    return valueToHex(r) + valueToHex(g) + valueToHex(b) + valueToHex(a);
  }
  var Color2 = class _Color {
    constructor({ r, g, b, a = 1, name = "" }) {
      this.name = name;
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
    toHex() {
      return rgbaToHex(this.r, this.g, this.b, this.a);
    }
    static fromRGBA(rgbaStr) {
      const rgba = rgbaStr.replace("rgba(", "").replace(")", "").split(",").map((v) => parseInt(v.trim()));
      return new _Color({ r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] });
    }
    toRGBA() {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    withAlpha(a) {
      return new _Color({
        ...this,
        a
      });
    }
    static random(withAlpha = false) {
      const r = Math.round(Math.random() * 255);
      const g = Math.round(Math.random() * 255);
      const b = Math.round(Math.random() * 255);
      const a = withAlpha ? Math.random() : 1;
      return new _Color({ name: `rand-${r}-${g}-${b}-${a}`, r, g, b, a });
    }
    static fromHex(hex) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const a = parseInt(hex.substring(6, 8), 16);
      return new _Color({ name: `hex-${r}-${g}-${b}-${a}`, r, g, b, a });
    }
  };

  // src/utils/box.js
  function calculateSurfacePercentage(mainRect, innerRect) {
    const intersectionX = Math.max(0, Math.min(mainRect.x + mainRect.width, innerRect.x + innerRect.width) - Math.max(mainRect.x, innerRect.x));
    const intersectionY = Math.max(0, Math.min(mainRect.y + mainRect.height, innerRect.y + innerRect.height) - Math.max(mainRect.y, innerRect.y));
    const intersectionArea = intersectionX * intersectionY;
    const innerArea = innerRect.width * innerRect.height;
    const percentage = intersectionArea / innerArea * 100;
    return percentage;
  }
  function getOffset(el, window2) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window2.document.scrollingElement.scrollLeft,
      top: rect.top + window2.document.scrollingElement.scrollTop
    };
  }
  var Box = class _Box {
    // constructor
    constructor(x, y, w, h, div) {
      this.id = crypto.randomUUID();
      this.x = Math.floor(x);
      this.y = Math.floor(y);
      this.width = Math.floor(w);
      this.height = Math.floor(h);
      this.div = div;
      this.children = [];
      this.prediction = null;
      this.layout = null;
    }
    static fromDiv(div, window2) {
      const rect = div.getBoundingClientRect();
      const offset = getOffset(div, window2);
      return new _Box(offset.left, offset.top, rect.width, rect.height, div);
    }
    static areBoxesLaidOutAsGrid(boxes) {
      console.log("areBoxesLaidOutAsGrid");
      try {
        if (boxes.length < 2) {
          return false;
        }
        const sortedByX = boxes.slice().sort((a, b) => a.x - b.x || a.y - b.y);
        const sortedByY = boxes.slice().sort((a, b) => a.y - b.y || a.x - b.x);
        console.log(sortedByX);
        console.log(sortedByY);
        const horizontalSpacing = [];
        for (let i = 1; i < sortedByX.length; i++) {
          horizontalSpacing.push(sortedByX[i].x - sortedByX[i - 1].x);
        }
        const uniqueHorizontalSpacings = [...new Set(horizontalSpacing)];
        if (uniqueHorizontalSpacings.length > 1) {
          return false;
        }
        const verticalSpacing = [];
        for (let i = 1; i < sortedByY.length; i++) {
          verticalSpacing.push(sortedByY[i].y - sortedByY[i - 1].y);
        }
        const uniqueVerticalSpacings = [...new Set(verticalSpacing)];
        if (uniqueVerticalSpacings.length > 1) {
          return false;
        }
        return true;
      } finally {
        return true;
      }
    }
    // methods
    contains(box, strict = true) {
      if (strict) {
        return box.x - box.width >= this.x - this.width && box.x + box.width <= this.x + this.width && box.y - box.height >= this.y - this.height && box.y + box.height <= this.y + this.height;
      } else {
        if (box.div.classList.contains("heroimage") && calculateSurfacePercentage(this, box) > 0) {
          console.log(this.div);
          console.log(box.div);
          console.log(calculateSurfacePercentage(this, box));
        }
        return calculateSurfacePercentage(this, box) > 75;
      }
    }
    intersects(range) {
      return !(range.x - range.width > this.x + this.width || range.x + range.width < this.x - this.width || range.y - range.height > this.y + this.height || range.y + range.height < this.y - this.height);
    }
    isInside(box) {
      return box.x - box.width <= this.x - this.width && box.x + box.width >= this.x + this.width && box.y - box.height <= this.y - this.height && box.y + box.height >= this.y + this.height;
    }
    addChild(box) {
      this.children.push(box);
    }
    // get children() {
    //   return this._children;
    // };
    // setChildren(children) {
    //   this._children = children;
    // };
    isChild(box) {
      return this.children.some(this.isChild);
    }
    determineLayout() {
      this.layout = {
        numCols: countColumns(this.children),
        numRows: countRows(this.children)
      };
      if (this.layout.numCols > 1) {
        const sortedBoxes = [];
        const sortedYs = this.children.slice().sort((a, b) => a.y - b.y);
        for (let i = 0; i < this.layout.numRows; i++) {
          const cells = sortedYs.slice(i * this.layout.numCols, (i + 1) * this.layout.numCols);
          sortedBoxes.push(...cells.slice().sort((a, b) => a.x - b.x));
        }
        this.children = sortedBoxes;
        console.log("sortedBoxes", sortedBoxes);
      }
      return this.layout;
    }
    toJSONString() {
      function cleanUpBoxObject(box) {
        return {
          id: box.id,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          layout: box.layout,
          prediction: box.prediction,
          template: box.template,
          xpath: box.xpath,
          xpathWithDetails: box.xpathWithDetails,
          children: box.children.map(cleanUpBoxObject)
        };
      }
      const j = cleanUpBoxObject(this);
      console.log(j);
      return j;
    }
  };
  function countColumns(boxes) {
    if (!boxes.length) return 0;
    let columns = [];
    boxes.slice().sort((a, b) => a.x - b.x).forEach((box) => {
      let boxStart = box.x;
      let boxEnd = box.x + box.width;
      const latestRow = columns[columns.length - 1];
      if (latestRow) {
        if (boxStart >= latestRow - 5) {
          columns.push(boxEnd);
        }
      } else {
        columns.push(boxEnd);
      }
    });
    return columns.length;
  }
  function countRows(boxes) {
    if (!boxes.length) return 0;
    let rows = [];
    boxes.slice().sort((a, b) => a.y - b.y).forEach((box) => {
      let boxStart = box.y;
      let boxEnd = box.y + box.height;
      const latestRow = rows[rows.length - 1];
      if (latestRow) {
        if (boxStart >= latestRow - 5) {
          rows.push(boxEnd);
        }
      } else {
        rows.push(boxEnd);
      }
    });
    return rows.length;
  }

  // src/utils/dom.js
  var DOM = class _DOM {
    static getXPath(elm, document2, withDetails = false) {
      var allNodes = document2.getElementsByTagName("*");
      for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (withDetails) {
          if (elm.hasAttribute("id")) {
            var uniqueIdCount = 0;
            for (var n = 0; n < allNodes.length; n++) {
              if (allNodes[n].hasAttribute("id") && allNodes[n].id == elm.id) uniqueIdCount++;
              if (uniqueIdCount > 1) break;
            }
            ;
            if (uniqueIdCount == 1) {
              segs.unshift('id("' + elm.getAttribute("id") + '")');
              return segs.join("/");
            } else {
              segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute("id") + '"]');
            }
          } else if (elm.hasAttribute("class")) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + [...elm.classList].join(" ").trim() + '"]');
          }
        } else {
          for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.localName == elm.localName) {
              i += 1;
            }
          }
          segs.unshift(elm.localName.toLowerCase() + "[" + i + "]");
        }
      }
      return segs.length ? "/" + segs.join("/") : null;
    }
    // check element and all parents if they are visible
    static isVisible(el, window2) {
      if (!el) {
        return false;
      }
      if (el.nodeType === window2.Node.DOCUMENT_NODE) {
        return true;
      }
      if (el.nodeType === window2.Node.ELEMENT_NODE) {
        const s = window2.getComputedStyle(el);
        if (s.display.includes("none") || s.visibility.includes("hidden") || s.opacity === "0") {
          return false;
        }
        return _DOM.isVisible(el.parentNode, window2);
      }
    }
    static isUserVisible(el, window2) {
      if (!_DOM.isVisible(el, window2)) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      const { width: pWidth, height: pHeight } = _DOM.getPageSize(window2.document);
      if (rect.height === 0 || rect.width === 0) {
        return false;
      }
      return true;
    }
    // courtesy of https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/parsers/utils.js
    static getNSiblingsDivs(el, document2, n = null) {
      let cmpFn = n;
      if (!isNaN(n)) {
        cmpFn = (c) => c === n;
      }
      let selectedXpathPattern = "";
      const xpathGrouping = [];
      el.querySelectorAll("div").forEach((d) => {
        const xpath = _DOM.getXPath(d, document2);
        const xp3 = xpath.substring(0, xpath.lastIndexOf("["));
        if (!xpathGrouping[xp3]) {
          xpathGrouping[xp3] = [d];
        } else {
          xpathGrouping[xp3].push(d);
        }
      });
      for (let key in xpathGrouping) {
        if (cmpFn(xpathGrouping[key].length)) {
          selectedXpathPattern = key;
          break;
        }
      }
      return xpathGrouping[selectedXpathPattern] || null;
    }
    static getPageSize(document2) {
      var htmlElement = document2.documentElement;
      var bodyElement = document2.body;
      var width = Math.max(
        htmlElement.clientWidth,
        htmlElement.scrollWidth,
        htmlElement.offsetWidth,
        bodyElement.scrollWidth,
        bodyElement.offsetWidth
      );
      var height = Math.max(
        htmlElement.clientHeight,
        htmlElement.scrollHeight,
        htmlElement.offsetHeight,
        bodyElement.scrollHeight,
        bodyElement.offsetHeight
      );
      return { width, height };
    }
    static getOffsetRect(el, window2) {
      const rect = el.getBoundingClientRect();
      const left = window2.document?.scrollingElement?.scrollLeft || 0;
      const top = window2.document?.scrollingElement?.scrollTop || 0;
      return {
        x: rect.left + left,
        y: rect.top + top,
        width: rect.width,
        height: rect.height
      };
    }
    static checkElStackUpCSSClasses(el, pattern) {
      let parent = el;
      while (parent) {
        if (parent.classList.contains(pattern)) {
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    }
    static getAllVisibleElements = (root = document.body, window2) => {
      const types = [...root.querySelectorAll("*")].filter((el) => {
        return !["IFRAME", "NOSCRIPT", "BR", "EM", "STRONG", "STYLE", "SCRIPT"].includes(el.nodeName);
      }).reduce((acc, currValue, currIdx) => {
        var cl = currValue.closest("svg");
        if (!(cl !== null && cl !== currValue) && !acc.includes(currValue.nodeName)) {
          acc.push(currValue.nodeName);
        }
        return acc;
      }, []);
      console.debug("DOM node types:", types);
      const divs = [...root.querySelectorAll(types.join(","))];
      const visibleElements = divs.filter((e) => _DOM.isUserVisible(e, window2));
      console.log(`found ${visibleElements.length} visible elements in the page.`);
      return visibleElements;
    };
  };

  // src/utils/flag.js
  var Flags = class {
    constructor(...flags) {
      flags.reduce((acc, flagName, index) => {
        acc[flagName] = 1 << index;
        return acc;
      }, this);
    }
  };
  var FlagSet = class {
    #flag = 0;
    constructor(...flags) {
      this.#flag = 0;
      this.setFlags(...flags);
    }
    get flag() {
      return this.#flag;
    }
    setFlags(...flags) {
      this.#flag = flags.reduce((acc, flag) => acc | flag, 0);
    }
    // Function to set a flag
    setFlag(flag) {
      this.#flag |= flag;
    }
    // Function to unset a flag
    unsetFlag(flag) {
      this.#flag &= ~flag;
    }
    // Function to check if a flag is set
    isFlagSet(flag) {
      return (this.#flag & flag) !== 0;
    }
    // Function to check if only the specified set of flags is set
    areOnlyFlagsSet(...flagValues) {
      const expectedFlags = flagValues.reduce((acc, flag) => acc | flag, 0);
      return this.#flag === expectedFlags;
    }
    getFlags(flagValues) {
      return Object.keys(flagValues).filter((flag) => this.isFlagSet(flagValues[flag]));
    }
  };

  // src/utils/utils.js
  function hashCode(s) {
    var h = 0, l = s.length, i = 0;
    if (l > 0)
      while (i < l)
        h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return h;
  }
  function template(strings, ...keys) {
    return (...values) => {
      const dict = values[values.length - 1] || {};
      const result = [strings[0]];
      keys.forEach((key, i) => {
        const value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join("");
    };
  }

  // src/utils/browser.js
  function extractBackground(el, window2) {
    let bg = null;
    let foundEl = null;
    bg = [...el.querySelectorAll("*")].some((child) => {
      const s = window2.getComputedStyle(child);
      const rect = child.getBoundingClientRect();
      const cssBGImage = s.backgroundImage || "none";
      let cssBGColor = (
        /*s.backgroundColor ||*/
        "none"
      );
      if (cssBGColor && cssBGColor.includes("rgba")) {
        const c = Color.fromRGBA(cssBGColor);
        if (c.a === 0) {
          cssBGColor = "none";
        }
      }
      if (cssBGImage.includes("none") && cssBGColor.includes("none")) {
        return false;
      } else if (cssBGImage || cssBGColor) {
        foundEl = child;
        return true;
      }
    });
    if (bg) {
      return foundEl;
    }
    bg = [...el.querySelectorAll("img")].some((e) => DOM.isUserVisible(e, window2));
    if (bg) {
      return foundEl;
    }
    return bg;
  }

  // src/detect.js
  var xp2 = window.xp ?? {};
  var SectionPrediction = class {
    constructor({ sectionType, sectionFeatures, template: template2, confidence }) {
      this.sectionType = sectionType;
      this.sectionFeatures = sectionFeatures;
      this.template = template2;
      this.confidence = confidence;
    }
  };
  var SECTION_TYPES = [
    // {
    //   'name': 'header',
    //   predictFn: (box, idx, boxes, features) => {
    //     // if (features.isFlagSet(SECTION_FEATURES.isFromRootBox) && idx === 0) {
    //     //   return true;
    //     // }
    //     const el = box.div;
    //     if (el.closest('header') || el.querySelector('header, .header') || DOM.checkElStackUpCSSClasses(el, 'header')) {
    //       return true;
    //     }
    //     return false;
    //   },
    // },
    // {
    //   'name': 'footer',
    //   predictFn: (box, idx, boxes, features) => {
    //     // if (features.isFlagSet(SECTION_FEATURES.isFromRootBox) && idx === boxes.length-1) {
    //     //   return true;
    //     // }
    //     const el = box.div;
    //     if (el.closest('footer') || el.querySelector('footer, .footer') || DOM.checkElStackUpCSSClasses(el, 'footer')) {
    //       return true;
    //     }    
    //     return false;
    //   },
    // },
    {
      "name": "carousel",
      predictFn: (box, idx, boxes, features, window2) => {
        console.log(box.div);
        console.groupCollapsed(">>> carousel");
        let sibEls = DOM.getNSiblingsDivs(box.div, window2.document, (n) => n >= 2);
        if (sibEls) {
          console.log("predict carousel");
          console.log(sibEls);
          const sameEls = {};
          sibEls.forEach((el) => {
            const elXPath = DOM.getXPath(el, window2.document);
            const xpaths = [...el.querySelectorAll("div")].map((el2) => DOM.getXPath(el2, window2.document).slice(elXPath.length));
            console.log(xpaths);
            const hash = hashCode(xpaths.join("\n"));
            console.log(hash);
            if (sameEls[hash]) {
              sameEls[hash].push(el);
            } else {
              sameEls[hash] = [el];
            }
          });
          console.groupEnd();
          const key = Object.keys(sameEls).filter((key2) => sameEls[key2].length > 1);
          if (sameEls[key]) {
            let hasVisibleElements = false;
            let hasHiddenElements = false;
            sameEls[key].forEach((el) => {
              const rect = el.getBoundingClientRect();
              if (!DOM.isVisible(el, window2) || rect.x + rect.width > window2.innerWidth) {
                hasHiddenElements = true;
              } else {
                hasVisibleElements = true;
              }
            });
            if (hasVisibleElements && hasHiddenElements) {
              return true;
            }
          }
          return false;
        }
        console.groupEnd();
        return false;
      }
    },
    {
      "name": "columns",
      predictFn: (box, idx, boxes, features, window2) => {
        console.log("flags", features.getFlags(SECTION_FEATURES));
        return features.isFlagSet(SECTION_FEATURES.isGridLayout);
      }
    },
    {
      "name": "hero",
      predictFn: (box, idx, boxes, features, window2) => {
        return box.height <= window2.innerHeight && features.isFlagSet(SECTION_FEATURES.hasBackground) && features.isFlagSet(SECTION_FEATURES.hasHeading) && features.isFlagSet(SECTION_FEATURES.hasCTA);
      }
    },
    {
      "name": "default-content",
      predictFn: (box, idx, boxes, features, window2) => {
        let onlyIcons = true;
        const testImages = [...box.div.querySelectorAll("img")].some((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.width > 50 && rect.height > 50) {
            return true;
          }
          return false;
        });
        if (testImages) {
          onlyIcons = false;
        }
        const childrenOnlyTextLike = !box.children.some((child) => {
          console.log(child.prediction?.sectionType);
          if (!["heading", "text", "text+icons"].includes(child.prediction?.sectionType)) {
            return true;
          }
          return false;
        });
        console.log("childrenOnlyTextLike", childrenOnlyTextLike);
        return features.isFlagSet(SECTION_FEATURES.hasTexts) && !features.isFlagSet(SECTION_FEATURES.hasImages) && !features.isFlagSet(SECTION_FEATURES.hasBackground) || !features.isFlagSet(SECTION_FEATURES.isGridLayout) && childrenOnlyTextLike && features.isFlagSet(SECTION_FEATURES.hasTexts) && onlyIcons && !features.isFlagSet(SECTION_FEATURES.hasBackground);
      }
    }
    // {
    //   'name': 'heading',
    //   predictFn: (box, idx, boxes, features) => {
    //     if (!features.isFlagSet(SECTION_FEATURES.hasHeading)) {
    //       return false;
    //     }
    //     const clone = box.div.cloneNode(true);
    //     clone.querySelectorAll('script, style, link, meta, noscript').forEach((el) => el.remove());
    //     console.groupCollapsed('heading');
    //     const h = sanitizeText(clone.querySelector('h1, h2, h3, h4, h5, h6')?.textContent);
    //     const t = sanitizeText(clone.textContent);
    //     console.log(h);
    //     console.log(t);
    //     console.groupEnd();
    //     return features.isFlagSet(SECTION_FEATURES.hasTexts) &&
    //     h === t &&
    //     features.isFlagSet(SECTION_FEATURES.hasHeading) &&
    //     !features.isFlagSet(SECTION_FEATURES.hasImages) &&
    //     !features.isFlagSet(SECTION_FEATURES.hasCTA) &&
    //     !features.isFlagSet(SECTION_FEATURES.hasBackground);
    //   },
    // },
    // {
    //   'name': 'text',
    //   predictFn: (box, idx, boxes, features) => {
    //     // simpler strategy: text content + no visual elements
    //     return (
    //       features.isFlagSet(SECTION_FEATURES.hasTexts) && 
    //       !features.isFlagSet(SECTION_FEATURES.hasImages) &&
    //       !features.isFlagSet(SECTION_FEATURES.hasBackground)
    //     );
    //   },
    // },
    // {
    //   'name': 'text+icons',
    //   predictFn: (box, idx, boxes, features) => {
    //     let onlyIcons = true;
    //     const testImages = [...box.div.querySelectorAll('img')].some((img) => {
    //       const rect = img.getBoundingClientRect();
    //       if (rect.width > 50 && rect.height > 50) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     if (testImages) {
    //       onlyIcons = false;
    //     }
    //     const childrenOnlyTextLike = !box.children.some((child) => {
    //       console.log(child.prediction?.sectionType);
    //       if (!['heading', 'text', 'text+icons'].includes(child.prediction?.sectionType)) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     console.log('childrenOnlyTextLike', childrenOnlyTextLike);
    //     // simpler strategy: text content + no visual elements
    //     return (
    //       !features.isFlagSet(SECTION_FEATURES.isGridLayout) && 
    //       childrenOnlyTextLike &&
    //       features.isFlagSet(SECTION_FEATURES.hasTexts) && 
    //       onlyIcons &&
    //       !features.isFlagSet(SECTION_FEATURES.hasBackground)
    //     );
    //   },
    // },
  ];
  xp2.DOM = DOM;
  xp2.Flags = Flags;
  xp2.FlagSet = FlagSet;
  function elementHasCTALink(el, window2) {
    const defaultAEl = window2.document.createElement("a");
    document.body.appendChild(defaultAEl);
    const defaultAElStyles = window2.getComputedStyle(defaultAEl);
    const found = [...el.querySelectorAll("a")].find((a) => {
      const hasBackground = ["background", "background-color", "background-image"].find((prop) => {
        const s = window2.getComputedStyle(a);
        console.log(prop, s[prop], defaultAElStyles[prop]);
        return s[prop] !== defaultAElStyles[prop];
      });
      if (hasBackground) {
        console.log("hasBackground");
        return true;
      }
      let bordersNum = 0;
      ["left", "right", "top", "bottom"].forEach((side) => {
        const borderStyle = window2.getComputedStyle(a).getPropertyValue(`border-${side}-style`);
        console.log(side, borderStyle, defaultAElStyles[`border-${side}-style`]);
        if (borderStyle !== defaultAElStyles[`border-${side}-style`]) {
          bordersNum++;
        }
      });
      if (bordersNum > 1) {
        console.log("bordersNum");
        return true;
      }
      return false;
    });
    return found !== void 0;
  }
  var DEFAULT_COLORS = [
    new Color2({ name: "violet", r: 148, g: 0, b: 211 }),
    new Color2({ name: "indigo", r: 75, g: 0, b: 130 }),
    new Color2({ name: "blue", r: 0, g: 0, b: 255 }),
    new Color2({ name: "green", r: 0, g: 255, b: 0 }),
    new Color2({ name: "yellow", r: 255, g: 255, b: 0 }),
    new Color2({ name: "orange", r: 255, g: 127, b: 0 }),
    new Color2({ name: "red", r: 255, g: 0, b: 0 })
  ];
  xp2.filterDivs = (divs) => {
    const d = divs.filter((div) => {
      const rect = div.getBoundingClientRect();
      const { width, height } = DOM.getPageSize();
      return !div.classList.contains("xp-ui") && !div.closest(".xp-ui") && (rect.width !== 0 && rect.height !== 0) && rect.width * rect.height > 5e3 && rect.width * rect.height < 0.8 * width * height && DOM.isVisible(div, window);
    });
    console.log(d.length);
    console.log(d.map((div) => div));
    let d2 = d.filter((div) => {
      let parent = div.parentElement;
      while (parent) {
        const dRect = div.getBoundingClientRect();
        const pRect = parent.getBoundingClientRect();
        if (pRect.width === 0 || pRect.height === 0) {
          parent = parent.parentElement;
          continue;
        }
        if (dRect.width >= 0.9 * pRect.width && dRect.height >= 0.9 * pRect.height) {
          return false;
        }
        parent = parent.parentElement;
      }
      return true;
    });
    console.log(d2.length);
    console.log(d2.map((div) => div));
    return d2;
  };
  var HIGHLIGHT_DIV_STYLE_TPL = template`position:absolute;z-index:10000000;left:${0}px;top:${1}px;width:${2}px;height:${3}px;border:2px solid ${4};`;
  var highlightBox = (box, {
    // options
    window: window2,
    target = document.body,
    padding = 0,
    color = null,
    label = null
  }) => {
    let c = color || "rgba(0, 0, 255, 1)";
    const rect = DOM.getOffsetRect(box.div, window2);
    const closestBody = target.closest("body");
    const topOffset = closestBody.getBoundingClientRect().y || 0;
    const d = document.createElement("div");
    d.dataset.boxId = box.id;
    d.dataset.boxXpath = box.xpath;
    d.dataset.boxXpathWithDetails = box.xpathWithDetails;
    d.dataset.layout = JSON.stringify(box.layout);
    const boxData = (({
      id,
      x,
      y,
      width,
      height,
      xpath,
      layout
    }) => ({
      id,
      x,
      y,
      width,
      height,
      xpath,
      layout
    }))(box);
    if (box.layout.numCols > 1 || box.layout.numRows > 1) {
      boxData.childrenXpaths = box.children.map((child) => ({
        xpath: child.xpath,
        xpathWithDetails: child.xpathWithDetails
      }));
    }
    d.dataset.boxData = JSON.stringify(boxData);
    d.className = "xp-overlay";
    d.style = HIGHLIGHT_DIV_STYLE_TPL(rect.x + padding, rect.y + padding - topOffset, rect.width - padding * 2 - 4, rect.height - padding * 2 - 4, c);
    if (label) {
      const l = window2.document.createElement("div");
      l.className = "xp-overlay-label";
      l.textContent = label;
      d.appendChild(l);
    }
    if (false) {
      target = xp2.ui.overlaysDiv();
    }
    target.appendChild(d);
  };
  function highlightAllBoxes(boxes, window2, padding = 0, colors = DEFAULT_COLORS, color = null, colorLevel = 0) {
    boxes.forEach((box, idx) => {
      const c = color || colors[idx % (colors.length - 1)];
      const alpha = colorLevel === 0 ? 1 : Math.max(0.1, 0.5 - colorLevel * 0.1);
      const boxColor = c.withAlpha(alpha).toRGBA();
      box.color = boxColor;
      highlightBox(box, {
        window: window2,
        target: window2.document.body,
        padding,
        color: boxColor,
        label: `layout: ${box.layout.numCols}x${box.layout.numRows}`
      });
      if (box.children.length > 0) {
        highlightAllBoxes(box.children, window2, padding + 4, colors, c, colorLevel + 1);
      }
    });
  }
  var SECTION_FEATURES = new Flags(
    "isFromRootBox",
    "hasHeader",
    "hasTexts",
    "hasBackground",
    "hasHeading",
    "hasCTA",
    "hasImages",
    "hasMultipleColumns",
    "hasMultipleRows",
    "isGridLayout",
    "isInsideAHeaderLikeElement",
    "isInsideAFooterLikeElement"
    // 'hasVideos',
    // 'hasForms',
    // 'hasTables',
    // 'hasLists',
  );
  function predictSection(box, idx, boxes = null, window2, isRootBox = true) {
    if (box.ignored) {
      return null;
    }
    let sectionType = "unknown";
    const sectionFeatures = new FlagSet();
    const el = box.div;
    if (isRootBox) {
      sectionFeatures.setFlag(SECTION_FEATURES.isFromRootBox);
    }
    if (el) {
      const clone = el.cloneNode(true);
      clone.querySelectorAll("script, style, link, meta, noscript").forEach((el2) => el2.remove());
      const hasTexts = clone.textContent.replaceAll(" ", "").replaceAll("\n", "").trim().length > 0;
      if (hasTexts) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasTexts);
      }
      const hasImages = [...el.querySelectorAll("img, picture, svg")].length > 0 || ["IMG", "PICTURE", "SVG"].includes(el.nodeName);
      if (hasImages) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasImages);
      }
      const hasBackground = extractBackground(box.div, window2) ? true : false;
      if (hasBackground) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasBackground);
      }
      const hasHeading = [...el.querySelectorAll("h1, h2, h3, h4, h5, h6")].length > 0 || ["H1", "H2", "H3", "H4", "H5", "H6"].includes(el.nodeName);
      if (hasHeading) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasHeading);
      }
      const hasCTA = elementHasCTALink(el, window2);
      if (hasCTA) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasCTA);
      }
      const layout = box.determineLayout();
      if (layout.numRows > 1) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasMultipleRows);
      }
      if (layout.numCols > 1) {
        sectionFeatures.setFlag(SECTION_FEATURES.hasMultipleColumns);
      }
      if (layout.numCols > 1 && Box.areBoxesLaidOutAsGrid(box.children)) {
        sectionFeatures.setFlag(SECTION_FEATURES.isGridLayout);
      }
      if (el.closest("header, .header") || DOM.checkElStackUpCSSClasses(el, "header")) {
        sectionFeatures.setFlag(SECTION_FEATURES.isInsideAHeaderLikeElement);
      }
      if (el.closest("footer, .footer") || DOM.checkElStackUpCSSClasses(el, "footer")) {
        sectionFeatures.setFlag(SECTION_FEATURES.isInsideAFooterLikeElement);
      }
    }
    let children = box.children;
    children.forEach((...args) => {
      predictSection(...args, window2, false);
    });
    if (!isRootBox) {
      const prediction = SECTION_TYPES.find((sectionType2) => sectionType2.predictFn(box, idx, null, sectionFeatures, window2));
      if (prediction) {
        sectionType = prediction.name;
      }
    }
    if (
      // only has children predicted being inside a header like element
      children.length === 0 && sectionFeatures.isFlagSet(SECTION_FEATURES.isFromRootBox) && idx === 0 || children.length > 0 && children.every((child) => child.prediction.sectionFeatures.includes("isInsideAHeaderLikeElement"))
    ) {
      sectionType = "header";
    } else if (children.length > 0 && children.every((child) => child.prediction.sectionFeatures.includes("isInsideAFooterLikeElement"))) {
      sectionType = "footer";
    }
    box.prediction = new SectionPrediction({
      sectionType,
      sectionFeatures: sectionFeatures.getFlags(SECTION_FEATURES),
      confidence: -1
    });
    console.group("prediction");
    console.log("prediction");
    console.log(sectionFeatures.getFlags(SECTION_FEATURES));
    console.log(el);
    console.log("section prediction:", box.prediction);
    console.groupEnd();
    if (isRootBox) {
      let findChildType = function(box2, type) {
        return box2.children.find((child) => {
          if (child.prediction.sectionType === type) {
            return true;
          }
          return findChildType(child);
        });
      }, findLastChild = function(box2, idx2) {
        const c = box2.children.slice(idx2)[0];
        if (!c || c.children.length === 0) {
          if (box2.div && box2.prediction.sectionType === "unknown") {
            return box2;
          } else {
            return c;
          }
        }
        return findLastChild(c, idx2);
      };
      const foundHeader = findChildType(box, "header");
      if (!foundHeader) {
        const topChild = findLastChild(box, 0);
        if (topChild) {
          topChild.prediction = new SectionPrediction({
            sectionType: "header",
            sectionFeatures: topChild.prediction.sectionFeatures,
            confidence: -1
          });
        }
      }
      const foundFooter = findChildType(box, "footer");
      if (!foundFooter) {
        const lastChild = findLastChild(box, -1);
        if (lastChild) {
          lastChild.prediction = new SectionPrediction({
            sectionType: "footer",
            sectionFeatures: lastChild.prediction.sectionFeatures,
            confidence: -1
          });
        }
      }
    }
    return box.prediction;
  }
  function getAllVisibleDivs() {
    const types = [...document.body.querySelectorAll("*")].filter((el) => {
      return !["IFRAME", "NOSCRIPT", "BR", "EM", "STRONG", "STYLE", "SCRIPT"].includes(el.nodeName);
    }).reduce((acc, currValue, currIdx) => {
      var cl = currValue.closest("svg");
      if (!(cl !== null && cl !== currValue) && !acc.includes(currValue.nodeName)) {
        acc.push(currValue.nodeName);
      }
      return acc;
    }, []);
    console.log("DOM node types:", types);
    const divs = [...document.querySelectorAll(types.join(","))];
    const visibleDivs = xp2.filterDivs(divs);
    console.log(`found ${visibleDivs.length} visible divs to show!`);
    return visibleDivs;
  }
  xp2.getAllVisibleDivs = getAllVisibleDivs;
  xp2.buildBoxTree = (divs, window2) => {
    const root = new Box(0, 0, window2.innerWidth, window2.document.scrollingElement.scrollHeight);
    const boxes = divs.map((d) => Box.fromDiv(d, window2));
    function builBoxesdHierarchy(parent, children, usedIndices) {
      children.forEach((child, index) => {
        if (usedIndices.has(index)) {
          return;
        }
        const ccc = parent.contains(child, false);
        if (ccc) {
          const newParent = child;
          parent.addChild(newParent);
          usedIndices.add(index);
          builBoxesdHierarchy(newParent, children, usedIndices);
        }
      });
    }
    builBoxesdHierarchy(root, boxes, /* @__PURE__ */ new Set());
    function computeLayout(box) {
      box.determineLayout();
      box.children.forEach(computeLayout);
    }
    computeLayout(root);
    function flattenHierarchy(box) {
      if (box.children.length === 1 && box.layout.numCols === 1) {
        const child = box.children[0];
        box.children = child.children;
        flattenHierarchy(box);
        box.determineLayout();
      } else {
        box.children.forEach(flattenHierarchy);
      }
    }
    flattenHierarchy(root);
    function flattenHierarchy2(box) {
      if (box.children.length > 1 && box.layout.numCols === 1 && box.children.every((child) => child.layout.numRows === 0 && child.layout.numCols === 0)) {
        box.children = [];
        flattenHierarchy2(box);
        box.determineLayout();
      } else {
        box.children.forEach(flattenHierarchy2);
      }
    }
    flattenHierarchy2(root);
    function mergeMultiSingleRowColums(box) {
      if (box.children.length > 1) {
        const numCols = box.children[0].layout.numCols;
        if (box.layout.numRows > 1 && box.layout.numCols === 1 && box.children.every((child) => child.layout.numRows === 1 && child.layout.numCols > 1 && child.layout.numCols === numCols)) {
          console.log("mergeMultiSingleRowColums", box);
          const newChildren = [];
          box.children.forEach((child) => {
            newChildren.push(...child.children);
          });
          box.children = newChildren;
          box.determineLayout();
        } else {
          box.children.forEach(mergeMultiSingleRowColums);
        }
      }
    }
    mergeMultiSingleRowColums(root);
    computeLayout(root);
    return root;
  };
  xp2.getVerticalBoxesFromHierarchy = (boxes, keepDeepChildren = true) => {
    const root = { ...boxes };
    function getVerticalBoxes(box) {
      const children = box.children;
      const hasHorizontalEls = children.some((child1) => {
        return children.some((child2) => {
          if (child1 !== child2 && !child1.isInside(child2) && (child1.x >= child2.x + child2.width || child1.x + child1.width <= child2.x)) {
            return true;
          }
          return false;
        });
      });
      if (hasHorizontalEls) {
        box.setChildren([]);
        return;
      } else {
        for (let i = 0; i < children.length; i++) {
          getVerticalBoxes(children[i]);
        }
      }
    }
    getVerticalBoxes(root);
    return root.children;
  };
  xp2.boxes = null;
  xp2.selectElementToIgnore = () => {
    document.body.style.cursor = "crosshair";
    const target = xp2.ui.overlaysDiv();
    target.addEventListener(
      "click",
      (e) => {
        const el = e.target;
        if (el.classList.contains("xp-overlay")) {
          el.remove();
        }
        xp2.ignoreElementForDection(el.dataset.boxId);
        document.body.style.removeProperty("cursor");
      },
      { once: true }
    );
  };
  xp2.ignoreElementForDection = (boxId) => {
    function findBox(box) {
      if (box.id === boxId) {
        let deleteOverlayDivs = function(box2) {
          const target = xp2.ui.overlaysDiv();
          [...target.querySelectorAll(".xp-overlay")].forEach((el) => {
            if (el.dataset.boxId === box2.id) {
              el.remove();
            }
          });
          box2.children.forEach(deleteOverlayDivs);
        };
        box.ignored = true;
        deleteOverlayDivs(box);
        return true;
      } else {
        return box.children.some(findBox);
      }
    }
    findBox(xp2.boxes);
  };
  xp2.predictPage = (window2) => {
    if (xp2.boxes?.children?.length > 0) {
      let displayPrediction = function(box) {
        if (!box.ignored) {
          if (box.prediction && box.prediction.sectionType !== "unknown" || box.prediction && box.prediction.sectionType === "unknown" && box.children.length === 0) {
            finalBoxes.push(box);
            console.warn(box.div, box.prediction);
            if (xp2.ui) {
              highlightBox(box, {
                window: window2,
                padding: 0,
                color: "rgba(0, 255, 0, 1)",
                label: box.prediction.sectionType
              });
            }
          } else {
            box.children.forEach(displayPrediction);
          }
        }
      };
      xp2.ui?.resetOverlays();
      predictSection(xp2.boxes, 0, null, window2);
      const finalBoxes = [];
      displayPrediction(xp2.boxes);
      const template2 = xp2.boxes.children.map((child) => {
        const tpl = [DOM.getXPath(child.div, document)];
        tpl.push(...child.children.map((c) => "- " + DOM.getXPath(c.div, document)));
        return tpl.join("\n") || "";
      }).join("\n") || "";
      xp2.boxes.template = {
        raw: template2,
        hash: hashCode(template2)
      };
      xp2.predictedBoxes = finalBoxes;
      console.log("final boxes", xp2.boxes);
      console.log("predicted boxes", xp2.predictedBoxes);
      xp2.ui?.toggleOverlays(true);
      return xp2.boxes;
    }
  };
  xp2.detectSections = async (root, window2, options = { autoDetect: false }) => {
    xp2.ui?.resetOverlays();
    const { document: document2 } = window2;
    let divs = DOM.getAllVisibleElements(root, window2);
    console.log("visible divs", divs);
    divs = divs.filter((div) => {
      const rect = div.getBoundingClientRect();
      return rect.width * rect.height > 1e4;
    });
    console.log("filtered divs", divs);
    const boxes = xp2.buildBoxTree(divs, window2);
    console.log("boxes hierarchy", boxes);
    function setXPath(box, document3) {
      if (box.div) {
        box.xpath = DOM.getXPath(box.div, document3);
        box.xpathWithDetails = DOM.getXPath(box.div, document3, true);
        box.id = `box-id-${hashCode(box.xpath)}`;
      }
      if (box.children && box.children.length > 0) {
        box.children.forEach((c) => setXPath(c, document3));
      }
    }
    setXPath(boxes, document2);
    xp2.boxes = boxes;
    const template2 = boxes.children.map((child) => {
      const tpl = [child.xpath];
      tpl.push(...child.children.map((c) => "- " + c.xpath));
      return tpl.join("\n") || "";
    }).join("\n") || "";
    console.log("template", template2);
    xp2.template = {
      raw: template2,
      hash: hashCode(template2)
    };
    if (!options.autoDetect) {
      highlightAllBoxes(boxes.children, window2);
    } else {
      if (xp2.boxes?.children?.length > 0) {
        let displayPrediction = function(box) {
          if (!box.ignored) {
            if (box.prediction && box.prediction.sectionType !== "unknown" || box.prediction && box.prediction.sectionType === "unknown" && box.children.length === 0) {
              finalBoxes.push(box);
            } else {
              box.children.forEach(displayPrediction);
            }
          }
        };
        predictSection(xp2.boxes, 0, null, window2);
        const finalBoxes = [];
        displayPrediction(xp2.boxes);
        finalBoxes.forEach((box) => {
          highlightBox(box, {
            window: window2,
            target: window2.document.body,
            padding: 0,
            color: box.color,
            label: box.prediction.sectionType
          });
        });
        const template3 = xp2.boxes.children.map((child) => {
          const tpl = [DOM.getXPath(child.div, document2)];
          tpl.push(...child.children.map((c) => "- " + DOM.getXPath(c.div, document2)));
          return tpl.join("\n") || "";
        }).join("\n") || "";
        xp2.boxes.template = {
          raw: template3,
          hash: hashCode(template3)
        };
        xp2.boxes.predictedBoxes = finalBoxes;
        console.log("final boxes", xp2.boxes);
        xp2.ui?.toggleOverlays(true);
      }
    }
    xp2.ui?.toggleOverlays(true);
    return xp2.boxes;
  };
  if (false) {
    xp2.ui = new UI();
    xp2.ui.show();
  }
  window.xp = xp2;
})();

















// ==>> CUSTOM SCRIPT <<==

var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // js/sections-mapping/import/sections-mapping.lpb.import.js
  var IMPORT_TARGETS2 = {
    AEM_BLOCK_COLLECTION: "aem-block-collection",
    CROSSWALK: "crosswalk"
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
      const { predictedBoxes } = yield window.xp.detectSections(
        document2.body,
        window,
        { autoDetect: true }
      );
      console.log("sections", predictedBoxes);
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
          predictedBoxes.filter((s) => {
            var _a;
            return ((_a = s.prediction) == null ? void 0 : _a.sectionType) === "header";
          }).forEach((s) => {
            el.appendChild(s.div);
          });
          element.element = el;
          element.path = "/nav";
        } else if (parseInt(esaasImpId.slice(-1), 10) % 2 === 1) {
          console.log("esaasImpId is odd");
          const el = document2.createElement("div");
          predictedBoxes.filter((s) => {
            var _a;
            return ((_a = s.prediction) == null ? void 0 : _a.sectionType) === "footer";
          }).forEach((s) => {
            el.appendChild(s.div);
          });
          element.element = el;
          element.path = "/footer";
        } else {
          const el = document2.body;
          const elsToRemove = [];
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
