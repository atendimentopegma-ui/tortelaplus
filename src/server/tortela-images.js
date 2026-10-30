const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const images={'duplo chocolate':'duplo-chocolate','banoffe':'banoffee','banoffee':'banoffee','chocomaltine':'chocomaltine','limao':'limao','morango':'morango','ninho com nutella':'ninho-nutella','ninho com nutela':'ninho-nutella'};
function photo(product){const name=normalize(product.description);if(!/^(tortela|famosinha) /.test(name))return '';const file=images[name.replace(/^(tortela|famosinha) /,'').trim()];return file?'/assets/tortela/flavors/'+file+'.svg?v=20261030':'';}
function apply(product){const image=photo(product);return image?{...product,photo:image}:product;}
module.exports={photo,apply};
