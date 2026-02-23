import BaseTable from '../../components/base/BaseTable';

export default function M056ListPage() {
  return (
    <BaseTable 
      endpoint="/konsumsi_pangan"
      title="Data Konsumsi Pangan"
      icon="utensils"
      moduleId="m056"
    />
  );
}
