import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-adm", element: <ListPage /> },
  { path: "/sek-adm/new", element: <FormPage /> },
  { path: "/sek-adm/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-adm/:id", element: <DetailPage /> },
];
