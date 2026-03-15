import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-adm", element: <ListPage /> },
  { path: "/upt-adm/new", element: <FormPage /> },
  { path: "/upt-adm/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-adm/:id", element: <DetailPage /> },
];
