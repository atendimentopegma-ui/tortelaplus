const centralPermissions = ["overview", "sales", "products", "orders", "promotions", "royalties", "customers", "finance", "permissions", "terminals", "production", "deployment", "reports", "franchisees", "users", "fiscal", "fiscal_cancel"];
const permissionsFor = user => Array.isArray(user.permissions) ? user.permissions.filter(p => centralPermissions.includes(p)) : [...centralPermissions];
const fullAccess = user => centralPermissions.every(p => permissionsFor(user).includes(p));
function routePermissions(path) {
  if (path.startsWith("/api/provider/auth/")) return [];
  if (path === "/api/network/summary") return [];
  if (path === "/api/provider/company-profile") return ["deployment"];
  if (/^\/api\/tenant\/[^/]+\/company-profile$/.test(path)) return ["franchisees"];
  if (/^\/api\/tenant\/[^/]+\/fiscal\/settings(?:\/connection)?$/.test(path)) return ["franchisees", "fiscal"];
  if (path === "/api/network/franchisees") return ["franchisees"];
  if (path.startsWith("/api/provider/admins")) return ["users"];
  if (path === "/api/tenants" || /^\/api\/provider\/tenant\/[^/]+(?:\/users(?:\/\d+)?)?$/.test(path)) return ["franchisees"];
  if (/^\/api\/provider\/tenant\/[^/]+\/sessions$/.test(path) || path.startsWith("/api/licenses/")) return ["permissions"];
  if (/^\/api\/tenant\/[^/]+\/pdv-terminals$/.test(path)) return ["terminals"];
  if (/^\/api\/tenant\/[^/]+\/fiscal\/documents$/.test(path)) return ['fiscal'];
  if (/^\/api\/tenant\/[^/]+\/fiscal\/cancel$/.test(path)) return ['fiscal_cancel'];
  if (path === "/api/network/promotions") return ["promotions"];
  if (path === "/api/network/approvals/decide") return ["orders"];
  if (path === "/api/network/whatsapp/settings") return ["customers"];
  if (path === "/api/network/royalties/generate") return ["royalties"];
  if (["/api/provider", "/api/state", "/api/provider/monitoring", "/api/deployment/readiness"].includes(path) || /^\/api\/provider\/(?:backup|restore)-all$/.test(path)) return ["deployment"];
  return null;
}
function centralRouteAllowed(user, path) {
  if (fullAccess(user)) return true;
  const required = routePermissions(path);
  return required !== null && required.every(p => permissionsFor(user).includes(p));
}
function scopedSummary(summary, user) {
  const rights = permissionsFor(user);
  const result = { generatedAt: summary.generatedAt, centralPermissions: rights, centralUser: { id:user.id, name:user.name, username:user.username }, permissions: (summary.permissions || []).map(row=>({tenantCode:row.tenantCode,unit:row.unit,tradeName:row.tradeName})) };
  if (fullAccess(user)) return {...summary, ...result, permissions:summary.permissions};
  const groups = {
    overview:["units","totals","periods"], sales:["salesDetails","periods","totals"], products:["bestSellers","worstSellers","lowStockItems"],
    orders:["automaticOrders","approvalRequests","manualStockDrops"], promotions:["promotions"], royalties:["royalties"],
    customers:["customerConsumption","inactiveCustomers","whatsapp","whatsappGroupLeads","whatsappGroupQueue"], finance:["finance"],
    permissions:["permissions"], production:["productionCapacity"], deployment:["deployment","databaseIsolation","fiscalSettings"],
    reports:["units","totals","periods","salesDetails","finance","lowStockItems","productionCapacity","fiscalSettings"]
  };
  for (const permission of rights) for (const key of groups[permission] || []) if (summary[key] !== undefined) result[key] = summary[key];
  return result;
}
module.exports = {centralPermissions, permissionsFor, fullAccess, centralRouteAllowed, scopedSummary};
