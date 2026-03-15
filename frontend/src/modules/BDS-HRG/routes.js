import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/bds-hrg", element: <ListPage /> },
  { path: "/bds-hrg/new", element: <FormPage /> },
  { path: "/bds-hrg/edit/:id", element: <FormPage isEdit /> },
  { path: "/bds-hrg/:id", element: <DetailPage /> },
];
