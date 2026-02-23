import BaseTable from '../../components/base/BaseTable';

export default function SA02ListPage() {
  return (
    <BaseTable 
      endpoint="/dynamic_modules"
      title="Dynamic Module Generator"
      icon="puzzle-piece"
      moduleId="sa02"
    />
  );
}
