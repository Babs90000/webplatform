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

export type VisualEditKind = "text" | "image" | "background";

export interface VisualEditMessage {
  type: "wp-edit-text" | "wp-edit-image-request" | "wp-edit-bg-request";
  path: string;
  value?: string;
}

const EDITOR_STYLE = `
<style id="wp-editor-style">
  body.wp-edit-on [data-wp-text]{
    outline:2px dashed rgba(99,102,241,.55);outline-offset:3px;
    cursor:text;border-radius:3px;transition:outline-color .15s ease,background .15s ease;
  }
  body.wp-edit-on [data-wp-text]:hover,
  body.wp-edit-on [data-wp-text]:focus{
    outline-color:#6366f1;background:rgba(99,102,241,.08);outline-style:solid;
  }
  body.wp-edit-on [data-wp-img]{
    outline:2px dashed rgba(244,162,97,.85);outline-offset:3px;
    cursor:pointer;transition:outline-color .15s ease;
  }
  body.wp-edit-on [data-wp-img]:hover{outline-color:#f4a261;outline-style:solid;}
  body.wp-edit-on [data-wp-bg]{cursor:pointer;}
  body.wp-edit-on [data-wp-bg]::after{
    content:'🖼 Changer le fond';position:absolute;top:8px;right:8px;z-index:50;
    background:rgba(17,24,39,.85);color:#fff;font:600 11px/1 system-ui,sans-serif;
    padding:6px 10px;border-radius:999px;opacity:0;transition:opacity .15s ease;pointer-events:none;
  }
  body.wp-edit-on [data-wp-bg]:hover{outline:2px dashed #34d399;outline-offset:-2px;}
  body.wp-edit-on [data-wp-bg]:hover::after{opacity:1;}
  .wp-edit-hint{
    position:fixed;left:50%;bottom:16px;transform:translateX(-50%);
    z-index:2147483647;background:#111827;color:#fff;font:600 13px/1.4 system-ui,sans-serif;
    padding:8px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.35);
    pointer-events:none;text-align:center;max-width:90vw;
  }
</style>`;

const EDITOR_SCRIPT = `
<script id="wp-editor-script">
(function(){
  // Balises considérées comme "inline" : tolérées à l'intérieur d'un bloc texte.
  var INLINE=['a','span','strong','em','b','i','u','small','mark','sub','sup','code',
    'abbr','time','q','cite','br','wbr','s','del','ins','kbd','samp','var','label','bdi','bdo'];
  // Conteneurs jamais éditables comme un seul bloc de texte.
  var BLOCK_SKIP=['nav','ul','ol','table','thead','tbody','tr','form','select','header',
    'footer','section','article','aside','main','figure','picture'];

  function isInline(el){return INLINE.indexOf(el.tagName.toLowerCase())>=0;}
  function hasText(el){return !!(el.textContent && el.textContent.replace(/\\s+/g,'').length>0);}

  // Bloc de texte éditable = a du texte, aucun enfant n'est un bloc / image.
  function isTextBlock(el){
    var tag=el.tagName.toLowerCase();
    if(BLOCK_SKIP.indexOf(tag)>=0) return false;
    if(!hasText(el)) return false;
    for(var i=0;i<el.children.length;i++){
      if(!isInline(el.children[i])) return false; // enfant bloc ou <img> → on descend
    }
    return true;
  }

  // Chemin d'indices depuis <body> (ex. "2.0.1").
  function pathOf(el){
    var path=[];
    while(el && el.parentElement && el.tagName.toLowerCase()!=='body'){
      var parent=el.parentElement;
      path.unshift(Array.prototype.indexOf.call(parent.children, el));
      el=parent;
    }
    return path.join('.');
  }

  function markTextEl(el){
    el.setAttribute('data-wp-text','1');
    el.setAttribute('contenteditable','true');
    el.setAttribute('spellcheck','false');
    el.dataset.wpOriginal=el.innerHTML;
  }

  // Parcours descendant : on marque le PREMIER bloc texte rencontré (le plus
  // englobant, ex. le logo entier <a>Koala<span>Codeur</span></a>) et on ne
  // descend pas dedans → on édite le titre complet d'un coup.
  function walkText(root){
    for(var i=0;i<root.children.length;i++){
      var el=root.children[i];
      if(isTextBlock(el)) markTextEl(el);
      else walkText(el);
    }
  }

  // Éléments avec une image/un dégradé de fond et une taille suffisante
  // (hero, bandeaux, sections) → fond remplaçable.
  function markBackgrounds(){
    var all=document.body.getElementsByTagName('*');
    Array.prototype.forEach.call(all,function(el){
      var tag=el.tagName.toLowerCase();
      if(tag==='img'||tag==='svg'||tag==='script'||tag==='style') return;
      var cs=window.getComputedStyle(el);
      var bg=cs.backgroundImage;
      if(!bg||bg==='none') return;
      if(el.clientWidth<200||el.clientHeight<120) return;
      if(getComputedStyle(el).position==='static') el.style.position='relative';
      el.setAttribute('data-wp-bg','1');
    });
  }

  function showHint(){
    if(document.querySelector('.wp-edit-hint')) return;
    var h=document.createElement('div');
    h.className='wp-edit-hint';
    h.textContent='Texte : cliquez et tapez · Image : cliquez pour remplacer · Fond : survolez et cliquez « Changer le fond »';
    document.body.appendChild(h);
    setTimeout(function(){h&&h.remove();},5000);
  }

  function send(msg){window.parent.postMessage(msg,'*');}

  document.body.classList.add('wp-edit-on');
  walkText(document.body);
  Array.prototype.forEach.call(document.images,function(img){img.setAttribute('data-wp-img','1');});
  markBackgrounds();
  showHint();

  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('a');
    if(a) e.preventDefault(); // jamais de navigation en mode édition
    if(e.target.closest && e.target.closest('[data-wp-text]')) return; // texte = contenteditable
    var img=e.target.closest && e.target.closest('[data-wp-img]');
    if(img){e.preventDefault();e.stopPropagation();send({type:'wp-edit-image-request',path:pathOf(img)});return;}
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
    if(e.key==='Enter' && !e.shiftKey && e.target && e.target.getAttribute
       && e.target.getAttribute('data-wp-text')==='1'){
      e.preventDefault();e.target.blur();
    }
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

/**
 * Applique une modification au HTML source d'une page et renvoie le HTML mis
 * à jour. Renvoie null si le chemin ne correspond à rien.
 */
export const applyVisualEdit = (
  sourceHtml: string,
  edit: { kind: VisualEditKind; path: string; value: string; alt?: string },
): string | null => {
  if (typeof window === "undefined") return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml, "text/html");
  if (!doc.body) return null;

  const target = resolvePath(doc.body, edit.path);
  if (!target) return null;

  if (edit.kind === "text") {
    target.innerHTML = edit.value;
  } else if (edit.kind === "image") {
    target.setAttribute("src", edit.value);
    if (edit.alt !== undefined) target.setAttribute("alt", edit.alt);
    target.setAttribute("loading", "lazy");
  } else {
    // Fond : voile sombre + image pour garder le texte lisible.
    const el = target as HTMLElement;
    el.style.backgroundImage = `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('${edit.value}')`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";
  }

  const doctype = doc.doctype ? "<!DOCTYPE html>\n" : "";
  return doctype + doc.documentElement.outerHTML;
};
