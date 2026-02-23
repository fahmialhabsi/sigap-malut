import React from "react";
import AlertList from "../components/AlertList";

export default {
  title: "Komponen/AlertList",
  component: AlertList,
};

const Template = (args) => <AlertList {...args} />;

export const Default = Template.bind({});
Default.args = {
  alerts: [
    {
      id: "a1",
      severity: "critical",
      title: "KGB Terlambat: Siti",
      summary: "Terlewat 59 hari",
    },
    {
      id: "a2",
      severity: "warning",
      title: "Bypass detected",
      summary: "Bendahara submit SPJ langsung ke Kadis",
    },
  ],
};
