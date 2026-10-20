(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TortelaFiscalRegimes = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const regimes = [
    { name: 'Simples Nacional', crt: '1' },
    { name: 'Simples Nacional - Excesso de Sublimite', crt: '2' },
    { name: 'MEI', crt: '4' },
    { name: 'Lucro Presumido', crt: '3' },
    { name: 'Lucro Real', crt: '3' },
    { name: 'Lucro Arbitrado', crt: '3' }
  ];
  function profile(settings = {}) {
    const regime = regimes.find(item => item.name === settings.regime);
    const crt = String(settings.crt || regime?.crt || '');
    const errors = [];
    if (!regime) errors.push('regime tributario desconhecido');
    if (!['1','2','3','4'].includes(crt)) errors.push('CRT invalido');
    const compatible = regime && (crt === regime.crt || settings.regime === 'Simples Nacional' && crt === '2');
    if (regime && !compatible) errors.push('CRT incompativel com o regime tributario');
    const icmsSimple = ['1','4'].includes(crt), mei = crt === '4';
    const icmsCodes = mei ? ['102','300','400','900'] : icmsSimple
      ? ['101','102','103','300','400','500','900'] : ['00','02','15','20','40','41','50','51','53','60','61','90'];
    const nfceCodes = mei ? ['102','300'] : icmsSimple
      ? ['102','103','300','400','500','900'] : ['00','20','40','41','60','61','90'];
    return { crt, errors, icmsSimple, federalSimple: ['1','2','4'].includes(crt), mei, icmsCodes, nfceCodes };
  }
  return { regimes, profile };
});
