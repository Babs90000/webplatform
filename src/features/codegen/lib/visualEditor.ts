/**
 * Édition visuelle du site dans l'aperçu iframe.
 *
 * Deux moitiés coopèrent :
 *  - Un script injecté DANS l'iframe (`EDITOR_SCRIPT`) qui rend les textes
 *    éditables, les images et les fonds remplaçables, puis remonte chaque
 *    action au parent via postMessage avec un CHEMIN D'INDICES (ex. "2.0.1").
 *  - `applyVisualEdit`, exécuté côté React, qui rejoue ce chemin sur le HTML
 *    SOURCE de la page (DOMParser) pour persister le changement.
 *
 * Repérage par chemin d'indices (et non sélecteur CSS) : le bundler d'aperçu
 * n'ajoute ses éléments qu'À LA FIN du <body>, donc les index des éléments
 * d'origine restent identiques entre l'iframe et le fichier source.
 */

export type VisualEditKind = "text" | "image" | "background" | "move";

export interface VisualEditMessage {
  type:
    | "wp-edit-text"
    | "wp-edit-image-request"
    | "wp-edit-bg-request"
    | "wp-edit-move";
  path: string;
  value?: string;
  current?: string;
  fromPath?: string;
  toPath?: string;
  position?: VisualMovePosition;
}

export type VisualMovePosition = "before" | "after" | "append";

const EDITOR_STYLE = `
<style id="wp-editor-style">
  body.wp-edit-on [data-wp-text]{
    box-shadow:inset 0 0 0 2px rgba(99,102,241,.5);
    cursor:text;border-radius:3px;transition:box-shadow .15s ease,background .15s ease;
    min-width:0;max-width:100%;word-break:break-word;
  }
  body.wp-edit-on [data-wp-text]:focus{
    white-space:pre-wrap;overflow-wrap:break-word;
    box-shadow:inset 0 0 0 2px #6366f1;background:rgba(99,102,241,.08);
  }
  body.wp-edit-on [data-wp-text]:hover{
    box-shadow:inset 0 0 0 2px rgba(99,102,241,.65);
  }
  body.wp-edit-on [data-wp-text] [contenteditable="false"]{cursor:default;user-select:none;}
  body.wp-edit-on [data-wp-img]{
    outline:2px dashed rgba(244,162,97,.85);outline-offset:2px;
    cursor:pointer;transition:outline-color .15s ease;max-width:100%;height:auto;
  }
  body.wp-edit-on [data-wp-img]:hover{outline-color:#f4a261;outline-style:solid;}
  body.wp-edit-on svg[data-wp-img]{pointer-events:auto;}
  body.wp-edit-on [data-wp-bg]{cursor:pointer;}
  body.wp-edit-on [data-wp-bg]::after{
    content:'Changer le fond';position:absolute;top:8px;right:8px;z-index:50;
    background:rgba(17,24,39,.85);color:#fff;font:600 11px/1 system-ui,sans-serif;
    padding:6px 10px;border-radius:999px;opacity:0;transition:opacity .15s ease;pointer-events:none;
    max-width:calc(100% - 16px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  body.wp-edit-on [data-wp-bg]:hover{outline:2px dashed #34d399;outline-offset:-2px;}
  body.wp-edit-on [data-wp-bg]:hover::after{opacity:1;}
  body.wp-edit-on [data-wp-move]{
    outline:2px dashed rgba(52,211,153,.45);outline-offset:4px;position:relative;
  }
  body.wp-edit-on [data-wp-move].wp-drag-over{
    outline-color:#34d399;outline-style:solid;background:rgba(52,211,153,.06);
  }
  body.wp-edit-on [data-wp-move].wp-drag-over-append{
    outline-color:#10b981;outline-style:solid;background:rgba(16,185,129,.1);
  }
  body.wp-edit-on [data-wp-move].wp-drag-over-append::before{
    content:'Déposer dans cette section';position:absolute;bottom:12px;left:50%;
    transform:translateX(-50%);z-index:50;background:#065f46;color:#fff;
    font:600 11px/1 system-ui,sans-serif;padding:6px 12px;border-radius:999px;pointer-events:none;
    max-width:calc(100% - 24px);text-align:center;
  }
  body.wp-edit-on [data-wp-move].wp-dragging{opacity:.55;}
  .wp-move-handle{
    position:absolute;top:8px;left:8px;z-index:2147483646;
    width:30px;height:30px;border-radius:8px;border:none;
    background:#111827;color:#fff;font:700 13px/30px system-ui,sans-serif;
    text-align:center;cursor:grab;opacity:.9;user-select:none;padding:0;
    box-shadow:0 4px 12px rgba(0,0,0,.28);letter-spacing:-1px;touch-action:none;
  }
  .wp-move-handle:active{cursor:grabbing;}
  .wp-edit-hint{
    position:fixed;left:50%;bottom:max(12px,env(safe-area-inset-bottom));
    transform:translateX(-50%);z-index:2147483647;background:#111827;color:#fff;
    font:600 12px/1.45 system-ui,sans-serif;padding:10px 18px;border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;text-align:center;
    max-width:min(92vw,520px);
  }
  @media (max-width:640px){
    .wp-move-handle{width:28px;height:28px;font-size:12px;line-height:28px;top:6px;left:6px;}
    .wp-edit-hint{font-size:11px;padding:8px 12px;line-height:1.4;}
    body.wp-edit-on [data-wp-bg]::after{font-size:10px;padding:5px 8px;}
  }
</style>`;

