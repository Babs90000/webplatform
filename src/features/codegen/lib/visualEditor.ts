/**
 * Édition visuelle du site dans l'aperçu iframe.
 *
 * Deux moitiés coopèrent :
 *  - Un script injecté DANS l'iframe (chaîne `EDITOR_SCRIPT`) qui rend les
 *    images cliquables et les textes éditables, puis remonte chaque
 *    modification au parent via postMessage avec un sélecteur structurel.
 *  - `applyVisualEdit`, exécuté côté React, qui rejoue ce sélecteur sur le
 *    HTML SOURCE de la page (DOMParser) pour persister le changement.
 *
 * Le sélecteur est calculé uniquement dans l'iframe et renvoyé tel quel : le
 * parent se contente de `querySelector`, ce qui évite toute désynchronisation
 * d'algorithme entre les deux côtés.
 */

export type VisualEditKind = "text" | "image";

export interface VisualEditMessage {
  type: "wp-edit-text" | "wp-edit-image-request";
  selector: string;
  value?: string;
}

/** Styles + script injectés avant </body> quand le mode édition est actif. */
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
  body.wp-edit-on img[data-wp-img]{
    outline:2px dashed rgba(244,162,97,.85);outline-offset:3px;
    cursor:pointer;transition:outline-color .15s ease;
  }
  body.wp-edit-on img[data-wp-img]:hover{outline-color:#f4a261;outline-style:solid;}
  .wp-edit-hint{
    position:fixed;left:50%;bottom:16px;transform:translateX(-50%);
    z-index:2147483647;background:#111827;color:#fff;font:600 13px/1.4 system-ui,sans-serif;
    padding:8px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.35);
    pointer-events:none;
  }
</style>`;

const EDITOR_SCRIPT = `
<script id="wp-editor-script">
(function(){
  var TEXT_TAGS=['h1','h2','h3','h4','h5','h6','p','span','a','li','button','blockquote','figcaption','label','strong','em','small','td','th'];

  function selector(el){
    var parts=[];
    while(el && el.nodeType===1 && el.tagName.toLowerCase()!=='body'){
      var tag=el.tagName.toLowerCase();
      var parent=el.parentElement;
      if(!parent){parts.unshift(tag);break;}
      var same=Array.prototype.filter.call(parent.children,function(c){return c.tagName===el.tagName;});
      parts.unshift(tag+':nth-of-type('+(same.indexOf(el)+1)+')');
      el=parent;
    }
    return 'body > '+parts.join(' > ');
  }

  function isPureText(el){
    if(TEXT_TAGS.indexOf(el.tagName.toLowerCase())<0) return false;
    if(el.children.length>0) return false;
    return !!(el.textContent && el.textContent.trim().length>0);
  }

  function mark(){
    var all=document.body.querySelectorAll(TEXT_TAGS.join(','));
    Array.prototype.forEach.call(all,function(el){
      if(isPureText(el)){
        el.setAttribute('data-wp-text','1');
        el.setAttribute('contenteditable','true');
        el.setAttribute('spellcheck','false');
        el.dataset.wpOriginal=el.textContent;
      }
    });
    Array.prototype.forEach.call(document.images,function(img){
      img.setAttribute('data-wp-img','1');
    });
  }

  function showHint(){
    if(document.querySelector('.wp-edit-hint')) return;
    var h=document.createElement('div');
    h.className='wp-edit-hint';
    h.textContent='Cliquez un texte pour le modifier · cliquez une image pour la remplacer';
    document.body.appendChild(h);
    setTimeout(function(){h&&h.remove();},4000);
  }

  function send(msg){window.parent.postMessage(msg,'*');}

  document.body.classList.add('wp-edit-on');
  mark();
  showHint();

  document.addEventListener('click',function(e){
    var img=e.target.closest && e.target.closest('img[data-wp-img]');
    if(img){
      e.preventDefault();e.stopPropagation();
      send({type:'wp-edit-image-request',selector:selector(img)});
      return;
    }
    var a=e.target.closest && e.target.closest('a[data-wp-text]');
    if(a){e.preventDefault();} // éviter la navigation pendant l'édition
  },true);

  document.addEventListener('focusout',function(e){
    var el=e.target;
    if(!el || !el.getAttribute || el.getAttribute('data-wp-text')!=='1') return;
    var value=el.textContent;
    if(value===el.dataset.wpOriginal) return;
    el.dataset.wpOriginal=value;
    send({type:'wp-edit-text',selector:selector(el),value:value});
  },true);

  document.addEventListener('keydown',function(e){
    if(e.key==='Enter' && e.target && e.target.getAttribute && e.target.getAttribute('data-wp-text')==='1'){
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

/**
 * Applique une modification au HTML source d'une page et renvoie le HTML mis
 * à jour. Renvoie null si le sélecteur ne correspond à rien (on évite alors
 * d'écraser le fichier).
 */
export const applyVisualEdit = (
  sourceHtml: string,
  edit: { kind: VisualEditKind; selector: string; value: string; alt?: string },
): string | null => {
  if (typeof window === "undefined") return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml, "text/html");

  let target: Element | null = null;
  try {
    target = doc.querySelector(edit.selector);
  } catch {
    return null;
  }
  if (!target) return null;

  if (edit.kind === "text") {
    target.textContent = edit.value;
  } else {
    target.setAttribute("src", edit.value);
    if (edit.alt !== undefined) target.setAttribute("alt", edit.alt);
    target.setAttribute("loading", "lazy");
  }

  const doctype = doc.doctype ? "<!DOCTYPE html>\n" : "";
  return doctype + doc.documentElement.outerHTML;
};
