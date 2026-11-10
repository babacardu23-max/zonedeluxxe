/* ---------- Données de départ (catalogue relevé sur Instagram) ---------- */
const IG=["DeMns8wNsn9", "DXPRbO7DTXX", "DXAepXmjVsi", "DW7JDF-Dcq9", "DdZtC2HNzsP", "Da8H3d_tDQ3", "DdzmYIqNXd2", "DXNLx75DfAK", "DdYrgskNKSC", "Dd08iGcN4cv", "DYQbDXlMtgB", "DWaCxD0jHHz", "DXxCAGtNgin", "DeaM-5Gt8ny", "DYIl38NNCSB", "DfVn85TtA5V", "DekJUKlNG81", "DeaKKImt8m0", "De2BD97OpOc", "DWmpkUOjYUf", "DYmiocjtgsW", "DXXSqSDjakA", "DXnJ2zQDNG7"];
const DEPART = [
  ["Robe Mary","Robes",8000,"Plusieurs couleurs"],["Robe Abby","Robes",8000,"Plusieurs coloris"],["Ina Dress","Robes",9000,""],["Lena Dress","Robes",7000,"De nouveau disponible"],["Mina Dress","Robes",6000,""],["Robe Sandra","Robes",5000,""],["Robe Amira","Robes",4500,"",{promo:true}],
  ["Lisa set","Ensembles",10000,""],["Ensemble Larsa","Ensembles",8000,"Free size"],
  ["Ensemble kimono","Kimonos",7500,""],["Kimono Amina","Kimonos",7000,""],["Kimono et robe intérieur","Kimonos",8000,"Taille standard"],
  ["Jupe Sofia","Jupes",5000,""],["Jupe Yasmine","Jupes",4000,""],["Jupe Bigué","Jupes",4000,"",{stock:"limite"}],
  ["Captop","Tops",4500,""],["Cape top","Tops",4000,"Beige, noir ou orange"],["Top Basic","Tops",4000,"Bleu, noir, blanc ou marron · taille standard"],["Haut Frip","Tops",2000,"Lot de 3 à 5 500 F"],["Chemise Frip","Tops",2000,""],
  ["Strips pants","Pantalons",3000,"S, M, L, XL",{promo:true}],["Pantalon jogging","Pantalons",5000,""],["Shoeshine","Chaussures",5000,"Pointures 37 à 41"]
].map((r,i)=>({id:"p"+String(i+1).padStart(2,"0"),nom:r[0],cat:r[1],prix:r[2],info:r[3],prixAvant:null,promo:!!(r[4]&&r[4].promo),stock:(r[4]&&r[4].stock)||"dispo",nouveau:false,visible:true,ordre:i,photo:"img/p"+String(i+1).padStart(2,"0")+".jpg",ig:"https://www.instagram.com/p/"+IG[i]+"/",photoId:null,videoId:null}));
const UNIVERS=[
  {n:"Parfums arabes",d:"Les flacons orientaux les plus demandés et le retour des best-sellers."},
  {n:"Coffrets",d:"Des coffrets parfum prêts à offrir."},
  {n:"Abayas",d:"Des modèles fluides pour tous les jours et les grandes occasions."},
  {n:"Lunettes",d:"Des lunettes de soleil pour finir la tenue."}
];


const VEDETTES_DEPART=["p01","p02","p03","p08","p12","p06","p14","p16","p10","p15"];
DEPART.forEach(p=>p.vedette=VEDETTES_DEPART.includes(p.id));
const SUPABASE_URL="https://vxdebsfslnrkwfwaevyo.supabase.co";
const SUPABASE_CLE="sb_publishable_VRyk9azpvpBaoNPxEHQhhA_mUiLjT9H";
const EMAIL_GERANT="gerant@zonedeluxxe.app";

/* ---------- Outils ---------- */
const $=id=>document.getElementById(id);
let WA="221774856093";
const formatTel=n=>{const d=String(n).replace(/\D/g,"").replace(/^221/,""); return d.length===9?d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/,"$1 $2 $3 $4"):d;};
const waLink=t=>"https://wa.me/"+WA+"?text="+encodeURIComponent(t);
const fcfa=n=>Number(n||0).toLocaleString("fr-FR").replace(/[  ]/g," ")+" F";
const blob=id=>id?"/_blob/"+encodeURIComponent(id):null;
const photoSrc=p=>p.photoUrl||p.photo||null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lienIg=p=>/^https:\/\/(www\.)?instagram\.com\//.test(p.ig||"")?p.ig:null;
const REDUIT=matchMedia("(prefers-reduced-motion: reduce)").matches;
const FIN=matchMedia("(hover:hover) and (pointer:fine)").matches;


let produits=DEPART.slice(), reglages={}, depuisBase=false;
let sb=null, peutEnregistrer=false;
let actif="Tout";
const visibles=()=>produits.filter(p=>p.visible!==false).sort((a,b)=>(a.ordre??0)-(b.ordre??0));
const enPromo=p=>p.promo||(p.prixAvant&&p.prixAvant>p.prix);
const vedettes=()=>{const v=visibles().filter(p=>p.vedette&&photoSrc(p)&&p.stock!=="rupture"); return v.length>=4?v:visibles().filter(p=>photoSrc(p)).slice(0,10);};

