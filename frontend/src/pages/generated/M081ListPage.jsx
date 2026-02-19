import BaseTable from '../../components/base/BaseTable';

export default function M081ListPage() {
  return (
    <BaseTable 
      endpoint="/laporan_masyarakat"
      title="Laporan Masyarakat"
      icon="chat-bubble-left-right"
      moduleId="m081"
    />
  );
}
