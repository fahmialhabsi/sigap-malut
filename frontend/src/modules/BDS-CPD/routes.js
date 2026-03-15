import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-cpd", element: <ListPage /> },
  { path: "/bds-cpd/new", element: <FormPage /> },
  { path: "/bds-cpd/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-cpd/:id", element: <DetailPage /> },
];
