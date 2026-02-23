import BaseTable from '../../components/base/BaseTable';

export default function M040ListPage() {
  return (
    <BaseTable 
      endpoint="/luas_panen"
      title="Luas Panen"
      icon="arrows-pointing-out"
      moduleId="m040"
    />
  );
}
