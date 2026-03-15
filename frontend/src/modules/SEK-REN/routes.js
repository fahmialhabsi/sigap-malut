import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-ren", element: <ListPage /> },
  { path: "/sek-ren/new", element: <FormPage /> },
  { path: "/sek-ren/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-ren/:id", element: <DetailPage /> },
];
