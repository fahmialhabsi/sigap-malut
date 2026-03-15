import ListPage from "./ListPage";
import FormPage from "./FormPage";
import DetailPage from "./DetailPage";

export const routes = [
  { path: "/sek-lds", element: <ListPage /> },
  { path: "/sek-lds/new", element: <FormPage /> },
  { path: "/sek-lds/edit/:id", element: <FormPage isEdit /> },
  { path: "/sek-lds/:id", element: <DetailPage /> },
];
