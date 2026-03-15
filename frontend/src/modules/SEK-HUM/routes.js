import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-hum", element: <ListPage /> },
  { path: "/sek-hum/new", element: <FormPage /> },
  { path: "/sek-hum/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-hum/:id", element: <DetailPage /> },
];
