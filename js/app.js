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
const WA="221774856093";
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
document.querySelectorAll("[data-wa]").forEach(a=>a.href=waLink(a.dataset.wa));

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
        ${lienIg(p)?`<a class="lien-ig" href="${esc(lienIg(p))}" target="_blank" rel="noopener" data-ig><svg aria-hidden="true"><use href="#ico-ig"/></svg>Voir la vidéo<span class="sr"> de ${esc(p.nom)} sur Instagram</span></a>`:""}
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
      <p>Livraison immédiate. Indique ta taille et ta couleur dans le message.</p>
      <a class="btn-wa" href="${waLink(epuise?`Bonjour Zonedeluxxe, la pièce ${p.nom} va-t-elle revenir ?`:`Bonjour Zonedeluxxe, je voudrais commander : ${p.nom} (${fcfa(p.prix)}). Ma taille et ma couleur : `)}"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ico-wa"/></svg>${epuise?"Demander le retour":"Commander sur WhatsApp"}</a>
      ${lienIg(p)?`<a class="btn-ig" href="${esc(lienIg(p))}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#ico-ig"/></svg>Voir la vidéo sur Instagram</a>`:""}
    </div></div>`;
  d.querySelector(".fermer").onclick=()=>d.close();
  d.showModal();
}
$("fiche").addEventListener("click",e=>{ if(e.target.id==="fiche") e.target.close(); });
$("fiche").addEventListener("close",e=>e.target.innerHTML="");

/* ---------- Univers ---------- */
$("univers-liste").innerHTML=UNIVERS.map(u=>`<a href="${waLink(`Bonjour Zonedeluxxe, je voudrais voir vos ${u.n.toLowerCase()} disponibles et leurs prix.`)}"><b>${u.n}</b><span>${u.d}</span><em>Demander la sélection</em></a>`).join("");

function toutRendre(){
  appliquerCouleur(reglages.couleur); peindreLogo();
  if(reglages.accroche) $("accroche").textContent=reglages.accroche;
  rendreAnneau(); rendreBande(); rendreDefile(); rendreFiltres(); rendreGrille(false);
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
  rendreGerant();
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
document.querySelectorAll(".g-side [data-vue]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".g-side [data-vue]").forEach(x=>x.setAttribute("aria-current",x===b));
  $("vue-produits").hidden=b.dataset.vue!=="produits"; $("vue-apparence").hidden=b.dataset.vue!=="apparence";
}));
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
  $("f-accroche").value=reglages.accroche||$("accroche").textContent;
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
$("accroche-ok").onclick=()=>enregistrerReglages({accroche:$("f-accroche").value.trim().slice(0,400)},"Texte enregistré.");

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
})();
