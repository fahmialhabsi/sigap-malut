import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-keu", element: <ListPage /> },
  { path: "/sek-keu/new", element: <FormPage /> },
  { path: "/sek-keu/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-keu/:id", element: <DetailPage /> },
];
