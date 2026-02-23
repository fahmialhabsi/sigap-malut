import BaseTable from '../../components/base/BaseTable';

export default function M010ListPage() {
  return (
    <BaseTable 
      endpoint="/arsip_kepegawaian"
      title="Arsip Digital Kepegawaian"
      icon="archive-box"
      moduleId="m010"
    />
  );
}
