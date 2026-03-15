import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-lks", element: <ListPage /> },
  { path: "/sek-lks/new", element: <FormPage /> },
  { path: "/sek-lks/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-lks/:id", element: <DetailPage /> },
];
