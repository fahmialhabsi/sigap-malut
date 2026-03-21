import React from "react";
import KpiTile from "../components/KpiTile";

export default {
  title: "Komponen/KpiTile",
  component: KpiTile,
};

const Template = (args) => <KpiTile {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Compliance Alur Koordinasi",
  value: 0.94,
  unit: "ratio",
  trend: [0.85, 0.88, 0.92, 0.94],
  source: "audit_log",
};
