export function autoresize(el) {
	
  const onChange = ()=>{
    const baseHeight = 100;
    const dynamic = (el.scrollHeight);
    el.style.cssText = 'height:auto; padding:0';
    el.style.cssText = 'height:' + (dynamic > baseHeight ? dynamic : baseHeight) + 'px';
  }

  el.addEventListener('input', onChange);
  el.addEventListener('focus', onChange);
  return {
    destroy() {
      el.removeEventListener('input', onChange);
      el.removeEventListener('focus', onChange);
    }
  }

}