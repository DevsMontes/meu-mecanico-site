(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const search = $('#archive-search'), kind = $('#archive-kind'), year = $('#archive-year');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  if (search && kind && year) {
    const entries = [...document.querySelectorAll('.archive-entry')];
    function filterArchive() {
      const query = normalize(search.value); let count = 0;
      entries.forEach(entry => {
        const visible = (!query || normalize(entry.dataset.search).includes(query)) && (!kind.value || kind.value === entry.dataset.kind) && (!year.value || year.value === entry.dataset.year);
        entry.hidden = !visible; if (visible) count++;
      });
      $('#archive-count').textContent = `${count} ${count === 1 ? 'publicação' : 'publicações'}`;
      $('#archive-empty').hidden = count !== 0;
    }
    search.addEventListener('input',filterArchive);
    kind.addEventListener('change',filterArchive); year.addEventListener('change',filterArchive);
    $('#archive-reset').addEventListener('click',()=>{search.value='';kind.value='';year.value='';filterArchive();search.focus();});
  }
  let ticking = false;
  const progress = $('.reading-progress i');
  function paint() {
    if (progress) {const total=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${total>0?Math.min(1,scrollY/total):0})`;}
    ticking=false;
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(paint);}},{passive:true});
  paint();
})();
