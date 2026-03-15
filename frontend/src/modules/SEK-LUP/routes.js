import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-lup", element: <ListPage /> },
  { path: "/sek-lup/new", element: <FormPage /> },
  { path: "/sek-lup/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-lup/:id", element: <DetailPage /> },
];
