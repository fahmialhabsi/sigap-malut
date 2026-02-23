import BaseTable from '../../components/base/BaseTable';

export default function M015ListPage() {
  return (
    <BaseTable 
      endpoint="/notulensi"
      title="Notulensi Rapat"
      icon="document-text"
      moduleId="m015"
    />
  );
}
