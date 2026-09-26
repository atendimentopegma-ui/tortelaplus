const { spawnSync } = require("child_process");

const checks = [
  ["verify", "Sintaxe geral e arquivos principais"],
  ["verify:backoffice", "Retaguarda, login local e configuracoes"],
  ["verify:products", "Produtos, combos, coberturas e adicionais"],
  ["verify:stock", "Estoque e baixa automatica"],
  ["verify:finance", "Financeiro, recebiveis e cancelamento"],
  ["verify:security", "Sessao, permissoes, isolamento e token publico"],
  ["verify:polish", "Falhas temporarias e duplo envio"],
  ["verify:pdv", "PDV, caixa, fiscal pendente e estorno"],
  ["verify:kitchen", "Cozinha e telao"],
  ["verify:kiosk", "Totem, pedido, cozinha, telao e isolamento"],
  ["verify:monitoring", "Monitoramento operacional da Central"],
  ["verify:backup", "Backup e restauracao segura"],
  ["verify:reform-fields", "Campos da reforma fiscal IBS/CBS/IS"],
  ["verify:operational", "Revisao operacional final sem dados reais"],
  ["verify:implantation", "Prontidao tecnica de implantacao"],
  ["verify:post-deploy", "Dominio real app/rede depois do deploy"]
];

const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

for (const [script, label] of checks) {
  console.log(`\n===== ${script} - ${label} =====`);
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm", "run", script] : ["run", script];
  const result = spawnSync(npmCommand, args, { stdio: "inherit" });
  if (result.error) {
    console.error(`\nFALHA - nao foi possivel executar ${script}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\nFALHA - regressao interrompida em ${script}.`);
    process.exit(result.status || 1);
  }
}

console.log("\nOK - regressao tecnica completa do Tortela Plus validada.");
