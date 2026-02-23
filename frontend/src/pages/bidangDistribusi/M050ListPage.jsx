import BaseTable from '../../components/base/BaseTable';

export default function M050ListPage() {
  return (
    <BaseTable 
      endpoint="/pelepasan_cadangan"
      title="Pelepasan Cadangan"
      icon="arrow-up-tray"
      moduleId="m050"
    />
  );
}
