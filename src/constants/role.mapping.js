let ROLE = {
  Worker: [
    {
      module_name: "Dashboard",
      module_path: "dashboard",
      component_name: "DashboardComponent",
    }
  ],
  Supervisor: [
    {
      module_name: "Dashboard",
      module_path: "dashboard",
      component_name: "DashboardComponent",
    }
  ],
  Admin: [
    {
      module_name: "Dashboard",
      module_path: "dashboard",
      component_name: "DashboardComponent",
    },
    {
      module_name: "Capex Request",
      module_path: "capex-request",
      component_name: "CapexRequestComponent",
    },
  ],
};

module.exports = ROLE;
