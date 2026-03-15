import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/upt-kep", element: <ListPage /> },
  { path: "/upt-kep/new", element: <FormPage /> },
  { path: "/upt-kep/edit/:id", element: <FormPage isEdit /> },
  { path: "/upt-kep/:id", element: <DetailPage /> },
];
