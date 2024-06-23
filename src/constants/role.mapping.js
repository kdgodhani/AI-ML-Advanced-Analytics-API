let ROLE = {
  Customer: [
    {
      module_name: "Product",
      module_path: "product",
      component_name: "Product",
    }
  ],
  Admin: [
    {
      module_name: "Product",
      module_path: "product",
      component_name: "Product",
    },
    {
      module_name: "Report Dashboard",
      module_path: "report-dashboard",
      component_name: "ReportDashboard",
    },
  ],
};

module.exports = ROLE;