const EDITOR_SCRIPT = `
<script id="wp-editor-script">
(function(){
  var dragFromPath='';
  var INLINE_TAGS=['a','span','strong','em','b','i','u','small','mark','sub','sup','code',
    'abbr','time','q','cite','s','del','ins','kbd','samp','var','label','bdi','bdo','br','wbr'];
  var TEXT_CANDIDATE='h1,h2,h3,h4,h5,h6,p,li,figcaption,blockquote,caption,dt,dd,legend,summary,td,th,address,label,a,button,span,div';

  function hasText(el){return !!(el.textContent && el.textContent.replace(/\\s+/g,'').length>0);}

  function isInlineTag(el){return INLINE_TAGS.indexOf(el.tagName.toLowerCase())>=0;}

  function isLucideIcon(el){
    if(!el||el.nodeType!==1) return false;
    var tag=el.tagName.toLowerCase();
    if(tag==='i'&&(el.hasAttribute('data-lucide')||el.classList.contains('lucide'))) return true;
    if(tag==='svg'&&el.classList.contains('lucide')) return true;
    if(el.closest('.icon-wrap')) return true;
    return false;
  }

  function isDecorative(el){
    if(!el||el.nodeType!==1) return false;
    var tag=el.tagName.toLowerCase();
    if(tag==='svg'){
      if(isLucideIcon(el)) return true;
      if(el.closest('.logo,[class*="logo"],.brand,[class*="brand"],header,nav,a')) return true;
      return false;
    }
    if(['script','style','hr','img','picture','video','canvas','iframe','input','textarea','select'].indexOf(tag)>=0) return true;
    if(isLucideIcon(el)) return true;
    if(el.classList&&el.classList.contains('wp-move-handle')) return true;
    return false;
  }

  function childBlocksTextEdit(el){
    for(var i=0;i<el.children.length;i++){
      var child=el.children[i];
      if(isDecorative(child)) continue;
      if(isInlineTag(child)) continue;
      if(child.getAttribute&&child.getAttribute('data-wp-text')==='1') continue;
      return true;
    }
    return false;
  }

  function canEditText(el){
    if(!el||el.nodeType!==1) return false;
    if(el.classList&&el.classList.contains('wp-move-handle')) return false;
    if(el.getAttribute('data-wp-text')==='1') return false;
    if(!hasText(el)) return false;
    if(childBlocksTextEdit(el)) return false;
    var tag=el.tagName.toLowerCase();
    if(['script','style','noscript','ul','ol','table','thead','tbody','tr','form'].indexOf(tag)>=0) return false;
    var SEM=['h1','h2','h3','h4','h5','h6','p','li','figcaption','blockquote','caption','dt','dd','legend','summary','td','th','address','label'];
    if(SEM.indexOf(tag)>=0) return true;
    if(tag==='a'||tag==='button') return true;
    if(tag==='div'||tag==='span'){
      if(el.querySelector('[data-wp-text]')) return false;
      return !childBlocksTextEdit(el);
    }
    return false;
  }

  var GRID_RE=/features|feature-grid|cards|cards-grid|grid-cards/i;
  var PROTECTED=['nav','header','footer'];

  function pathOf(el){
    var path=[];
    while(el && el.parentElement && el.tagName.toLowerCase()!=='body'){
      var parent=el.parentElement;
      path.unshift(Array.prototype.indexOf.call(parent.children, el));
      el=parent;
    }
    return path.join('.');
  }

  function resolvePath(path){
    var parts=path.split('.');
    var node=document.body;
    for(var i=0;i<parts.length;i++){
      var idx=parseInt(parts[i],10);
      if(isNaN(idx)||!node.children[idx]) return null;
      node=node.children[idx];
    }
    return node;
  }

  function isProtected(el){
    while(el){
      if(PROTECTED.indexOf(el.tagName.toLowerCase())>=0) return true;
      el=el.parentElement;
    }
    return false;
  }

  function isMainChild(el){
    var p=el && el.parentElement;
    if(!p) return false;
    var t=p.tagName.toLowerCase();
    return t==='main'||t==='body';
  }

  function isGridContainer(el){
    if(!el||!el.className) return false;
    var cls=String(el.className);
    if(GRID_RE.test(cls)) return true;
    var list=el.classList;
    for(var i=0;i<list.length;i++){
      var c=list[i];
      if(c.indexOf('features-')===0||c.indexOf('feature-')===0||c.indexOf('cards-')===0) return true;
    }
    return false;
  }

  function moveKind(el){
    if(!el) return 'unknown';
    var tag=el.tagName.toLowerCase();
    if(tag==='section'||tag==='article'){
      if(el.parentElement && isGridContainer(el.parentElement)) return 'card';
      if(isMainChild(el)) return 'section';
      if(el.parentElement && el.parentElement.tagName.toLowerCase()==='section') return 'card';
    }
    return 'card';
  }

  function findGridInSection(section){
    var grids=section.querySelectorAll('.features,.feature-grid,.cards,.cards-grid,.grid-cards,[class*="features-"],[class*="feature-"],[class*="cards-"]');
    return grids.length ? grids[0] : null;
  }

  function canMove(fromEl,toEl,position){
    if(!fromEl||!toEl||fromEl===toEl) return false;
    if(isProtected(fromEl)||isProtected(toEl)) return false;
    if(fromEl.contains(toEl)||toEl.contains(fromEl)) return false;
    var fk=moveKind(fromEl);
    var tk=moveKind(toEl);
    if(fk==='section'){
      return tk==='section' && position!=='append';
    }
    if(fk==='card'){
      if(tk==='section') return position==='append';
      if(tk==='card') return position!=='append';
    }
    return false;
  }

  function markTextEl(el){
    el.setAttribute('data-wp-text','1');
    el.setAttribute('contenteditable','true');
    el.setAttribute('spellcheck','false');
    el.dataset.wpOriginal=el.innerHTML;
    Array.prototype.forEach.call(el.querySelectorAll('svg,i[data-lucide],.icon-wrap,.lucide,img[data-wp-img]'),function(dec){
      if(!dec||!dec.setAttribute) return;
      dec.setAttribute('contenteditable','false');
    });
  }

  function markEditableText(){
    var nodes=document.querySelectorAll(TEXT_CANDIDATE);
    for(var i=nodes.length-1;i>=0;i--){
      if(canEditText(nodes[i])) markTextEl(nodes[i]);
    }
  }

  function markImagesAndLogos(){
    Array.prototype.forEach.call(document.images,function(img){
      img.setAttribute('data-wp-img','1');
    });
    Array.prototype.forEach.call(document.querySelectorAll('svg'),function(svg){
      if(isLucideIcon(svg)) return;
      if(svg.closest('.wp-move-handle')) return;
      var box=svg.getBoundingClientRect();
      if(box.width>0&&box.width<18&&box.height>0&&box.height<18) return;
      svg.setAttribute('data-wp-img','1');
    });
  }

  function markBackgrounds(){
    var all=document.body.getElementsByTagName('*');
    Array.prototype.forEach.call(all,function(el){
      var tag=el.tagName.toLowerCase();
      if(tag==='img'||tag==='svg'||tag==='script'||tag==='style') return;
      var cs=window.getComputedStyle(el);
      var bg=cs.backgroundImage;
      if(!bg||bg==='none') return;
      var cls=String(el.className||'');
      var inHero=el.closest&&el.closest('.hero,[class*="hero"],[class*="banner"],[class*="jumbotron"],section[id*="hero"]');
      var likelyBg=/hero|banner|jumbotron|cover|cta|parallax|bg-|background/i.test(cls);
      var isLarge=el.clientWidth>=160&&el.clientHeight>=80;
      if(!isLarge&&!likelyBg&&!inHero) return;
      if(getComputedStyle(el).position==='static') el.style.position='relative';
      el.setAttribute('data-wp-bg','1');
    });
  }

  function addMoveHandle(el){
    if(el.getAttribute('data-wp-move')==='1') return;
    if(el.querySelector('.wp-move-handle')) return;
    el.setAttribute('data-wp-move','1');
    if(getComputedStyle(el).position==='static') el.style.position='relative';
    var h=document.createElement('button');
    h.type='button';
    h.className='wp-move-handle';
    h.textContent='⋮⋮';
    h.title='Glisser pour déplacer';
    h.setAttribute('draggable','true');
    h.addEventListener('dragstart',function(e){
      e.stopPropagation();
      el.classList.add('wp-dragging');
      dragFromPath=pathOf(el);
      e.dataTransfer.setData('text/wp-from-path',dragFromPath);
      e.dataTransfer.effectAllowed='move';
    });
    h.addEventListener('dragend',function(){
      dragFromPath='';
      el.classList.remove('wp-dragging');
      Array.prototype.forEach.call(document.querySelectorAll('.wp-drag-over'),function(n){
        n.classList.remove('wp-drag-over');
      });
    });
    el.insertBefore(h, el.firstChild);
  }

  function markMovableBlocks(){
    ['section','article'].forEach(function(tag){
      Array.prototype.forEach.call(document.getElementsByTagName(tag),function(el){
        if(el.closest('nav')||el.closest('footer')) return;
        addMoveHandle(el);
      });
    });
    var gridSelectors=['.features','.feature-grid','.cards','.cards-grid','.grid-cards',
      '[class*="features-"]','[class*="feature-"]','[class*="cards-"]'];
    gridSelectors.forEach(function(sel){
      try{
        Array.prototype.forEach.call(document.querySelectorAll(sel),function(grid){
          Array.prototype.forEach.call(grid.children,function(child){
            if(!child || child.nodeType!==1) return;
            var t=child.tagName.toLowerCase();
            if(t==='script'||t==='style') return;
            addMoveHandle(child);
          });
        });
      }catch(err){}
    });
  }

  function showHint(){
    if(document.querySelector('.wp-edit-hint')) return;
    var h=document.createElement('div');
    h.className='wp-edit-hint';
    h.innerHTML='Texte, logo, image : cliquez pour modifier · <strong>Entrée</strong> = saut de ligne · <strong>Shift+Entrée</strong> = enregistrer<br><strong>⋮⋮</strong> = déplacer sections et cartes';
    document.body.appendChild(h);
    setTimeout(function(){h&&h.remove();},8000);
  }

  function send(msg){window.parent.postMessage(msg, document.referrer || '*');}

  document.body.classList.add('wp-edit-on');
  markEditableText();
  markImagesAndLogos();
  markBackgrounds();
  markMovableBlocks();
  showHint();

  document.addEventListener('click',function(e){
    if(e.target.closest && e.target.closest('.wp-move-handle')) return;
    var a=e.target.closest && e.target.closest('a');
    if(a) e.preventDefault();
    if(e.target.closest && e.target.closest('[data-wp-text]')) return;
    var img=e.target.closest && e.target.closest('[data-wp-img]');
    if(img){
      e.preventDefault();e.stopPropagation();
      var tag=img.tagName.toLowerCase();
      var current=tag==='img'?(img.getAttribute('src')||''):'';
      send({type:'wp-edit-image-request',path:pathOf(img),current:current});
      return;
    }
    var bg=e.target.closest && e.target.closest('[data-wp-bg]');
    if(bg){e.preventDefault();e.stopPropagation();send({type:'wp-edit-bg-request',path:pathOf(bg)});return;}
  },true);

  document.addEventListener('focusout',function(e){
    var el=e.target;
    if(!el || !el.getAttribute || el.getAttribute('data-wp-text')!=='1') return;
    var value=el.innerHTML;
    if(value===el.dataset.wpOriginal) return;
    el.dataset.wpOriginal=value;
    send({type:'wp-edit-text',path:pathOf(el),value:value});
  },true);

  document.addEventListener('keydown',function(e){
    if(!e.target || e.target.getAttribute('data-wp-text')!=='1') return;
    if(e.key==='Enter' && e.shiftKey){
      e.preventDefault();
      e.target.blur();
      return;
    }
    if(e.key==='Enter'){
      e.preventDefault();
      if(document.queryCommandSupported && document.queryCommandSupported('insertLineBreak')){
        document.execCommand('insertLineBreak');
        return;
      }
      var sel=window.getSelection();
      if(!sel || sel.rangeCount===0) return;
      var range=sel.getRangeAt(0);
      range.deleteContents();
      var br=document.createElement('br');
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  },true);

  function clearDragHighlights(){
    Array.prototype.forEach.call(document.querySelectorAll('.wp-drag-over,.wp-drag-over-append'),function(n){
      n.classList.remove('wp-drag-over');
      n.classList.remove('wp-drag-over-append');
    });
  }

  document.addEventListener('dragover',function(e){
    var fromEl=dragFromPath ? resolvePath(dragFromPath) : null;
    var el=e.target.closest && e.target.closest('[data-wp-move]');
    if(!el) return;
    e.preventDefault();
    if(e.dataTransfer) e.dataTransfer.dropEffect='move';
    clearDragHighlights();
    var fk=moveKind(fromEl);
    var tk=moveKind(el);
    var rect=el.getBoundingClientRect();
    var position;
    if(fk==='card' && tk==='section'){
      position='append';
      el.classList.add('wp-drag-over-append');
    } else {
      position=(e.clientY - rect.top) < rect.height / 2 ? 'before' : 'after';
      el.classList.add('wp-drag-over');
    }
    if(!canMove(fromEl,el,position)) clearDragHighlights();
  },true);

  document.addEventListener('dragleave',function(e){
    if(!e.relatedTarget || !document.body.contains(e.relatedTarget)) clearDragHighlights();
  },true);

  document.addEventListener('drop',function(e){
    var target=e.target.closest && e.target.closest('[data-wp-move]');
    clearDragHighlights();
    if(!target) return;
    e.preventDefault();
    e.stopPropagation();
    var fromPath=e.dataTransfer && e.dataTransfer.getData('text/wp-from-path');
    if(!fromPath) return;
    var fromEl=resolvePath(fromPath);
    var toPath=pathOf(target);
    if(fromPath===toPath) return;
    var fk=moveKind(fromEl);
    var tk=moveKind(target);
    var rect=target.getBoundingClientRect();
    var position;
    if(fk==='card' && tk==='section') position='append';
    else position=(e.clientY - rect.top) < rect.height / 2 ? 'before' : 'after';
    if(!canMove(fromEl,target,position)) return;
    send({type:'wp-edit-move',fromPath:fromPath,toPath:toPath,position:position});
  },true);
})();
</script>`;

