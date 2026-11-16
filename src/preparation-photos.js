(function (root, factory) {
  const photo = factory();
  if (typeof module === "object" && module.exports) module.exports = photo;
  else root.preparationPhoto = photo;
})(typeof window !== "undefined" ? window : this, function () {
  const coverage = new Set(["chocolate-ao-leite", "chocolate-branco", "chocolate-meio-amargo", "avela", "pistache", "morango"]);
  const toppings = new Set(["granulado", "amendoim", "chocoball", "farofa-de-pacoca", "gotas-de-cookies", "ovomaltine", "cookies-baunilha"]);

  return function preparationPhoto(description, kind) {
    const name = String(description || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const key = name.replace(/^cobertura[\s:-]+/, "").replace(/[\s:-]+topping$/, "").replace(/\s+/g, "-");
    if ((kind === "coverage" || (!kind && /^cobertura\b/.test(name))) && coverage.has(key)) {
      return `/assets/tortela/preparation/cobertura-${key}.webp`;
    }
    if ((kind === "topping" || (!kind && /\btopping$/.test(name))) && toppings.has(key)) {
      return `/assets/tortela/preparation/topping-${key}.webp`;
    }
    return "";
  };
});
