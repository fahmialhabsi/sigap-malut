import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-keu", element: <ListPage /> },
  { path: "/upt-keu/new", element: <FormPage /> },
  { path: "/upt-keu/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-keu/:id", element: <DetailPage /> },
];
