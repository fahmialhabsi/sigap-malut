import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-kep", element: <ListPage /> },
  { path: "/sek-kep/new", element: <FormPage /> },
  { path: "/sek-kep/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-kep/:id", element: <DetailPage /> },
];
