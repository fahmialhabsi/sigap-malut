import BaseTable from '../../components/base/BaseTable';

export default function M035ListPage() {
  return (
    <BaseTable 
      endpoint="/neraca_pangan"
      title="Neraca Pangan"
      icon="scale"
      moduleId="m035"
    />
  );
}
