import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-rmh", element: <ListPage /> },
  { path: "/sek-rmh/new", element: <FormPage /> },
  { path: "/sek-rmh/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-rmh/:id", element: <DetailPage /> },
];
