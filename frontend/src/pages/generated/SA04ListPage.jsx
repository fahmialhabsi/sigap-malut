import BaseTable from '../../components/base/BaseTable';

export default function SA04ListPage() {
  return (
    <BaseTable 
      endpoint="/peraturan"
      title="Repositori Peraturan"
      icon="book-open"
      moduleId="sa04"
    />
  );
}
