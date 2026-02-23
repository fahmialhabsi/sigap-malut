import BaseTable from '../../components/base/BaseTable';

export default function M022ListPage() {
  return (
    <BaseTable 
      endpoint="/spj"
      title="SPJ (Surat Pertanggungjawaban)"
      icon="receipt-percent"
      moduleId="m022"
    />
  );
}