function appliquerCouleur(c){ if(/^#[0-9a-f]{6}$/i.test(c||"")) document.documentElement.style.setProperty("--rouge",c); }
function peindreLogo(){ const src=/^https:\/\/[a-z0-9]+\.supabase\.co\//.test(reglages.logoUrl||"")?reglages.logoUrl:"img/logo.jpg"; document.querySelectorAll("[data-logo]").forEach(el=>el.innerHTML=`<img src="${src}" alt="Zonedeluxxe">`); }
function majLiensWa(){ document.querySelectorAll("[data-wa]").forEach(a=>a.href=waLink(a.dataset.wa)); document.querySelectorAll("[data-tel]").forEach(e=>e.textContent=formatTel(WA)); }
majLiensWa();

/* ---------- Textes modifiables ---------- */
const TXT_DEFAUT={}, TXT_LABEL={};
document.querySelectorAll("[data-txt]").forEach(el=>{ TXT_DEFAUT[el.dataset.txt]=el.textContent.trim(); TXT_LABEL[el.dataset.txt]=el.dataset.txtLabel||el.dataset.txt; });
UNIVERS.forEach((u,i)=>{ TXT_DEFAUT["u"+(i+1)+"_n"]=u.n; TXT_LABEL["u"+(i+1)+"_n"]=`Parfums et accessoires : rubrique ${i+1}, nom`; TXT_DEFAUT["u"+(i+1)+"_d"]=u.d; TXT_LABEL["u"+(i+1)+"_d"]=`Parfums et accessoires : rubrique ${i+1}, texte`; });
TXT_DEFAUT.fiche_note="Livraison immédiate. Indique ta taille et ta couleur dans le message."; TXT_LABEL.fiche_note="Fiche produit : phrase sous le prix";
const T=k=>{ const t=reglages.textes||{}; if(typeof t[k]==="string"&&t[k].trim()) return t[k].trim(); if(k==="accroche"&&reglages.accroche) return reglages.accroche; return TXT_DEFAUT[k]??""; };
function appliquerTextes(){
  document.querySelectorAll("[data-txt]").forEach(el=>{
    const v=T(el.dataset.txt);
    if(el.hasAttribute("data-split")){ if(el.getAttribute("aria-label")===v) return; el.textContent=v; delete el.dataset.fait; decouper(el); }
    else if(el.textContent!==v) el.textContent=v;
  });
}

/* ---------- Intro ---------- */
(function(){
  const fin=()=>{ $("intro").classList.add("fini"); document.body.classList.add("pret"); setTimeout(()=>$("intro").style.display="none",1500); };
  if(REDUIT){ fin(); return; }
  let n=0; const c=$("compte"); const t=setInterval(()=>{ n=Math.min(100,n+Math.ceil(Math.random()*14)); c.textContent=n; if(n>=100){clearInterval(t); setTimeout(fin,180);} },70);
})();

/* ---------- Curseur ---------- */
const curseur=$("curseur");
if(FIN&&!REDUIT){
  let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
  addEventListener("pointermove",e=>{x=e.clientX;y=e.clientY;},{passive:true});
  (function boucle(){ cx+=(x-cx)*.2; cy+=(y-cy)*.2; curseur.style.transform=`translate(${cx}px,${cy}px)`; requestAnimationFrame(boucle); })();
  document.addEventListener("pointerover",e=>{ curseur.classList.toggle("grand",!!e.target.closest(".produit .visuel,.anneau .c,.diap")); });
}else curseur.remove();

/* ---------- En-tête qui se cache ---------- */
let dernierY=0, vitesse=0;
addEventListener("scroll",()=>{
  const y=scrollY, h=$("haut");
  h.classList.toggle("fond",y>30);
  h.classList.toggle("cache",y>dernierY&&y>400);
  document.body.classList.toggle("defile-ok",y>innerHeight*.7);
  vitesse=y-dernierY; dernierY=y;
},{passive:true});
(function skew(){ vitesse*=.9; const s=Math.max(-8,Math.min(8,vitesse*.25)); $("bande-skew").style.transform=`skewX(${-s}deg)`; requestAnimationFrame(skew); })();

/* ---------- Titres découpés lettre par lettre ---------- */
function decouper(el){
  if(el.dataset.fait) return; el.dataset.fait=1;
  let i=0; const mots=el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label",el.textContent.trim());
  el.innerHTML=mots.map(m=>`<span class="mot" aria-hidden="true">${[...m].map(ch=>`<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join("")}</span>`).join(" ");
}
document.querySelectorAll("[data-split]").forEach(decouper);
const observer=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("vu");observer.unobserve(en.target);}}),{threshold:.15});
document.querySelectorAll(".apparait,[data-split]").forEach(el=>observer.observe(el));

/* ---------- Anneau 3D du hero ---------- */
const anneau={angle:0,v:0,n:0,R:0,items:[],cartes:[],tire:false,dernier:-1};
function rendreAnneau(){
  const el=$("anneau"); anneau.items=vedettes(); const n=anneau.n=anneau.items.length;
  const w=innerWidth<900?Math.min(170,innerWidth*.42):Math.min(240,innerWidth*.16);
  el.style.setProperty("--cw",w+"px");
  anneau.R=Math.max(w*1.1,(w/2)/Math.tan(Math.PI/Math.max(n,3))*1.18);
  el.innerHTML=anneau.items.map((p,i)=>`<div class="c" data-id="${esc(p.id)}" style="transform:rotateY(${i*360/n}deg) translateZ(${anneau.R}px)"><img src="${esc(photoSrc(p))}" alt="${esc(p.nom)}" draggable="false"></div>`).join("");
  anneau.cartes=[...el.children]; anneau.dernier=-1;
}
function majEtiquette(i){
  const p=anneau.items[i]; if(!p) return; const t=$("etiq-txt");
  t.classList.add("change");
  setTimeout(()=>{ t.innerHTML=`<span class="nm">${esc(p.nom)}</span> · <span class="px">${fcfa(p.prix)}</span>`; t.classList.remove("change"); },180);
}
(function tourne(){
  const a=anneau;
  if(a.n){
    if(!a.tire){ a.v+=((REDUIT?0:-.12)-a.v)*.03; }
    a.angle+=a.v;
    $("anneau").style.transform=`translateZ(${-a.R}px) rotateX(-6deg) rotateY(${a.angle}deg)`;
    const pas=360/a.n;
    a.cartes.forEach((c,i)=>{ let rel=((i*pas+a.angle)%360+540)%360-180; const f=Math.cos(rel*Math.PI/180); c.style.filter=`brightness(${.55+.45*Math.max(f,0)})`; c.style.setProperty("--o",f>.9?0:.6); });
    const avant=((Math.round(-a.angle/pas)%a.n)+a.n)%a.n;
    if(avant!==a.dernier){ a.dernier=avant; majEtiquette(avant); }
  }
  requestAnimationFrame(tourne);
})();
(function(){
  const s=$("scene3d"); let px=0, bouge=0;
  s.addEventListener("pointerdown",e=>{ anneau.tire=true; px=e.clientX; bouge=0; s.setPointerCapture(e.pointerId); });
  s.addEventListener("pointermove",e=>{ if(!anneau.tire) return; const dx=e.clientX-px; px=e.clientX; bouge+=Math.abs(dx); anneau.v=dx*.28; });
  const lacher=e=>{ if(!anneau.tire) return; anneau.tire=false;
    if(bouge<6){ const c=document.elementFromPoint(e.clientX,e.clientY)?.closest(".c"); if(c) ouvrirFiche(c.dataset.id); } };
  s.addEventListener("pointerup",lacher); s.addEventListener("pointercancel",()=>anneau.tire=false);
  $("etiq-voir").addEventListener("click",e=>{ e.stopPropagation(); const p=anneau.items[anneau.dernier]; if(p) ouvrirFiche(p.id); });
  $("etiq-voir").addEventListener("pointerdown",e=>e.stopPropagation());
  addEventListener("resize",()=>{ clearTimeout(rendreAnneau.t); rendreAnneau.t=setTimeout(rendreAnneau,200); });
})();

/* ---------- Bande ---------- */
function rendreBande(){
  const items=visibles().slice(0,10).map(p=>`${esc(p.nom)} ${fcfa(p.prix)}`);
  $("bande").innerHTML=[...items,...items].map(t=>`<span>${t}</span>`).join("");
  $("nb-pieces").textContent=visibles().length;
}

/* ---------- Le défilé : piste horizontale en 3D ---------- */
let stDefile=null;
const GSAP_OK=()=>window.gsap&&window.ScrollTrigger&&!REDUIT&&innerWidth>800;
function rendreDefile(){
  const v=vedettes().slice(0,8), piste=$("piste");
  piste.innerHTML=v.map((p,i)=>`<article class="diap" data-id="${esc(p.id)}" tabindex="0" aria-label="${esc(p.nom)}, ${fcfa(p.prix)}"><div class="cadre"><img src="${esc(photoSrc(p))}" alt="" loading="lazy"><span class="num">${String(i+1).padStart(2,"0")}</span></div><div class="leg"><b>${esc(p.nom)}</b><span>${fcfa(p.prix)}</span></div></article>`).join("");
  $("cpt-tot").textContent=String(v.length).padStart(2,"0");
  if(stDefile){ stDefile.kill(); stDefile=null; gsap.set(piste,{x:0}); }
  const sec=$("defile");
  if(GSAP_OK()){
    sec.classList.remove("natif");
    gsap.registerPlugin(ScrollTrigger);
    const dist=()=>piste.scrollWidth-innerWidth;
    const tw=gsap.to(piste,{x:()=>-dist(),ease:"none"});
    stDefile=ScrollTrigger.create({trigger:sec,start:"top top",end:()=>"+="+dist(),pin:true,scrub:.8,animation:tw,invalidateOnRefresh:true,
      onUpdate:s=>{ $("progres").style.transform=`scaleX(${s.progress})`; }});
    ScrollTrigger.refresh();
  }else sec.classList.add("natif");
}
function coverflow(){
  const cx=innerWidth/2; let proche=0, dmin=1e9;
  document.querySelectorAll("#piste .diap").forEach((d,i)=>{
    const r=d.getBoundingClientRect(); if(r.right<-200||r.left>innerWidth+200) return;
    const off=(r.left+r.width/2-cx)/innerWidth;
    const cadre=d.firstElementChild, img=cadre.firstElementChild;
    if(!REDUIT){
      cadre.style.transform=`rotateY(${Math.max(-38,Math.min(38,-off*55))}deg) scale(${1-Math.min(Math.abs(off)*.25,.2)})`;
      img.style.transform=`translateX(${off*-6}%)`;
    }
    if(Math.abs(off)<dmin){dmin=Math.abs(off);proche=i;}
  });
  $("cpt-num").textContent=String(proche+1).padStart(2,"0");
  requestAnimationFrame(coverflow);
}
requestAnimationFrame(coverflow);
$("piste").addEventListener("click",e=>{const d=e.target.closest(".diap"); if(d) ouvrirFiche(d.dataset.id);});
$("piste").addEventListener("keydown",e=>{const d=e.target.closest(".diap"); if(d&&(e.key==="Enter"||e.key===" ")){e.preventDefault();ouvrirFiche(d.dataset.id);}});

/* ---------- Catalogue ---------- */
function rendreFiltres(){
  const cats=["Tout",...new Set(visibles().map(p=>p.cat))];
  if(!cats.includes(actif)) actif="Tout";
  $("filtres").innerHTML=cats.map(c=>`<button type="button" data-c="${esc(c)}" aria-pressed="${c===actif}">${esc(c)}</button>`).join("");
}
$("filtres").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; actif=b.dataset.c; rendreFiltres(); rendreGrille(true); });
function mediaHTML(p,grand){
  const ps=photoSrc(p);
  const img=ps?`<img src="${esc(ps)}" alt="${esc(p.nom)}" loading="lazy">`:"";
  const vid=p.videoId?`<video src="${blob(p.videoId)}" muted loop playsinline preload="${grand?"auto":"none"}" ${grand?"autoplay":""}></video>`:"";
  const ph=(!ps&&!(grand&&p.videoId))?`<div class="ph" aria-hidden="true">${esc(p.nom)}</div>`:"";
  return ph+img+vid;
}
function badgeHTML(p){
  if(p.stock==="limite") return `<span class="badge limite">Stock limité</span>`;
  if(enPromo(p)) return `<span class="badge">Promo</span>`;
  if(p.nouveau) return `<span class="badge nouveau">Nouveau</span>`;
  return "";
}
function rendreGrille(filtre){
  const liste=visibles().filter(p=>actif==="Tout"||p.cat===actif);
  const g=$("grille");
  if(!liste.length){g.innerHTML='<p class="vide">Aucune pièce dans cette catégorie pour le moment. Écris-nous sur WhatsApp pour connaître les arrivages.</p>';return;}
  g.innerHTML=liste.map(p=>`
    <article class="produit entre${p.stock==="rupture"?" rupture":""}" data-id="${esc(p.id)}" tabindex="0" aria-label="${esc(p.nom)}, ${fcfa(p.prix)}">
      <div class="visuel">${mediaHTML(p,false)}${badgeHTML(p)}<span class="reflet"></span></div>
      <div class="meta">
        <h3>${esc(p.nom)}</h3>
        <div class="ligne-prix"><span class="prix">${fcfa(p.prix)}</span>${p.prixAvant&&p.prixAvant>p.prix?`<span class="avant">${fcfa(p.prixAvant)}</span>`:""}</div>
        ${p.info?`<p class="info">${esc(p.info)}</p>`:""}
        ${lienIg(p)?`<a class="lien-ig" data-pid="${esc(p.id)}" href="${esc(lienIg(p))}" target="_blank" rel="noopener" data-ig><svg aria-hidden="true"><use href="#ico-ig"/></svg>Voir la vidéo<span class="sr"> de ${esc(p.nom)} sur Instagram</span></a>`:""}
      </div>
    </article>`).join("");
  g.querySelectorAll(".produit").forEach((el,i)=>{
    el.style.transitionDelay="0s";
    el.querySelector(".visuel").style.transitionDelay=(i%4)*90+"ms";
    if(filtre) requestAnimationFrame(()=>el.classList.add("vu")); else observer.observe(el);
    const v=el.querySelector("video");
    if(v){ el.addEventListener("mouseenter",()=>v.play().then(()=>el.classList.add("joue")).catch(()=>{})); el.addEventListener("mouseleave",()=>{v.pause();el.classList.remove("joue");}); }
  });
}
// Inclinaison 3D des cartes
if(FIN&&!REDUIT){
  $("grille").addEventListener("pointermove",e=>{
    const v=e.target.closest(".visuel"); if(!v) return;
    const r=v.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    v.style.transform=`rotateY(${x*14}deg) rotateX(${-y*14}deg) translateZ(10px)`;
    v.style.setProperty("--rx",(x+.5)*100+"%"); v.style.setProperty("--ry",(y+.5)*100+"%");
    const im=v.querySelector("img"); if(im) im.style.transform=`translate(${-x*14}px,${-y*14}px) scale(1.04)`;
  });
  $("grille").addEventListener("pointerout",e=>{
    const v=e.target.closest(".visuel"); if(!v||v.contains(e.relatedTarget)) return;
    v.style.transform=""; const im=v.querySelector("img"); if(im) im.style.transform="";
  });
}
$("grille").addEventListener("click",e=>{ if(e.target.closest("[data-ig]")) return; const a=e.target.closest(".produit"); if(a) ouvrirFiche(a.dataset.id); });
$("grille").addEventListener("keydown",e=>{ if(e.target.closest("[data-ig]")) return; const a=e.target.closest(".produit"); if(a&&(e.key==="Enter"||e.key===" ")){e.preventDefault();ouvrirFiche(a.dataset.id);} });

/* ---------- Fiche produit ---------- */
function ouvrirFiche(id){
  const p=produits.find(x=>x.id===id); if(!p) return;
  const d=$("fiche"), epuise=p.stock==="rupture";
  d.innerHTML=`<button class="fermer" type="button" aria-label="Fermer">×</button><div class="fiche">
    <div class="media">${mediaHTML(p,true)}${badgeHTML(p)}</div>
    <div class="corps"><span class="cat">${esc(p.cat)}</span><h3>${esc(p.nom)}</h3>
      <div class="ligne-prix"><span class="prix">${fcfa(p.prix)}</span>${p.prixAvant&&p.prixAvant>p.prix?`<span class="avant">${fcfa(p.prixAvant)}</span>`:""}</div>
      ${p.info?`<p>${esc(p.info)}</p>`:""}
      <p>${esc(T("fiche_note"))}</p>
      <a class="btn-wa" data-pid="${esc(p.id)}" href="${waLink(epuise?`Bonjour Zonedeluxxe, la pièce ${p.nom} va-t-elle revenir ?`:`Bonjour Zonedeluxxe, je voudrais commander : ${p.nom} (${fcfa(p.prix)}). Ma taille et ma couleur : `)}"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ico-wa"/></svg>${epuise?"Demander le retour":"Commander sur WhatsApp"}</a>
      ${lienIg(p)?`<a class="btn-ig" data-pid="${esc(p.id)}" href="${esc(lienIg(p))}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#ico-ig"/></svg>Voir la vidéo sur Instagram</a>`:""}
    </div></div>`;
  d.querySelector(".fermer").onclick=()=>d.close();
  d.showModal();
  suivre("vue",p.id);
}
$("fiche").addEventListener("click",e=>{ if(e.target.id==="fiche") e.target.close(); });
$("fiche").addEventListener("close",e=>e.target.innerHTML="");

/* ---------- Univers ---------- */
function rendreUnivers(){ $("univers-liste").innerHTML=UNIVERS.map((u,i)=>{ const n=T("u"+(i+1)+"_n"), d=T("u"+(i+1)+"_d"); return n?`<a href="${waLink(`Bonjour Zonedeluxxe, je voudrais voir vos ${n.toLowerCase()} disponibles et leurs prix.`)}"><b>${esc(n)}</b><span>${esc(d)}</span><em>Demander la sélection</em></a>`:""; }).join(""); }

function toutRendre(){
  appliquerCouleur(reglages.couleur); peindreLogo();
  if(/^\d{8,15}$/.test(reglages.whatsapp||"")) WA=reglages.whatsapp;
  appliquerTextes(); majLiensWa(); rendreUnivers();
  rendreAnneau(); rendreBande(); rendreDefile(); rendreFiltres(); rendreGrille(false); rendreLookbook();
  if(document.body.classList.contains("mode-gerant")) rendreGerant();
}
toutRendre();

/* =================== ACCÈS GÉRANT (cœur + mot de passe, vérifié par Supabase) =================== */
const toast=t=>{const el=$("toast");el.textContent=t;el.classList.add("vu");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("vu"),3400);};
let essais=0, bloqueJusqua=0;
async function estAdmin(){
  if(!sb) return false;
  const { data:{ session } } = await sb.auth.getSession();
  if(!session) return false;
  const { data, error } = await sb.from("admins").select("user_id").eq("user_id",session.user.id).maybeSingle();
  return !error && !!data;
}
async function ouvrirGerant(){
  peutEnregistrer=await estAdmin();
  if(!peutEnregistrer){ fermerGerant(); ouvrirMdp(); return; }
  document.body.classList.add("mode-gerant");
  if(location.hash!=="#gerant") history.replaceState(null,"","#gerant");
  rendreGerant(); montrerVue(vueActive);
}
function fermerGerant(){ document.body.classList.remove("mode-gerant"); if(location.hash==="#gerant") history.replaceState(null,"",location.pathname+location.search); }
function ouvrirMdp(){ $("mdp-err").textContent=""; $("mdp-champ").value=""; $("mdp").showModal(); setTimeout(()=>$("mdp-champ").focus(),50); }
$("coeur").addEventListener("click",async()=>{ if(await estAdmin()) ouvrirGerant(); else ouvrirMdp(); });
$("mdp-annuler").onclick=()=>$("mdp").close();
$("mdp-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const err=$("mdp-err");
  if(Date.now()<bloqueJusqua){ err.textContent="Trop d'essais. Réessaie dans une minute."; return; }
  if(!sb){ err.textContent="Connexion impossible pour le moment. Vérifie ta connexion internet."; return; }
  const btn=e.submitter||$("mdp-form").querySelector("[type=submit]"); btn.disabled=true;
  const { error } = await sb.auth.signInWithPassword({ email:EMAIL_GERANT, password:$("mdp-champ").value });
  btn.disabled=false;
  if(error && !/invalid/i.test(error.message||"")){ err.textContent="Connexion impossible pour le moment. Vérifie ta connexion internet et réessaie."; return; }
  if(!error && await estAdmin()){ essais=0; $("mdp").close(); await ouvrirGerant(); toast("Bienvenue dans l'espace gérant."); return; }
  if(!error) await sb.auth.signOut();
  essais++; if(essais>=5){ bloqueJusqua=Date.now()+60000; essais=0; }
  err.textContent="Mot de passe incorrect.";
  const d=$("mdp"); d.classList.remove("secoue"); void d.offsetWidth; d.classList.add("secoue"); $("mdp-champ").select();
});
$("g-quitter").addEventListener("click",e=>{ e.preventDefault(); fermerGerant(); });
$("g-deco").addEventListener("click",async()=>{ if(sb) await sb.auth.signOut(); peutEnregistrer=false; fermerGerant(); toast("Tu es déconnecté."); });
function routeur(){ if(location.hash==="#gerant") ouvrirGerant(); else document.body.classList.remove("mode-gerant"); }
addEventListener("hashchange",routeur);

/* =================== ESPACE GÉRANT =================== */
function confirmer(texte){return new Promise(res=>{$("confirm-txt").textContent=texte;$("confirm").classList.add("vu");$("confirm-oui").focus();
  const fin=v=>{$("confirm").classList.remove("vu");$("confirm-oui").onclick=$("confirm-non").onclick=null;res(v);};
  $("confirm-oui").onclick=()=>fin(true);$("confirm-non").onclick=()=>fin(false);});}
let vueActive="bord";
function montrerVue(v){
  vueActive=v;
  document.querySelectorAll(".g-side [data-vue]").forEach(x=>x.setAttribute("aria-current",x.dataset.vue===v));
  document.querySelectorAll("[data-vue-panneau]").forEach(p=>p.hidden=p.dataset.vuePanneau!==v);
  if(v==="bord") chargerBord(); if(v==="commandes") chargerCommandes(); if(v==="textes") rendreTextes();
  $("gerant").scrollTop=0;
}
document.querySelectorAll(".g-side [data-vue]").forEach(b=>b.addEventListener("click",()=>montrerVue(b.dataset.vue)));
async function verifierSession(){
  peutEnregistrer=await estAdmin(); $("g-alerte").hidden=peutEnregistrer;
  if(!peutEnregistrer) toast("Ta session a expiré. Reconnecte-toi avec le cœur.");
  return peutEnregistrer;
}
const echec=(e)=>toast(e&&/JWT|auth|permission|policy/i.test(e.message||"")?"Ta session a expiré. Reconnecte-toi.":"L'enregistrement a échoué. Vérifie ta connexion et réessaie.");
async function sauverProduit(p){
  const { error } = await sb.from("produits").upsert({ id:p.id, data:p, ordre:p.ordre??0 });
  if(error) throw error;
}

function rendreGerant(){
  $("g-alerte").hidden=peutEnregistrer;
  const tous=produits.slice().sort((a,b)=>(a.ordre??0)-(b.ordre??0));
  $("k-ligne").textContent=tous.filter(p=>p.visible!==false&&p.stock!=="rupture").length;
  $("k-promo").textContent=tous.filter(enPromo).length;
  $("k-stock").textContent=tous.filter(p=>p.stock!=="dispo").length;
  $("k-media").textContent=tous.filter(p=>!photoSrc(p)).length;
  const cats=[...new Set(tous.map(p=>p.cat))], sel=$("g-cat"), cur=sel.value;
  sel.innerHTML=`<option value="">Toutes les catégories</option>`+cats.map(c=>`<option ${c===cur?"selected":""}>${esc(c)}</option>`).join("");
  $("liste-cats").innerHTML=cats.map(c=>`<option value="${esc(c)}">`).join("");
  $("f-couleur").value=reglages.couleur||"#B5566D";
  $("f-wa").value=WA;
  const q=$("g-cherche").value.trim().toLowerCase(), c=sel.value;
  const liste=tous.filter(p=>(!c||p.cat===c)&&(!q||p.nom.toLowerCase().includes(q)));
  let html="";
  if(!liste.length){
    html=`<div class="g-vide"><p>${tous.length?"Aucun produit ne correspond à ta recherche.":"Aucun produit pour le moment. Ajoute le premier avec le bouton en haut."}</p></div>`;
  }else{
    html=`<table><thead><tr><th><span class="sr">Visuel</span></th><th>Produit</th><th class="col-cat">Catégorie</th><th>Prix (F)</th><th>État</th><th><span class="sr">Actions</span></th></tr></thead><tbody>`+
      liste.map(p=>{
        const etat=p.visible===false?'<span class="etat cache">Masqué</span>':p.stock==="rupture"?'<span class="etat rupture">Épuisé</span>':p.stock==="limite"?'<span class="etat limite">Stock limité</span>':'<span class="etat">En ligne</span>';
        const ps=photoSrc(p);
        return `<tr><td><div class="mini">${ps?`<img src="${esc(ps)}" alt="">`:""}</div></td><td class="nm">${esc(p.nom)}<small>${esc(p.info||"")}</small></td><td class="col-cat">${esc(p.cat)}</td>
        <td><label class="sr" for="px-${esc(p.id)}">Prix de ${esc(p.nom)}</label><input class="prix-rapide" id="px-${esc(p.id)}" type="number" min="0" step="500" value="${Number(p.prix)||0}" data-prix="${esc(p.id)}">${enPromo(p)?' <span class="etat limite">Promo</span>':""}</td><td>${etat}</td>
        <td><div class="actions-ligne"><button class="b" type="button" data-edit="${esc(p.id)}">Modifier</button><button class="b" type="button" data-vis="${esc(p.id)}">${p.visible===false?"Afficher":"Masquer"}</button><button class="b danger" type="button" data-del="${esc(p.id)}">Supprimer</button></div></td></tr>`;
      }).join("")+`</tbody></table>`;
  }
  $("g-table").innerHTML=html;
}
$("g-cherche").addEventListener("input",rendreGerant);
$("g-cat").addEventListener("change",rendreGerant);

$("g-table").addEventListener("change",async e=>{
  const inp=e.target.closest("[data-prix]"); if(!inp) return;
  const p=produits.find(x=>x.id===inp.dataset.prix), v=Number(inp.value);
  if(!v||v<0||v===p.prix) return;
  if(!await verifierSession()) return;
  try{ await sauverProduit({...p,prix:v,promo:!!(p.prixAvant&&p.prixAvant>v)}); toast(`Prix de ${p.nom} : ${fcfa(v)}.`); await chargerDonnees(); }catch(err){ echec(err); }
});
$("g-table").addEventListener("click",async e=>{
  const ed=e.target.closest("[data-edit]"), vi=e.target.closest("[data-vis]"), de=e.target.closest("[data-del]");
  if(ed) ouvrirTiroir(ed.dataset.edit);
  if(vi){ if(!await verifierSession()) return; const p=produits.find(x=>x.id===vi.dataset.vis);
    try{ await sauverProduit({...p,visible:p.visible===false}); toast(p.visible===false?"Produit affiché.":"Produit masqué."); await chargerDonnees(); }catch(err){ echec(err); } }
  if(de){ const p=produits.find(x=>x.id===de.dataset.del);
    if(await confirmer(`Supprimer « ${p.nom} » de la boutique ? Cette action est définitive.`)){
      if(!await verifierSession()) return;
      const { error } = await sb.from("produits").delete().eq("id",p.id);
      if(error) echec(error); else { toast("Produit supprimé."); await chargerDonnees(); } } }
});

let edition=null, brouillon={};
function apercu(el,src){ el.innerHTML=src?`<img src="${esc(src)}" alt="">`:""; }
function ouvrirTiroir(id){
  edition=id||null;
  const p=id?produits.find(x=>x.id===id):{nom:"",cat:"",prix:"",prixAvant:"",info:"",ig:"",stock:"dispo",nouveau:false,vedette:false,visible:true,photoUrl:null,photo:null};
  brouillon={photoUrl:p.photoUrl||null,photo:p.photo||null};
  $("t-titre").textContent=id?"Modifier le produit":"Ajouter un produit";
  $("p-nom").value=p.nom; $("p-cat").value=p.cat; $("p-prix").value=p.prix; $("p-avant").value=p.prixAvant||""; $("p-info").value=p.info||""; $("p-ig").value=p.ig||"";
  $("p-stock").value=p.stock||"dispo"; $("p-nouveau").checked=!!p.nouveau; $("p-vedette").checked=!!p.vedette; $("p-visible").checked=p.visible!==false;
  apercu($("ap-photo"),photoSrc(brouillon));
  $("tiroir").classList.add("ouvert"); setTimeout(()=>$("p-nom").focus(),300);
}
const fermerTiroir=()=>$("tiroir").classList.remove("ouvert");
document.querySelectorAll("[data-fermer-tiroir]").forEach(b=>b.onclick=fermerTiroir);
addEventListener("keydown",e=>{ if(e.key==="Escape"&&$("tiroir").classList.contains("ouvert")) fermerTiroir(); });
$("nouveau").onclick=()=>ouvrirTiroir();

const TYPES_OK=["image/jpeg","image/png","image/webp","image/gif"];
async function envoyerImage(fichier,depot){
  if(!TYPES_OK.includes(fichier.type)){ toast("Choisis une image JPG, PNG, WEBP ou GIF."); return null; }
  if(fichier.size>20*1024*1024){ toast("Cette image dépasse 20 Mo. Compresse-la avant de l'importer."); return null; }
  if(!await verifierSession()) return null;
  depot.classList.add("charge");
  try{
    const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"})[fichier.type];
    const chemin=`produits/${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const { error } = await sb.storage.from("medias").upload(chemin,fichier,{contentType:fichier.type,cacheControl:"31536000",upsert:false});
    if(error) throw error;
    return sb.storage.from("medias").getPublicUrl(chemin).data.publicUrl;
  }catch(err){ toast("L'import a échoué. Réessaie avec une autre image."); return null; }
  finally{ depot.classList.remove("charge"); }
}
$("p-photo").onchange=async e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return; const url=await envoyerImage(f,$("depot-photo")); if(url){ brouillon.photoUrl=url; apercu($("ap-photo"),url); } };
$("form-produit").addEventListener("submit",async e=>{
  e.preventDefault();
  const nom=$("p-nom").value.trim(), cat=$("p-cat").value.trim(), prix=Number($("p-prix").value), avant=Number($("p-avant").value)||null, ig=$("p-ig").value.trim();
  if(!nom||!cat||!prix){ toast("Indique au moins le nom, la catégorie et le prix."); return; }
  if(ig&&!/^https:\/\/(www\.)?instagram\.com\//.test(ig)){ toast("Le lien doit commencer par https://www.instagram.com/"); return; }
  if(!await verifierSession()) return;
  const id=edition||("p"+Date.now().toString(36)), ancien=produits.find(x=>x.id===id)||{};
  const data={...ancien,id,nom:nom.slice(0,80),cat:cat.slice(0,40),prix,prixAvant:avant&&avant>prix?avant:null,promo:!!(avant&&avant>prix),info:$("p-info").value.trim().slice(0,160),ig,stock:$("p-stock").value,nouveau:$("p-nouveau").checked,vedette:$("p-vedette").checked,visible:$("p-visible").checked,photoUrl:brouillon.photoUrl,photo:brouillon.photo,ordre:ancien.ordre??-Date.now()};
  const b=$("p-ok"); b.disabled=true;
  try{ await sauverProduit(data); fermerTiroir(); toast(edition?"Produit enregistré.":"Produit ajouté à la boutique."); await chargerDonnees(); }
  catch(err){ echec(err); }
  finally{ b.disabled=false; }
});

async function enregistrerReglages(maj,msg){
  if(!await verifierSession()) return;
  const data={...reglages,...maj};
  const { error } = await sb.from("reglages").upsert({ id:"site", data });
  if(error){ echec(error); return; }
  if(msg) toast(msg); await chargerDonnees();
}
function couleurDominante(url){
  return new Promise(res=>{ const img=new Image();
    img.onload=()=>{ try{ const c=document.createElement("canvas"),n=64; c.width=c.height=n; const x=c.getContext("2d"); x.drawImage(img,0,0,n,n);
      const d=x.getImageData(0,0,n,n).data, seaux={};
      for(let i=0;i<d.length;i+=4){ if(d[i+3]<128) continue; const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b); if(mx-mn<60||mx<50) continue; const k=(r>>4)+","+(g>>4)+","+(b>>4); (seaux[k]=seaux[k]||[0,0,0,0]); seaux[k][0]+=r;seaux[k][1]+=g;seaux[k][2]+=b;seaux[k][3]++; }
      const top=Object.values(seaux).sort((a,b)=>b[3]-a[3])[0]; if(!top) return res(null);
      res("#"+[0,1,2].map(j=>Math.round(top[j]/top[3]).toString(16).padStart(2,"0")).join("")); }catch(_){res(null)} };
    img.onerror=()=>res(null); img.src=url; });
}
$("f-logo").onchange=async e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return; const couleur=await couleurDominante(URL.createObjectURL(f)); const url=await envoyerImage(f,$("depot-logo")); if(!url) return; await enregistrerReglages(couleur?{logoUrl:url,couleur}:{logoUrl:url}, couleur?`Logo enregistré. Couleur ${couleur} appliquée au site.`:"Logo enregistré."); };
$("couleur-ok").onclick=()=>enregistrerReglages({couleur:$("f-couleur").value},"Couleur appliquée.");
$("f-couleur").oninput=e=>appliquerCouleur(e.target.value);
$("wa-ok").onclick=()=>{ const n=$("f-wa").value.replace(/\D/g,""); const num=n.length===9?"221"+n:n; if(!/^\d{11,15}$/.test(num)){ toast("Numéro invalide : écris par exemple 221774856093."); return; } enregistrerReglages({whatsapp:num},"Numéro WhatsApp enregistré."); };

/* ---------- Mesure d'audience (anonyme, sans données personnelles) ---------- */
function suivre(type,pid){
  if(peutEnregistrer||document.body.classList.contains("mode-gerant")) return;
  try{ fetch(SUPABASE_URL+"/rest/v1/evenements",{method:"POST",keepalive:true,headers:{"apikey":SUPABASE_CLE,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({type,produit_id:pid?String(pid).slice(0,24):null})}).catch(()=>{}); }catch(_){}
}
document.addEventListener("click",e=>{
  const a=e.target.closest("a[href]"); if(!a) return;
  if(a.href.startsWith("https://wa.me/")) suivre("commande",a.dataset.pid||null);
  else if(/instagram\.com\/p\//.test(a.href)) suivre("instagram",a.dataset.pid||null);
},true);

/* ---------- Effets : progression, boutons magnétiques, parallaxe, lookbook ---------- */
addEventListener("scroll",()=>{ const h=document.documentElement; $("barre-progres").style.transform=`scaleX(${h.scrollTop/Math.max(1,h.scrollHeight-innerHeight)})`; },{passive:true});
if(FIN&&!REDUIT){
  document.addEventListener("pointermove",e=>{
    const b=e.target.closest(".btn-wa,.lien-sec,.etiq-hero button,.filtres button");
    document.querySelectorAll(".magnet").forEach(m=>{ if(m!==b){ m.style.transform=""; m.classList.remove("magnet"); } });
    if(!b||b.closest("#gerant")) return;
    const r=b.getBoundingClientRect(); b.classList.add("magnet");
    b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;
  },{passive:true});
  const scene=$("scene3d"), h1=document.querySelector(".hero h1");
  document.querySelector(".hero").addEventListener("pointermove",e=>{
    const x=e.clientX/innerWidth-.5, y=e.clientY/innerHeight-.5;
    if(!anneau.tire) scene.style.transform=`rotateY(${x*8}deg) rotateX(${-y*6}deg)`;
    h1.style.transform=`translate(${x*-14}px,${y*-10}px)`;
  });
  document.querySelector(".hero").addEventListener("pointerleave",()=>{ scene.style.transform=""; h1.style.transform=""; });
  h1.style.transition="transform .8s cubic-bezier(.2,.7,.1,1)";
}
function rendreLookbook(){
  const v=visibles().filter(p=>photoSrc(p)); if(!v.length) return;
  const carte=p=>`<a href="#catalogue" data-id="${esc(p.id)}" data-prix="${esc(p.nom)} · ${fcfa(p.prix)}" aria-label="${esc(p.nom)}"><img src="${esc(photoSrc(p))}" alt="" loading="lazy"></a>`;
  const moitie=Math.ceil(v.length/2), a=v.slice(0,moitie), b=v.slice(moitie).concat(v.slice(0,Math.max(0,moitie-(v.length-moitie))));
  $("lb-1").innerHTML=[...a,...a].map(carte).join(""); $("lb-2").innerHTML=[...b,...b].map(carte).join("");
}
document.getElementById("lookbook").addEventListener("click",e=>{ const a=e.target.closest("a[data-id]"); if(a){ e.preventDefault(); ouvrirFiche(a.dataset.id); } });
(function lookbookBoucle(){
  var pos=0, dernier=scrollY;
  (function f(){
    const dy=scrollY-dernier; dernier=scrollY;
    if(!REDUIT) pos+=.35+Math.min(Math.abs(dy)*.25,14);
    const r1=$("lb-1"), r2=$("lb-2");
    if(r1&&r1.scrollWidth){ const w1=r1.scrollWidth/2, w2=r2.scrollWidth/2;
      r1.style.transform=`translateX(${-(pos%w1)}px)`; r2.style.transform=`translateX(${(pos%w2)-w2}px)`; }
    requestAnimationFrame(f);
  })();
})();

/* =================== TABLEAU DE BORD =================== */
let joursBord=30;
document.querySelectorAll(".periode [data-jours]").forEach(b=>b.addEventListener("click",()=>{
  joursBord=Number(b.dataset.jours);
  document.querySelectorAll(".periode [data-jours]").forEach(x=>x.setAttribute("aria-pressed",x===b));
  chargerBord();
}));
const nomProduit=id=>{ const p=produits.find(x=>x.id===id); return p?p.nom:"Pièce retirée"; };
function kpiHTML(val,lib,sous){ return `<div class="kpi"><b>${val}</b><span>${lib}</span>${sous?`<small>${sous}</small>`:""}</div>`; }
function barres(jours,series,format){
  const n=jours.length; if(!n) return `<p class="vide-g">Pas encore de données.</p>`;
  const max=Math.max(1,...jours.map(j=>Math.max(...series.map(s=>j[s.cle]||0))));
  const W=600,H=170,pad=22,bw=(W-pad)/n, g=series.length;
  let out=`<svg viewBox="0 0 ${W} ${H+22}" role="img" aria-label="Graphique sur ${n} jours"><line x1="${pad}" y1="${H}" x2="${W}" y2="${H}" stroke="#EEE4E5"/><text x="0" y="12" font-size="11" fill="#6E6164">${format(max)}</text>`;
  jours.forEach((j,i)=>{ series.forEach((s,k)=>{ const v=j[s.cle]||0, h=Math.round(v/max*(H-20)), w=Math.max(1,(bw*.78)/g), x=pad+i*bw+bw*.11+k*w;
      out+=`<rect x="${x.toFixed(1)}" y="${H-h}" width="${w.toFixed(1)}" height="${h}" rx="${Math.min(3,w/2)}" fill="${s.couleur}"><title>${j.jour} · ${s.nom} : ${format(v)}</title></rect>`; });
    if(i===0||i===n-1||(n<=14)||(i%Math.ceil(n/6)===0)){ const d=j.jour.slice(8,10)+"/"+j.jour.slice(5,7); out+=`<text x="${(pad+i*bw+bw/2).toFixed(1)}" y="${H+16}" font-size="10" text-anchor="middle" fill="#6E6164">${d}</text>`; } });
  return out+"</svg>";
}
async function chargerBord(){
  if(!sb||!peutEnregistrer) return;
  $("bord-kpis").innerHTML=kpiHTML("…","Chargement");
  const [st,dem]=await Promise.all([
    sb.rpc("stats_boutique",{jours:joursBord}),
    sb.from("evenements").select("id,produit_id,created_at").eq("type","commande").order("created_at",{ascending:false}).limit(15)
  ]);
  if(st.error){ $("bord-kpis").innerHTML=kpiHTML("—","Statistiques indisponibles","Reconnecte-toi puis réessaie"); return; }
  const d=st.data, conv=d.visites?Math.round(d.demandes/d.visites*1000)/10:0, panier=d.ventes?Math.round(d.ca/d.ventes):0;
  $("bord-kpis").innerHTML=kpiHTML(d.visites,"visites",`sur ${d.jours} jours`)+kpiHTML(d.vues,"pièces consultées")+kpiHTML(d.demandes,"demandes WhatsApp",`${conv} % des visites`)+kpiHTML(d.ventes,"ventes confirmées")+kpiHTML(fcfa(d.ca),"chiffre d'affaires")+kpiHTML(fcfa(panier),"panier moyen");
  const rose=getComputedStyle(document.documentElement).getPropertyValue("--rouge").trim()||"#B5566D";
  $("graph-trafic").innerHTML=barres(d.par_jour,[{cle:"visites",nom:"Visites",couleur:"color-mix(in srgb,"+rose+" 28%,#fff)"},{cle:"demandes",nom:"Demandes",couleur:rose}],v=>String(v));
  $("graph-ca").innerHTML=d.ca?barres(d.par_jour,[{cle:"ca",nom:"Chiffre d'affaires",couleur:rose}],v=>fcfa(v)):`<p class="vide-g">Aucune vente enregistrée sur la période. Ajoute-les dans « Commandes et ventes ».</p>`;
  $("bord-top").innerHTML=d.top.length?`<ul class="liste-g">${d.top.map(t=>{ const p=produits.find(x=>x.id===t.produit_id), ps=p&&photoSrc(p);
      return `<li><span class="mini">${ps?`<img src="${esc(ps)}" alt="">`:""}</span><span class="nm">${esc(nomProduit(t.produit_id))}<small>${t.vues} vue${t.vues>1?"s":""}</small></span><span class="chiffre">${t.demandes} demande${t.demandes>1?"s":""}</span></li>`; }).join("")}</ul>`:`<p class="vide-l">Les pièces les plus regardées et demandées apparaîtront ici dès les premières visites.</p>`;
  const liste=dem.data||[];
  $("bord-demandes").innerHTML=liste.length?`<ul class="liste-g">${liste.map(x=>{ const quand=new Date(x.created_at).toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
      return `<li><span class="nm">${x.produit_id?esc(nomProduit(x.produit_id)):"Demande générale"}<small>${quand}</small></span><button class="b" type="button" data-vendre="${esc(x.produit_id||"")}">Confirmer la vente</button></li>`; }).join("")}</ul>`:`<p class="vide-l">Aucune demande pour le moment. Chaque clic sur « Commander » apparaîtra ici.</p>`;
}
$("bord-demandes").addEventListener("click",e=>{ const b=e.target.closest("[data-vendre]"); if(b) ouvrirCommande(null,b.dataset.vendre); });
$("bord-top").addEventListener("click",()=>{});

/* =================== COMMANDES =================== */
let commandes=[];
const STATUTS={nouvelle:"À traiter",confirmee:"Confirmée",livree:"Livrée",annulee:"Annulée"};
async function chargerCommandes(){
  if(!sb||!peutEnregistrer) return;
  const { data, error } = await sb.from("commandes").select("*").order("date_commande",{ascending:false}).limit(500);
  if(error){ $("cmd-table").innerHTML=`<p class="vide-l">Impossible de charger les commandes. Reconnecte-toi puis réessaie.</p>`; return; }
  commandes=data||[]; rendreCommandes();
}
function rendreCommandes(){
  const debutMois=new Date(); debutMois.setDate(1); debutMois.setHours(0,0,0,0);
  const valides=commandes.filter(c=>c.statut==="confirmee"||c.statut==="livree");
  const duMois=valides.filter(c=>new Date(c.date_commande)>=debutMois);
  $("cmd-kpis").innerHTML=kpiHTML(fcfa(duMois.reduce((a,c)=>a+c.montant,0)),"chiffre d'affaires du mois")+kpiHTML(duMois.length,"ventes ce mois-ci")+kpiHTML(commandes.filter(c=>c.statut==="nouvelle"||c.statut==="confirmee").length,"à livrer ou à traiter")+kpiHTML(fcfa(valides.reduce((a,c)=>a+c.montant,0)),"total depuis le début");
  const q=$("cmd-cherche").value.trim().toLowerCase(), st=$("cmd-statut").value;
  const liste=commandes.filter(c=>(!st||c.statut===st)&&(!q||(c.client+" "+c.articles+" "+c.telephone+" "+c.note).toLowerCase().includes(q)));
  if(!liste.length){ $("cmd-table").innerHTML=`<p class="vide-l">${commandes.length?"Aucune commande ne correspond.":"Aucune vente enregistrée. Clique sur « Nouvelle vente » après chaque commande conclue sur WhatsApp."}</p>`; return; }
  $("cmd-table").innerHTML=`<table><thead><tr><th>Date</th><th>Cliente</th><th>Articles</th><th>Montant</th><th>Statut</th><th><span class="sr">Actions</span></th></tr></thead><tbody>${liste.map(c=>`<tr>
    <td>${new Date(c.date_commande).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}</td>
    <td class="nm">${esc(c.client||"—")}<small>${esc(c.telephone||"")}</small></td>
    <td>${esc(c.articles||"—")}</td><td><b>${fcfa(c.montant)}</b></td>
    <td><label class="sr" for="st-${c.id}">Statut</label><select class="statut-sel" id="st-${c.id}" data-statut="${c.id}">${Object.entries(STATUTS).map(([k,v])=>`<option value="${k}" ${k===c.statut?"selected":""}>${v}</option>`).join("")}</select></td>
    <td><div class="actions-ligne"><button class="b" type="button" data-cmd-edit="${c.id}">Modifier</button><button class="b danger" type="button" data-cmd-del="${c.id}">Supprimer</button></div></td></tr>`).join("")}</tbody></table>`;
}
$("cmd-cherche").addEventListener("input",rendreCommandes);
$("cmd-statut").addEventListener("change",rendreCommandes);
$("cmd-table").addEventListener("change",async e=>{
  const s=e.target.closest("[data-statut]"); if(!s) return;
  if(!await verifierSession()) return;
  const { error } = await sb.from("commandes").update({statut:s.value}).eq("id",s.dataset.statut);
  if(error) echec(error); else { toast(`Commande : ${STATUTS[s.value]}.`); chargerCommandes(); }
});
$("cmd-table").addEventListener("click",async e=>{
  const ed=e.target.closest("[data-cmd-edit]"), de=e.target.closest("[data-cmd-del]");
  if(ed) ouvrirCommande(ed.dataset.cmdEdit);
  if(de&&await confirmer("Supprimer cette commande du registre ? Cette action est définitive.")){
    if(!await verifierSession()) return;
    const { error } = await sb.from("commandes").delete().eq("id",de.dataset.cmdDel);
    if(error) echec(error); else { toast("Commande supprimée."); chargerCommandes(); }
  }
});
let cmdEdition=null;
const versLocal=d=>{ const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,16); };
function ouvrirCommande(id,pid){
  cmdEdition=id||null;
  const c=id?commandes.find(x=>x.id===id):{client:"",telephone:"",articles:"",montant:"",statut:"confirmee",note:"",produit_id:pid||"",date_commande:new Date().toISOString()};
  $("c-titre").textContent=id?"Modifier la vente":"Nouvelle vente";
  $("c-produit").innerHTML=`<option value="">Autre / plusieurs pièces</option>`+produits.slice().sort((a,b)=>a.nom.localeCompare(b.nom,"fr")).map(p=>`<option value="${esc(p.id)}">${esc(p.nom)} · ${fcfa(p.prix)}</option>`).join("");
  $("c-produit").value=c.produit_id||"";
  const p=produits.find(x=>x.id===c.produit_id);
  $("c-articles").value=c.articles||(p?p.nom:""); $("c-montant").value=c.montant||(p?p.prix:"");
  $("c-statut").value=c.statut; $("c-client").value=c.client; $("c-tel").value=c.telephone; $("c-note").value=c.note; $("c-date").value=versLocal(c.date_commande);
  $("tiroir-cmd").classList.add("ouvert"); setTimeout(()=>$("c-produit").focus(),300);
}
$("c-produit").addEventListener("change",()=>{ const p=produits.find(x=>x.id===$("c-produit").value); if(p){ $("c-articles").value=p.nom; $("c-montant").value=p.prix; } });
document.querySelectorAll("[data-fermer-cmd]").forEach(b=>b.onclick=()=>$("tiroir-cmd").classList.remove("ouvert"));
$("cmd-nouvelle").onclick=()=>ouvrirCommande();
$("form-cmd").addEventListener("submit",async e=>{
  e.preventDefault();
  const montant=Number($("c-montant").value);
  if(!(montant>=0)||$("c-montant").value===""){ toast("Indique le montant de la vente."); return; }
  if(!await verifierSession()) return;
  const data={client:$("c-client").value.trim().slice(0,80),telephone:$("c-tel").value.trim().slice(0,30),articles:$("c-articles").value.trim().slice(0,500),produit_id:$("c-produit").value||null,montant:Math.round(montant),statut:$("c-statut").value,note:$("c-note").value.trim().slice(0,500),date_commande:$("c-date").value?new Date($("c-date").value).toISOString():new Date().toISOString()};
  const b=$("c-ok"); b.disabled=true;
  const { error } = cmdEdition? await sb.from("commandes").update(data).eq("id",cmdEdition) : await sb.from("commandes").insert(data);
  b.disabled=false;
  if(error){ echec(error); return; }
  $("tiroir-cmd").classList.remove("ouvert"); toast(cmdEdition?"Vente modifiée.":"Vente enregistrée.");
  await chargerCommandes(); if(vueActive==="bord") chargerBord();
});
$("cmd-export").onclick=()=>{
  if(!commandes.length){ toast("Aucune commande à exporter."); return; }
  const c=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const lignes=[["Date","Cliente","Téléphone","Articles","Montant (F CFA)","Statut","Note"].map(c).join(";")].concat(commandes.map(x=>[new Date(x.date_commande).toLocaleString("fr-FR"),x.client,x.telephone,x.articles,x.montant,STATUTS[x.statut],x.note].map(c).join(";")));
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob(["﻿"+lignes.join("\n")],{type:"text/csv;charset=utf-8"})); a.download=`zonedeluxxe-commandes-${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
};

/* =================== TEXTES DU SITE =================== */
function rendreTextes(){
  const t=reglages.textes||{};
  $("txt-form").innerHTML=Object.keys(TXT_DEFAUT).map(k=>{ const v=typeof t[k]==="string"?t[k]:(k==="accroche"&&reglages.accroche?reglages.accroche:""); const long=TXT_DEFAUT[k].length>60;
    return `<div class="champ${v?" modifie":""}"><label for="tx-${k}">${esc(TXT_LABEL[k])}</label><textarea id="tx-${k}" data-cle="${k}" rows="${long?3:1}" maxlength="400" placeholder="${esc(TXT_DEFAUT[k])}">${esc(v)}</textarea></div>`; }).join("");
}
$("txt-ok").onclick=async()=>{
  const textes={}; $("txt-form").querySelectorAll("[data-cle]").forEach(el=>{ const v=el.value.trim(); if(v&&v!==TXT_DEFAUT[el.dataset.cle]) textes[el.dataset.cle]=v.slice(0,400); });
  await enregistrerReglages({textes,accroche:null},"Textes enregistrés. Ils sont en ligne."); rendreTextes();
};
$("txt-retablir").onclick=async()=>{ if(await confirmer("Remettre tous les textes d'origine ?")){ await enregistrerReglages({textes:{},accroche:null},"Textes d'origine rétablis."); rendreTextes(); } };

/* ---------- Données depuis Supabase ---------- */
async function chargerDonnees(){
  if(!sb) return;
  const [p, r] = await Promise.all([
    sb.from("produits").select("id,data,ordre").order("ordre"),
    sb.from("reglages").select("data").eq("id","site").maybeSingle()
  ]);
  if(!p.error && p.data && p.data.length) produits=p.data.map(x=>({...x.data,id:x.id,ordre:x.ordre}));
  if(!r.error && r.data) reglages=r.data.data||{};
  toutRendre();
}
(async()=>{
  if(window.supabase&&supabase.createClient){
    let stockage; try{ stockage=window.sessionStorage; stockage.setItem("_t","1"); stockage.removeItem("_t"); }catch(_){ stockage=undefined; }
    sb=supabase.createClient(SUPABASE_URL,SUPABASE_CLE,{auth:{storage:stockage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    try{ await chargerDonnees(); }catch(_){}
  }
  routeur();
  try{ if(!sessionStorage.getItem("zdl-v")){ sessionStorage.setItem("zdl-v","1"); setTimeout(()=>suivre("visite"),1500); } }catch(_){}
})();
