import KpiTile from "./KpiTile";
export default { title: "Dashboard/KpiTile", component: KpiTile };
export const Default = () => (
  <KpiTile label="Compliance" value={94} delta={2.1} icon="📈" unit="%" />
);
