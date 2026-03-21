import BaseTable from '../../components/base/BaseTable';

export default function M001ListPage() {
  return (
    <BaseTable 
      endpoint="/asn"
      title="Data ASN"
      icon="user-group"
      moduleId="m001"
    />
  );
}
