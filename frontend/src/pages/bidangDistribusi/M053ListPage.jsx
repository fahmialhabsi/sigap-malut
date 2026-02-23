import BaseTable from '../../components/base/BaseTable';

export default function M053ListPage() {
  return (
    <BaseTable 
      endpoint="/bantuan_pangan"
      title="Bantuan Pangan Pemerintah"
      icon="gift"
      moduleId="m053"
    />
  );
}