/** Injecte l'éditeur dans le HTML d'aperçu (avant </body>). */
export const injectVisualEditor = (html: string): string => {
  if (!html) return html;
  const injection = `${EDITOR_STYLE}${EDITOR_SCRIPT}`;
  if (html.includes("</body>")) {
    return html.replace("</body>", `${injection}</body>`);
  }
  return html + injection;
};

/** Suit un chemin d'indices ("2.0.1") depuis body et renvoie l'élément. */
const resolvePath = (body: Element, path: string): Element | null => {
  const parts = path
    .split(".")
    .map((p) => Number.parseInt(p, 10))
    .filter((n) => !Number.isNaN(n));
  let node: Element | null = body;
  for (const idx of parts) {
    if (!node) return null;
    node = node.children[idx] ?? null;
  }
  return node;
};

/** Échappe une valeur pour un sélecteur d'attribut CSS. */
const cssAttrEscape = (value: string): string =>
  value.replace(/["\\]/g, "\\$&");

export interface VisualMoveEdit {
  fromPath: string;
  toPath: string;
  position: VisualMovePosition;
}

const PROTECTED_ANCESTORS = new Set(["nav", "header", "footer"]);
const GRID_CLASS_RE =
  /features|feature-grid|cards|cards-grid|grid-cards/i;

type MoveBlockKind = "section" | "card" | "unknown";

const isProtectedElement = (el: Element): boolean => {
  let node: Element | null = el;
  while (node) {
    if (PROTECTED_ANCESTORS.has(node.tagName.toLowerCase())) return true;
    node = node.parentElement;
  }
  return false;
};

const isMainContentChild = (el: Element): boolean => {
  const parent = el.parentElement;
  if (!parent) return false;
  const tag = parent.tagName.toLowerCase();
  return tag === "main" || tag === "body";
};

const isGridContainerEl = (el: Element): boolean => {
  const cls = el.className?.toString() ?? "";
  if (GRID_CLASS_RE.test(cls)) return true;
  return Array.from(el.classList).some(
    (c) =>
      c.startsWith("features-") ||
      c.startsWith("feature-") ||
      c.startsWith("cards-"),
  );
};

const classifyMoveElement = (el: Element): MoveBlockKind => {
  const tag = el.tagName.toLowerCase();
  if (tag === "section" || tag === "article") {
    if (el.parentElement && isGridContainerEl(el.parentElement)) return "card";
    if (isMainContentChild(el)) return "section";
    if (el.parentElement?.tagName.toLowerCase() === "section") return "card";
  }
  return "card";
};

const findGridInSectionEl = (section: Element): Element | null => {
  const candidates = section.querySelectorAll(
    [
      ".features",
      ".feature-grid",
      ".cards",
      ".cards-grid",
      ".grid-cards",
      '[class*="features-"]',
      '[class*="feature-"]',
      '[class*="cards-"]',
    ].join(","),
  );
  return candidates[0] ?? null;
};

const canApplyVisualMove = (
  fromEl: Element,
  toEl: Element,
  position: VisualMovePosition,
): boolean => {
  if (fromEl === toEl) return false;
  if (isProtectedElement(fromEl) || isProtectedElement(toEl)) return false;
  if (fromEl.contains(toEl) || toEl.contains(fromEl)) return false;

  const fromKind = classifyMoveElement(fromEl);
  const toKind = classifyMoveElement(toEl);

  if (fromKind === "section") {
    return toKind === "section" && position !== "append";
  }
  if (fromKind === "card") {
    if (toKind === "section") return position === "append";
    if (toKind === "card") return position !== "append";
  }
  return false;
};

/** Déplace ou réordonne un bloc dans le HTML source (même parent ou cross-parent). */
export const applyVisualMove = (
  sourceHtml: string,
  edit: VisualMoveEdit,
): string | null => {
  if (typeof window === "undefined") return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml, "text/html");
  if (!doc.body) return null;

  const fromEl = resolvePath(doc.body, edit.fromPath);
  const toEl = resolvePath(doc.body, edit.toPath);
  if (!fromEl || !toEl) return null;
  if (!canApplyVisualMove(fromEl, toEl, edit.position)) return null;

  const fromParent = fromEl.parentElement;
  if (!fromParent) return null;

  fromParent.removeChild(fromEl);

  if (edit.position === "append") {
    const container = findGridInSectionEl(toEl) ?? toEl;
    container.appendChild(fromEl);
  } else {
    const toParent = toEl.parentElement;
    if (!toParent) return null;
    if (edit.position === "before") {
      toParent.insertBefore(fromEl, toEl);
    } else {
      toParent.insertBefore(fromEl, toEl.nextSibling);
    }
  }

  const doctype = doc.doctype ? "<!DOCTYPE html>\n" : "";
  return doctype + doc.documentElement.outerHTML;
};

/** Remplace un SVG (logo) par une balise img dans le document parsé. */
const replaceSvgWithImage = (
  svg: Element,
  url: string,
  alt?: string,
): void => {
  const doc = svg.ownerDocument;
  const img = doc.createElement("img");
  img.setAttribute("src", url);
  img.setAttribute("alt", alt ?? "Logo");
  img.setAttribute("loading", "lazy");
  const cls = svg.getAttribute("class")?.replace(/\blucide\b/g, "").trim();
  if (cls) img.setAttribute("class", cls);
  const w = svg.getAttribute("width");
  const h = svg.getAttribute("height");
  if (w) img.setAttribute("width", w);
  if (h) img.setAttribute("height", h);
  const style = (svg as HTMLElement).getAttribute("style");
  if (style) img.setAttribute("style", style);
  svg.parentNode?.replaceChild(img, svg);
};

/**
 * Applique une modification au HTML source d'une page et renvoie le HTML mis
 * à jour. Renvoie null si le chemin ne correspond à rien.
 */
export const applyVisualEdit = (
  sourceHtml: string,
  edit: {
    kind: VisualEditKind;
    path: string;
    value: string;
    alt?: string;
    current?: string;
  },
): string | null => {
  if (typeof window === "undefined") return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml, "text/html");
  if (!doc.body) return null;

  let target = resolvePath(doc.body, edit.path);

  if (edit.kind === "image") {
    if (target?.tagName.toLowerCase() === "picture") {
      target = target.querySelector("img") ?? target;
    }
    if (
      (!target ||
        !["img", "svg"].includes(target.tagName.toLowerCase())) &&
      edit.current
    ) {
      target =
        doc.querySelector(`img[src="${cssAttrEscape(edit.current)}"]`) ??
        target;
    }
  }

  if (!target) return null;

  if (edit.kind === "text") {
    target.innerHTML = edit.value;
  } else if (edit.kind === "image") {
    const tag = target.tagName.toLowerCase();
    if (tag === "svg") {
      replaceSvgWithImage(target, edit.value, edit.alt);
    } else {
      target.setAttribute("src", edit.value);
      if (edit.alt !== undefined) target.setAttribute("alt", edit.alt);
      target.setAttribute("loading", "lazy");
      const picture = target.closest("picture");
      if (picture) {
        picture.querySelectorAll("source").forEach((source) => {
          source.remove();
        });
      }
    }
  } else if (edit.kind === "background") {
    const el = target as HTMLElement;
    el.style.backgroundImage = `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('${edit.value}')`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";
  }

  const doctype = doc.doctype ? "<!DOCTYPE html>\n" : "";
  return doctype + doc.documentElement.outerHTML;
};
