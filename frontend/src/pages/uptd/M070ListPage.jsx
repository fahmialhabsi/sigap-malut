import BaseTable from '../../components/base/BaseTable';

export default function M070ListPage() {
  return (
    <BaseTable 
      endpoint="/sertifikasi_gfp"
      title="Sertifikasi GFP"
      icon="globe-alt"
      moduleId="m070"
    />
  );
}
