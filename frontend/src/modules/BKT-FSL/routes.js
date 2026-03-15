import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bkt-fsl", element: <ListPage /> },
  { path: "/bkt-fsl/new", element: <FormPage /> },
  { path: "/bkt-fsl/edit/:id", element: <FormPage isEdit /> },
  { path: "/bkt-fsl/:id", element: <DetailPage /> },
];
