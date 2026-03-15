import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-lkt", element: <ListPage /> },
  { path: "/sek-lkt/new", element: <FormPage /> },
  { path: "/sek-lkt/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-lkt/:id", element: <DetailPage /> },
];
