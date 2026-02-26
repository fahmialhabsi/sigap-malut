import BaseTable from '../../components/base/BaseTable';

export default function M019ListPage() {
  return (
    <BaseTable 
      endpoint="/mutasi_aset"
      title="Mutasi Aset"
      icon="arrow-right-circle"
      moduleId="m019"
    />
  );
}
