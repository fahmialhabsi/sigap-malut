import BaseTable from '../../components/base/BaseTable';

export default function M037ListPage() {
  return (
    <BaseTable 
      endpoint="/indeks_ketahanan"
      title="Indeks Ketahanan Pangan"
      icon="chart-bar-square"
      moduleId="m037"
    />
  );
}
